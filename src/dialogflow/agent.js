const {dialogflow} = require('actions-on-google'); 

const {welcomeIntent} = require('./intents/welcome');
const {askForSigninIntent, getSigninIntent} = require('./intents/signin');
const {newSurfaceIntent} = require('./intents/newSurface');

let agent = dialogflow({
    debug: true,
    clientId: process.env.AGENT_ID
});

agent.intent('Default Welcome Intent', welcomeIntent);
agent.intent('ask_for_sign_in', askForSigninIntent);
agent.intent('Get Signin', getSigninIntent);
agent.intent('new_surface_intent', newSurfaceIntent);

module.exports = {agent}