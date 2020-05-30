const {Suggestions} = require('actions-on-google'); 

// Help Intent
const helpIntent = (conv) => {
    const {payload} = conv.user.profile;
    conv.ask('<speak> "My YouTuber Channel" is a Google Assistant app. Where I provide latest updates <break time="200ms" /> about your YouTube channel <break time="300ms" /> or about your last video uploaded.  \nYou may say Channel Reports or Video Reports for the same, respectively. </speak>');
    if(!payload) {
        conv.ask('To continue please say Sign In.  \nOr you can also ask for a demo!');
        conv.ask(new Suggestions(['Sign In','Demo','Developer']));
    } else {
        conv.ask('So how may I help you ?');
        conv.ask(new Suggestions(['Video Reports','Channel Reports','Demo','Developer']));
    }
}

module.exports = {helpIntent}