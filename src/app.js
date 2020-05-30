const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const moment = require('moment');
const hbs = require('hbs');
const cors = require('cors');

const {db} = require('./db/firestore');
const {agent} = require('./dialogflow/agent');

var app = express();

// Adding necessary Headers to handle Client side requests
app.use(cors());

app.use(bodyParser.json());

app.set('view engine', 'hbs');

app.use(express.static('public'));

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

// Simple format function
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

app.get('/', (req, res) => {
  res.render('home.hbs');
});

app.post('/agent', agent);

app.get('/email', (req, res) => {
  // res.render('email.hbs');
  var url = 'https://youtube-assistant.herokuapp.com';
  transporter.sendMail({
    to: `shivam231198@gmail.com`,
    from: 'My-YouTuber-Channel@youtube-assistant.herokuapp.com',
    subject: 'YouTube Access Link',
    html: compiledTemplate.render({url})
  }).then(() => {
    res.redirect('/');
  }).catch(e => console.log(e));
});

app.get('/oauthcallback/', (req, res) => {
  var state = req.query.state;
  var code = req.query.code; 
  var error = req.query.error;

  if(state && code && !error) {
    jwt.verify(state, '123abc', (err, decoded) => {
      if(err) {
        return res.render('error.hbs', {
          msg1: 'Request got Cancelled',
          msg2: 'There is a problem reading your URL. Please try again.'
        });
      }

      let {email} = decoded;
      db.collection('users').doc(`${email}`).get().then((doc) => {
        if(!doc.exists){
          return res.render('error.hbs', {
            msg1: 'Account does Not Exists ...',
            email: email,
            msg2: 'Your Data has been removed from the Database.'
          });
        }
        let data = doc.data();
        if(data.token !== null) {
          return res.render('error.hbs', {
            msg1: 'Access to this Account already Exists ...',
            email: email,
            msg2: 'You can only link one channel to a single Email Id.'
          });
        }
        oauth2Client.getToken(code).then((result) => {
          let token = result.tokens;
          db.collection('users').doc(`${email}`).update({token}).then(() => {
            res.render('success.hbs', {
              msg1: 'Access granted Successfully ...',
              email: email,
              msg2: 'Now you can go to the app and get latest updates about your YouTube Channel.'
            });
          });
        });
      }).catch((err) => {
        res.render('alert.hbs', {
          msg1: 'Access got Denied ...',
          email: email,
          msg2: 'There is a problem while connecting to the database. Please try again after some time.'
        });        
      });
    });
  } else if(state && (error === 'access_denied')) {
    jwt.verify(state, '123abc', (err, decoded) => {
      if(err) {
        return res.render('error.hbs', {
          msg1: 'Request got Cancelled',
          msg2: 'There is a problem reading your URL. Please try again.'
        });
      }
      let {email} = decoded;
      res.render('alert.hbs', {
        msg1: 'Access got Denied ...',
        email: email,
        msg2: 'In order to use this application, it is nesessary to give your YouTube Data Access.'
      });
    });  
  } else {
    res.redirect('/');
  }
});

let port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});