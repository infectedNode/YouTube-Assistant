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

// Get Latest Video Intent
const videoIntent = (conv) => {
    const {payload} = conv.user.profile;  
    if(!payload) {
        conv.ask('Sure! But in order to identify your YouTube channel I want you to Sign In');
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
        
        //perform youtube data api request
        let playlistId = conv.user.storage.playlistId;
  
        // if playlistId already known. (saves one step)
        if(playlistId) {
            return service.playlistItems.list({
                auth: oauth2Client,
                part: 'snippet',
                maxResults: 1,
                playlistId 
            }).then((videos) => {
                let data = videos.data.items[0];
                if(!data) {
                    return conv.close('Sorry, you have not uploaded any video yet!');
                }
                let date = moment(data.snippet.publishedAt).format("Do MMM YYYY");
                let title = data.snippet.title;
                let imgres = data.snippet.thumbnails.maxres || data.snippet.thumbnails.standard || data.snippet.thumbnails.high;
                let thumbnail = imgres.url;
                let videoId = data.snippet.resourceId.videoId;
            
                return service.videos.list({
                    auth: oauth2Client,
                    part: 'statistics',
                    id: videoId
                }).then((video) => {
                    let data = video.data.items[0];
  
                    conv.ask('<speak> Sure! <break time="200ms" /> </speak>');
  
                    conv.close(`<speak> Your video " <emphasis level="moderate">${title}</emphasis> " has got <break time="200ms" /> :-  \n${formatNumber(data.statistics.viewCount)} Views <break time="300ms" />,  \n${formatNumber(data.statistics.likeCount)} Likes <break time="300ms" />,  \n${formatNumber(data.statistics.commentCount)} Comments <break time="300ms" /> and  \n${formatNumber(data.statistics.dislikeCount)} Dislikes </speak>`);
  
                    conv.close(new BasicCard({
                        image: new Image({
                            url: thumbnail,
                            alt: title,
                        }),
                        title: title,
                        subtitle: date,
                        text:  `Views : ${formatNumber(data.statistics.viewCount)}  \nLikes : ${formatNumber(data.statistics.likeCount)}  \nComments : ${formatNumber(data.statistics.commentCount)}  \nDislikes : ${formatNumber(data.statistics.dislikeCount)}`,
                        buttons: new Button({
                            title: 'Link to the Video',
                            url: `https://www.youtube.com/watch?v=${videoId}`,
                        }),
                        display: 'CROPPED',
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
            }).catch((err) => {
                if(err.data.error.errors[0].reason === 'forbidden') {
                    conv.user.storage.playlistId = null;
                    conv.close('YouTube access has removed. Please get authorized to use my services');
                } else if(err.data.error.errors[0].reason === 'quotaExceeded') {
                    conv.close('Data request limit exceeded for the day. Please try again tommorow ...');
                } else {
                    conv.user.storage.playlistId = null;
                    conv.close('oops! some glitch occurred. Please try again in few seconds.');
                }
            });
        } else {
  
            // else when playlistId is not known.
            return service.channels.list({
                auth: oauth2Client,
                part: 'contentDetails',
                mine: true
            }).then((result) => {
                let data = result.data.items[0];
                let playlistId = data.contentDetails.relatedPlaylists.uploads;
                conv.user.storage.playlistId = playlistId;
                return service.playlistItems.list({
                    auth: oauth2Client,
                    part: 'snippet',
                    maxResults: 1,
                    playlistId 
                }).then((videos) => {
                    let data = videos.data.items[0];
                    if(!data) {
                        return conv.close('Sorry, you have not uploaded any video yet!');
                    }          
                    let date = moment(data.snippet.publishedAt).format("Do MMM YYYY");
                    let title = data.snippet.title;
                    let imgres = data.snippet.thumbnails.maxres || data.snippet.thumbnails.standard || data.snippet.thumbnails.high;
                    let thumbnail = imgres.url;
                    let videoId = data.snippet.resourceId.videoId;
                    return service.videos.list({
                        auth: oauth2Client,
                        part: 'statistics',
                        id: videoId
                    }).then((video) => {
                        let data = video.data.items[0];
  
                        conv.ask('<speak> Sure! <break time="200ms" /> </speak>');
  
                        conv.close(`<speak> Your video " <emphasis level="moderate">${title}</emphasis> " has got <break time="200ms" /> :-  \n${formatNumber(data.statistics.viewCount)} Views <break time="300ms" />,  \n${formatNumber(data.statistics.likeCount)} Likes <break time="300ms" />,  \n${formatNumber(data.statistics.commentCount)} Comments <break time="300ms" /> and  \n${formatNumber(data.statistics.dislikeCount)} Dislikes </speak>`);
    
                        conv.close(new BasicCard({
                            image: new Image({
                                url: thumbnail,
                                alt: title,
                            }),
                            title: title,
                            subtitle: date,
                            text:  `Views : ${formatNumber(data.statistics.viewCount)}  \nLikes : ${formatNumber(data.statistics.likeCount)}  \nComments : ${formatNumber(data.statistics.commentCount)}  \nDislikes : ${formatNumber(data.statistics.dislikeCount)}`,
                            buttons: new Button({
                                title: 'Link to the Video',
                                url: `https://www.youtube.com/watch?v=${videoId}`,
                            }),
                            display: 'CROPPED',
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
                }).catch((err) => {
                    if(err.data.error.errors[0].reason === 'forbidden') {
                        conv.close('YouTube access has removed. Please get authorized to use my services');
                    } else if(err.data.error.errors[0].reason === 'quotaExceeded') {
                        conv.close('Data request limit exceeded for the day. Please try again tommorow ...');
                    } else {
                        conv.close('oops! some glitch occurred. Please try again in few seconds.');
                    }
                });
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
}

module.exports = {videoIntent}  