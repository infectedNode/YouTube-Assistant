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
  if(conv.user.last.seen) {
    conv.ask('hey welcome back, how may i help you')
  } else {
    conv.ask('hi, welcome to your youtube channel.');
    conv.ask('As a demo, let say i have a youtube channel.');
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