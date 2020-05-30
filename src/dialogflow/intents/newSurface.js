const {
    BasicCard,
    Button
} = require('actions-on-google');

// New Surface Intent
const newSurfaceIntent = (conv, input, newSurface) => {
    const {payload} = conv.user.profile;  
    
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
        return transporter.sendMail({
            to: `${payload.email}`,
            from: 'My-YouTuber-Channel@youtube-assistant.herokuapp.com',
            subject: 'YouTube Access Link',
            html: compiledTemplate.render({url})
        }).catch(e => console.log(e));
    }
}

module.exports = {newSurfaceIntent}