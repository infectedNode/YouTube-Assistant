const express = require('express');
const admin = require('firebase-admin');
const {dialogflow,Image,SignIn,NewSurface} = require('actions-on-google');  
const {google} = require('googleapis');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

const agent = dialogflow({
    debug: true,
  });

const service = google.youtube('v3');

agent.intent('Default Welcome Intent', (conv) => {
  if(!conv.user.last.seen) {
    conv.ask('Hi, welcome to your YouTube channel. I can tell your channel growth or provide a report about your last uploaded video.');
    conv.ask('As a demo, let say i have a youtube channel.');
  } else {
    const {payload} = conv.user.profile;
    if(!payload) {
      conv.ask('Hey welcome back!');
      conv.ask('As I can see you are not Signed In ');
    }
  }
})

agent.intent('ask_for_sign_in', (conv) => {
  conv.ask(new SignIn('In order to get connected with your youtube account'));
})

agent.intent('Get Signin', (conv, params, signin) => {
  if (signin.status === 'OK') {
      const payload = conv.user.profile.payload;
      conv.ask(`I got your account details, ${payload.name}. What do you want to do next? sir ji`);
    } else {
      conv.ask(`I won't be able to save your data, but what do you want to do next?`);
    }
})


agent.intent('demo', (conv) => {
  conv.close('As a demo, let say i have a youtube channel.');
})



app.post('/', agent);

var port = process.env.PORT || 2000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});