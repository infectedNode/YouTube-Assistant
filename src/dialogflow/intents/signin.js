const {
    SignIn,
    NewSurface,
    Suggestions,
    BasicCard,
    Button
} = require('actions-on-google'); 

// Ask For Sign In Intent
const askForSigninIntent = (conv) => {
    const {payload} = conv.user.profile;
    if(!payload){
        conv.ask(new SignIn('In order to get personalised assistance'));
    } else {
        conv.ask('I can see, you are already Signed In');
        conv.ask('So you can ask me about your channel or video reports.  \nOr probably ask for a demo!');
        conv.ask(new Suggestions(['Video Reports','Channel Reports','Demo','Help','Developer']));
    }
}
  
  // Sign In Response Intent
const getSigninIntent = (conv, params, signin) => {
    if (signin.status === 'OK') {
        const {payload} = conv.user.profile;  
        let data = {
            name: `${payload.name}`,
            picture: `${payload.picture}`,
            token: null
        };
        return db.collection('users').doc(`${payload.email}`).set(data).then((res) => {      
            //Create url for the given email
            let token = {
                email: `${payload.email}`
            };
  
            let state = jwt.sign(token, '123abc');
  
            let url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                response_type: 'code',
                scope: SCOPES,
                state: `${state}`
            });
  
            let hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
            let hasWebBrowser = conv.surface.capabilities.has('actions.capability.WEB_BROWSER');
  
            let screenAvailable = conv.available.surfaces.capabilities.has('actions.capability.SCREEN_OUTPUT');
            let browserAvailable = conv.available.surfaces.capabilities.has('actions.capability.WEB_BROWSER');
  
            if(hasScreen && hasWebBrowser) {
                conv.ask('I got your account details.  \nNow one last step left.  \nTo get authorised from youtube.');
                conv.ask('Please go to the following link, in order to continue with me.');
                conv.close(new BasicCard({
                    text:'In order to give me access to **Read** your Youtube data',
                    buttons: new Button({
                        title: 'Go to this link ...',
                        url: `${url}`
                    })
                }));        
            } else if(screenAvailable && browserAvailable) {
                let context = `I got your account details.  \nNow one last step left.  \nTo get authorised from youtube.  \nAs you don\'t have a Web browser on this device.  \nTo provide you a YouTube Access link.`;
                let notification = 'YouTube Access Link';
                let capabilities = ['actions.capability.WEB_BROWSER','actions.capability.SCREEN_OUTPUT'];
                conv.ask(new NewSurface({context, notification, capabilities}));
            } else {
                // send link via email
                conv.ask(`I got your account details.  \nNow one last step left.  \nTo get authorised from youtube.  \nAs you don\'t have a Web browser on this device. So I have mailed you the link.`);
                conv.close('Please go to that link and give me an access to Read your Youtube data, in order to continue with me.');
                return transporter.sendMail({
                    to: `${payload.email}`,
                    from: 'My-YouTuber-Channel@youtube-assistant.herokuapp.com',
                    subject: 'YouTube Access Link',
                    html: compiledTemplate.render({url})
                }).catch(e => console.log(e));
            } 
        }).catch((err) => {
            conv.close('Sorry, some error occured, please try again later');
        });
    } else {
        conv.close('Getting Signed In, is an esential part to continue.  \nAnd remember you can always ask for a demo...');
        conv.close(new BasicCard({
            text:'To know more about the application, you may visit to our website.',
            buttons: new Button({
                title: 'Visit Website',
                url: 'https://youtube-assistant.herokuapp.com/'
            })
        }));      
    }
}

module.exports = {askForSigninIntent, getSigninIntent}