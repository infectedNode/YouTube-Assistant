const {BasicCard, Button} = require('actions-on-google');

const {oauth2Client} = require('./../../youtube/youtube');
const {sendAccessLink} = require('./../../email/sendAccessLink');

const JWT_SALT = process.env.JWT_SALT;   // Salt Code for encryption
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

// New Surface Intent
const newSurfaceIntent = (conv, input, newSurface) => {
    const {payload} = conv.user.profile;  
    
    let token = {
        email: `${payload.email}`
    };
  
    let state = jwt.sign(token, JWT_SALT);
  
    let url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        response_type: 'code',
        scope: SCOPES,
        state: `${state}`
    });
  
    if (newSurface.status === 'OK') {
        conv.ask('Please go to the following link, in order to continue with me.');
        conv.close(new BasicCard({
            text:'In order to give me access to **Read** your Youtube data',
            buttons: new Button({
                title: 'Go to this link ...',
                url: `${url}`
            })
        }));
    } else {
        conv.ask(`Ok, I understand. So I have mailed you the link.`);
        conv.close('Please go to that link and give me an access to Read your Youtube data, in order to continue with me.');
        let emailData = {
            email: payload.email,
            url
        }
        return sendAccessLink(emailData);
    }
}

module.exports = {newSurfaceIntent}