const {
    Image,
    Suggestions,
    BasicCard,
    Button
} = require('actions-on-google'); 
const moment = require('moment');

const {db} = require('./../../db/firestore');
const {oauth2Client, service} = require('./../../youtube/youtube');

// Simple format function
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

// Channel Intent
const channelIntent = (conv) => {
    const {payload} = conv.user.profile;  
    if(!payload) {
        conv.ask('Sure! But in order to identify your YouTube channel, I want you to Sign In');
        conv.ask('To continue please say Sign In');
        conv.ask(new Suggestions(['Sign In','Demo','Help']));
    } else {
        let token = conv.data.token;
  
        // set auth for the user
        oauth2Client.setCredentials(token);
  
        // if access token gets expired, renew it from the refresh token
        oauth2Client.on('tokens', (tokens) => {
            // update the database with the new access token and its new expiry date
            let access_token = tokens.access_token;
            let expiry_date = tokens.expiry_date;
            db.collection('users').doc(`${payload.email}`).update({
                'token.access_token': access_token,
                'token.expiry_date': expiry_date
            })
        });
  
        // making request to youtube data api with auth
        return service.channels.list({
            auth: oauth2Client,
            part: 'snippet,statistics',
            mine: true
        }).then((result) => {
            let data = result.data.items[0];
  
            conv.ask('<speak> Sure! <break time="200ms" /> </speak>');
        
            conv.close(`<speak> Your YouTube channel " <emphasis level="moderate">${data.snippet.title}</emphasis> " is currently having <break time="200ms" /> :-  \n${formatNumber(data.statistics.subscriberCount)} Subscribers <break time="300ms" />,  \n${formatNumber(data.statistics.videoCount)} Videos <break time="300ms" /> and  \n${formatNumber(data.statistics.viewCount)} Views </speak>`);
  
            conv.close(new BasicCard({
                image: new Image({
                    url: data.snippet.thumbnails.high.url,
                    alt: data.snippet.title,
                }),
                title: data.snippet.title,
                subtitle:  `since: ${moment(data.snippet.publishedAt).format("Do MMM YYYY")}`,
                text:  `Subscribers: ${formatNumber(data.statistics.subscriberCount)}  \nVideos: ${formatNumber(data.statistics.videoCount)}  \nViews: ${formatNumber(data.statistics.viewCount)}`,
                buttons: new Button({
                    title: 'Link to the channel',
                    url: `https://www.youtube.com/channel/${data.id}`,
                })
            }));
        }).catch((err) => {
            if(err.data.error.errors[0].reason === 'forbidden') {
                conv.close('YouTube access has removed. Please get authorized to use my services');
            } else if(err.data.error.errors[0].reason === 'quotaExceeded') {
                conv.close('Data request limit exceeded for the day. Please try again tommorow ...');
            } else {
                conv.close('oops! some glitch occurred. Please try again in few seconds.');
            }
        });
    }
}

module.exports = {channelIntent}