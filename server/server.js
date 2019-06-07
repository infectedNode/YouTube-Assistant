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

const service = google.youtube('v3');

agent.intent('Default Welcome Intent', (conv) => {
  if(!conv.user.last.seen) {      //First time users
    conv.ask('Hi, welcome to your YouTube channel. I can tell your channel growth or provide a report about your last uploaded video.');
    conv.ask('As a demo, let say i have a youtube channel.');
  } else {                       //Old users
    const {payload} = conv.user.profile;
    if(!payload) {               
      conv.ask('Hey welcome back!\n As I can see you are not Signed In ');
      conv.ask('To continue please say Sign In');
    } else {
      // make a get(payload.email) request to the database     
      // check for youtube access token

      // if access granted : normal flow     
      // if access not granted : ask for youtube access and provide link     
    }
  }
})

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

      conv.ask(new BasicCard({
        text:'In order to give me access to **Read** your Youtube data',
        buttons: new Button({
          title: 'Go to this link...',
          url: 'https://github.com/Shivamdot'
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

var port = process.env.PORT || 2000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});