const Hogan = require('hogan.js');
const fs = require('fs');

const {transporter} = require('./email');

// Compiling the hbs template
const template = fs.readFileSync('./views/email.hbs', 'utf-8');
const compiledTemplate = Hogan.compile(template);

const sendAccessLink = (data) => {
    let email = data.email;
    let url = data.url;
    transporter.sendMail({
        to: email,
        from: 'My-YouTuber-Channel@youtube-assistant.herokuapp.com',
        subject: 'YouTube Access Link',
        html: compiledTemplate.render({url})
    }).catch(e => console.log(e));   
}

module.exports = {sendAccessLink};