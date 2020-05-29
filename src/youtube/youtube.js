const {google} = require('googleapis');

// Setting Up Credentials
const YOUR_CLIENT_ID = process.env.YOUR_CLIENT_ID;
const YOUR_CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET;
const YOUR_REDIRECT_URL = process.env.YOUR_REDIRECT_URL;

// Initialiasing YouTube API
const oauth2Client = new google.auth.OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);  

const service = google.youtube('v3');

module.exports = {
    oauth2Client,
    service
};