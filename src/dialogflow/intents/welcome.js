const {
    Image,
    NewSurface,
    Suggestions,
    BasicCard,
    Button
} = require('actions-on-google'); 


// Welcone Intent
const welcomeIntent = (conv) => {
    if(!conv.user.last.seen) {      
        //First time user's
        conv.ask('<speak> Hi, welcome to your YouTube Assistant.  \nI can provide latest updates <break time="200ms" /> about your YouTube channel <break time="300ms" /> or about your last video uploaded.  \nFor a demo, let say I have a YouTube channel "shivurocks".  \nAnd I want updates about my last video uploaded. So this is what I get. </speak>');
        conv.ask('<speak> Your video  "<emphasis level="moderate">Title of the Video</emphasis>" has got <break time="200ms" /> :-  \n10,000 Views <break time="300ms" />,  \n5,000 Likes <break time="300ms" />,  \n2,000 Comments <break time="300ms" /> and,  \n50 Dislikes <break time="500ms" />.  \nIn order to get connected please say Sign In </speak>');
        conv.ask(new BasicCard({
            image: new Image({
                url: `https://youtube-assistant.herokuapp.com/images/introdemo.jpg`,
                alt: 'title of the video',
            }),
            title: 'Title of the Video',
            subtitle: `1st Jun 2019`,
            text:'Views : 10,000  \nLikes : 5,000  \nComments : 2,000  \nDislikes : 50',
            buttons: new Button({
                title: 'Link to the video',
                url: 'https://youtube-assistant.herokuapp.com/'
            })
        })); 
        conv.ask(new Suggestions(['Sign In','Demo','Developer','Help']));
    } else {                       
        //Old users
        const {payload} = conv.user.profile;
        if(!payload) {               
            conv.ask('Hey, welcome back to your YouTube Assistant. \nAs I can see you are not Signed In.');
            conv.ask('To continue please say Sign In');
            conv.ask(new Suggestions(['Sign In','Demo','Help','Developer']));
        } else {
            // make a get(payload.email) request to the database   
            return db.collection('users').doc(`${payload.email}`).get().then((doc) => {
                let data = doc.data();
                // check for youtube access token
                if(data.token === null) {
                    // if access not granted : ask for youtube access and provide link          
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
                        conv.ask(`<speak> Hey ${data.name} !  \nWelcome back to your YouTube Assistant.  \nAs I can see <break time="200ms" /> you have not given me an access to read your YouTube data. </speak>`);
                        conv.ask('Please go to the following link, in order to continue with me.');
                        conv.close(new BasicCard({
                            text:'In order to give me access to **Read** your Youtube data',
                            buttons: new Button({
                                title: 'Go to this link ...',
                                url: `${url}`
                            })
                        }));
                    } else if(screenAvailable && browserAvailable) {
                        let context = `Hey ${data.name} !  \nWelcome back to your YouTube Assistant.  \nAs I can see you have not given me an access to read your YouTube data.  \nAlso you don\'t have a Web browser on this device.  \nTo provide you a YouTube Access link.`;
                        let notification = 'YouTube Access Link';
                        let capabilities = ['actions.capability.WEB_BROWSER','actions.capability.SCREEN_OUTPUT'];
                        conv.ask(new NewSurface({context, notification, capabilities}));
                    } else {
                        // send link via email
                        conv.ask(`<speak> Hey ${data.name} !  \nWelcome back to your YouTube Assistant.  \nAs I can see <break time="200ms" /> you have not given me an access to read your YouTube data.  \nAlso <break time="200ms" /> you don\'t have a Web browser on this device. So I have mailed you the link.</speak>`);
                        conv.close('Please go to that link and give me an access to Read your Youtube data, in order to continue with me.');
                        return transporter.sendMail({
                            to: `${payload.email}`,
                            from: 'My-YouTuber-Channel@youtube-assistant.herokuapp.com',
                            subject: 'YouTube Access Link',
                            html: compiledTemplate.render({url})
                        }).catch(e => console.log(e));
                    }
                } else {
                    // if access granted : normal flow
                    conv.data.token = data.token;
                    conv.ask(`Hey ${data.name} !  \nWelcome back to your YouTube Assistant.  \nHow may I help you...`);
                    conv.ask(new Suggestions(['Video Reports','Channel Reports','Demo','Help','Developer']));
                }
            }).catch((err) => {
                conv.close('Sorry, some error occured, please try again later');
            });
        }
    }
}

module.exports = {welcomeIntent};