const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

// Setting the sendrid key value
const SENDGRID_KEY = process.env.SENDGRID_KEY;

const transporter =  nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_KEY    
    }
}));

module.exports = {transporter}  