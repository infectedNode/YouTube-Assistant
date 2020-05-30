const {dialogflow} = require('actions-on-google'); 

const {welcomeIntent} = require('./intents/welcome');
const {askForSigninIntent, getSigninIntent} = require('./intents/signin');
const {newSurfaceIntent} = require('./intents/newSurface');
const {demoIntent} = require('./intents/demo');
const {channelIntent} = require('./intents/channel');
const {videoIntent} = require('./intents/video');
const {helpIntent} = require('./intents/help');
const {fallbackIntent} = require('./intents/fallback');

let agent = dialogflow({
    debug: true,
    clientId: process.env.AGENT_ID
});

agent.intent('Default Welcome Intent', welcomeIntent);
agent.intent('ask_for_sign_in', askForSigninIntent);
agent.intent('Get Signin', getSigninIntent);
agent.intent('new_surface_intent', newSurfaceIntent);
agent.intent('demo', demoIntent);
agent.intent('channel', channelIntent);
agent.intent('video', videoIntent);
agent.intent('help', helpIntent);
agent.intent('Default Fallback Intent', fallbackIntent);

module.exports = {agent}