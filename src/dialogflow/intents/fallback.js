const {
    dialogflow,
    Image,
    SignIn,
    NewSurface,
    Suggestions,
    BasicCard,
    Button
} = require('actions-on-google'); 

// Fallback Intent
const fallbackIntent = (conv) => {
    const {payload} = conv.user.profile;  
    if(!payload) {
        conv.ask(`Sorry, I didn't get that. You should say Sign In. Or you can also ask for a demo.`);
        conv.ask(new Suggestions(['Sign In','Demo','Help','Developer']));
    } else {
        conv.ask(`Sorry, I didn't get that.`);
        conv.ask('You can ask me about your channel or video reports.  \nOr probably ask for a demo!');
        conv.ask(new Suggestions(['Video Reports','Channel Reports','Demo','Help','Developer']));
    }
}

module.exports = {fallbackIntent}