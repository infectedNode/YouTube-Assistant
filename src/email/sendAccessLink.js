const Hogan = require('hogan.js');
const fs = require('fs');

const {transporter} = require('./email');

// Compiling the hbs template
const template = fs.readFileSync('./views/email.hbs', 'utf-8');
const compiledTemplate = Hogan.compile(template);

const sendAccessLink = (data) => {
    let {email, url} = data;
    transporter.sendMail({
        to: email,
        from: 'Channel-Expert@youtube-assistant.herokuapp.com',
        subject: 'YouTube Access Link',
        html: compiledTemplate.render({url})
    }).catch(e => console.log(e));   
}

module.exports = {sendAccessLink};