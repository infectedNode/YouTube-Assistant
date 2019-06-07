const express = require('express');
const admin = require('firebase-admin');
const {
  dialogflow,
  Image,
  SignIn,
  NewSurface,
  Suggestions,
  BasicCard,
  Button
} = require('actions-on-google');  
const {google} = require('googleapis');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

var agent = dialogflow({
  debug: true,
  clientId: '122184330678-o5i7c2s7t4sdu2scg4n5b5b7tvellnkm.apps.googleusercontent.com'
});

const serviceAccount = require('./../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://assistant-a4a97.firebaseio.com"
});

var db = admin.firestore();

db.settings({
  timestampsInSnapshots: true
});

const YOUR_CLIENT_ID = "122184330678-3557i6676ekrctmr3r6jom5a5vb27gej.apps.googleusercontent.com";
const YOUR_CLIENT_SECRET = "lEshPCDKSzkDeAL45xormMd8";
const YOUR_REDIRECT_URL = "https://youtube-assistant.herokuapp.com/oauthcallback/";
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

const oauth2Client = new google.auth.OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);  

const service = google.youtube('v3');

agent.intent('Default Welcome Intent', (conv) => {
  if(!conv.user.last.seen) {      //First time users
    conv.ask('Hi, welcome to your YouTube Assistant. I can tell your channel growth or provide a report about your last uploaded video.');
    conv.ask('As a demo, let say i have a youtube channel.');
  } else {                       //Old users
    const {payload} = conv.user.profile;
    if(!payload) {               
      conv.ask('Hey welcome back!  \nAs I can see you are not Signed In ');
      conv.ask('To continue please say Sign In');
    } else {
      // make a get(payload.email) request to the database   
      return db.collection('users').doc(`${payload.email}`).get().then((doc) => {
        let data = doc.data();
        // check for youtube access token
        if(data.token === null) {
          // if access not granted : ask for youtube access and provide link
          conv.ask(`Hey ${data.name} !  \nWelcome back to your YouTube Assistant  \nAs I can see you have not given me an access to read your YouTube data.  \nPlease go to the following link, in order to continue with me.`);
          
          conv.ask(new BasicCard({
            text:'In order to give me access to **Read** your Youtube data',
            buttons: new Button({
              title: 'Go to this link...',
              url: 'https://github.com/Shivamdot'
            })
          })); 
        } else {
          // if access granted : normal flow
          conv.ask(`Hey ${data.name} !  \nWelcome back to your YouTube Assistant  \nHow may I help you...`);
        }
      }).catch((err) => {
        conv.close('Sorry, some error occured, please try again later');
      });
    }
  }
});

agent.intent('ask_for_sign_in', (conv) => {
  conv.ask(new SignIn('In order to get personalised assistance'));
})

agent.intent('Get Signin', (conv, params, signin) => {
  if (signin.status === 'OK') {
    const {payload} = conv.user.profile;  
    let data = {
      name: `${payload.name}`,
      picture: `${payload.picture}`,
      token: null
    };
    return db.collection('users').doc(`${payload.email}`).set(data).then((res) => {
      conv.ask('I got your account details.  \nNow one last step left.  \nTo get authorised from youtube');
      
      //Create url for the given email
      let token = {
        email: `${payload.email}`
      };

      // let state = jwt.sign(token, '123abc');
      // let state = `${payload.email}`;

      let url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        response_type: 'code',
        scope: SCOPES,
        // state: `${state}`
      });

      conv.ask(new BasicCard({
        text:'In order to give me access to **Read** your Youtube data',
        buttons: new Button({
          title: 'Go to this link ...',
          url: `${url}`
        })
      })); 
    }).catch((err) => {
      conv.close('Sorry, some error occured, please try again later');
    });
    } else {
      conv.close('Getting Signed In, is an esential part to continue.  \nAnd remember you can always ask for a demo...');
    }
});

agent.intent('demo', (conv) => {
  conv.close('As a demo, let say i have a youtube channel.');
})

app.post('/', agent);

app.get('/oauthcallback/', (req, res) => {
  var state = req.query.state;
  var code = req.query.code; 
  var error = req.query.error;
  if(code && !error) {
    // let {email} = jwt.verify(state, '123abc');
    // res.send(`email: ${email}, status: successfull`);
    res.send(`status: successfull`);
  } else {
    res.send('some error occured or probably access not given')
  }
});

var port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});