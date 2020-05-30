const {dialogflow} = require('actions-on-google'); 

const {welcomeIntent} = require('./intents/welcome');

let agent = dialogflow({
    debug: true,
    clientId: process.env.AGENT_ID
});

agent.intent('Default Welcome Intent', welcomeIntent);

module.exports = {agent}