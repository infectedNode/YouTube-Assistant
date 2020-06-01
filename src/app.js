const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const jwt = require('jsonwebtoken');

const {db} = require('./db/firestore');
const {oauth2Client} = require('./youtube/youtube');
const {agent} = require('./dialogflow/agent');

var app = express();

// Adding necessary Headers to handle Client side requests
app.use(cors());

app.use(bodyParser.json());

app.set('view engine', 'hbs');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home.hbs');
});

app.post('/agent', agent);

app.get('/oauthcallback/', (req, res) => {
  let state = req.query.state;
  let code = req.query.code; 
  let error = req.query.error;

  const JWT_SALT = process.env.JWT_SALT;   // Salt Code for encryption

  if(state && code && !error) {
    jwt.verify(state, JWT_SALT, (err, decoded) => {
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
    jwt.verify(state, JWT_SALT, (err, decoded) => {
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