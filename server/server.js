const express = require('express');
const admin = require('firebase-admin');
const {
  dialogflow,
  Image,
  SignIn,
  NewSurface,
  Suggestions,
  BasicCard,
  Button
} = require('actions-on-google');  
const {google} = require('googleapis');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

var agent = dialogflow({
  debug: true,
  clientId: '122184330678-o5i7c2s7t4sdu2scg4n5b5b7tvellnkm.apps.googleusercontent.com'
});

const serviceAccount = require('./../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://assistant-a4a97.firebaseio.com"
});

var db = admin.firestore();

db.settings({
  timestampsInSnapshots: true
});

const YOUR_CLIENT_ID = "122184330678-3557i6676ekrctmr3r6jom5a5vb27gej.apps.googleusercontent.com";
const YOUR_CLIENT_SECRET = "lEshPCDKSzkDeAL45xormMd8";
// const YOUR_REDIRECT_URL = "https://youtube-assistant.herokuapp.com/oauthcallback/";
const YOUR_REDIRECT_URL = "http://localhost:2000/oauthcallback/";
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

const oauth2Client = new google.auth.OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);  

const service = google.youtube('v3');

agent.intent('Default Welcome Intent', (conv) => {
  if(conv.user.last.seen) {      //First time user's
    conv.ask('Hi, welcome to your YouTube Assistant.  \nI can give you latest updates about your YouTube channel or about your last video uploaded.  \nFor a demo, let say I have a YouTube channel "shivurocks".  \nAnd I want updates about my last video uploaded. So this is what I get.');
    conv.ask(new BasicCard({
      image: new Image({
        url: `https://i.ytimg.com/vi/u-zo07xOskM/hqdefault.jpg?sqp=-oaymwEZCPYBEIoBSFXyq4qpAwsIARUAAIhCGAFwAQ==&rs=AOn4CLC4DahnW-iJfKfW3m9r1HQMGiDIdQ`,
        alt: 'shivam sharma',
      }),
      title: 'Demo of My Red Channel',
      subtitle: `08-06-2019`,
      text:'Views : 10,000  \nLikes : 5,000  \nComments : 2,000  \nDislikes : 50',
      buttons: new Button({
        title: 'Link to this video ...',
        url: 'https://www.youtube.com/watch?v=u-zo07xOskM'
      })
    })); 
    conv.ask('Your video  "Demo of My Red Channel" has got:  \n10,000 views  \n5,000 likes  \n2,000 comments and  \n50 dislikes.  \nIn order to get connected please say Sign In');
    conv.ask(new Suggestions(['Sign In','Demo']));
  } else {                       //Old users
    const {payload} = conv.user.profile;
    if(!payload) {               
      conv.ask('Hey welcome back!  \nAs I can see you are not Signed In ');
      conv.ask('To continue please say Sign In');
      conv.ask(new Suggestions(['Sign In','Demo']));
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

          conv.data.url = `${url}`;

          let hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
          let hasWebBrowser = conv.surface.capabilities.has('actions.capability.WEB_BROWSER');

          let screenAvailable = conv.available.surfaces.capabilities.has('actions.capability.SCREEN_OUTPUT');
          let browserAvailable = conv.available.surfaces.capabilities.has('actions.capability.WEB_BROWSER');

          if(hasScreen && hasWebBrowser) {
            conv.ask(`Hey ${data.name} !  \nWelcome back to your YouTube Assistant  \nAs I can see you have not given me an access to read your YouTube data.`);
            conv.ask('Please go to the following link, in order to continue with me.');
            conv.ask(new BasicCard({
              text:'In order to give me access to **Read** your Youtube data',
              buttons: new Button({
                title: 'Go to this link ...',
                url: `${url}`
              })
            }));
          } else if(screenAvailable && browserAvailable) {
            let context = `Hey ${data.name} !  \nWelcome back to your YouTube Assistant  \nAs I can see you have not given me an access to read your YouTube data.  \nAlso you don\'t have a Web browser on this device.  \nTo provide you a YouTube Access link`;
            let notification = 'YouTube Access Link';
            let capabilities = ['actions.capability.WEB_BROWSER','actions.capability.SCREEN_OUTPUT'];
            conv.ask(new NewSurface({context, notification, capabilities}));
          } else {
            // send link via email
            conv.ask(`Hey ${data.name} !  \nWelcome back to your YouTube Assistant  \nAs I can see you have not given me an access to read your YouTube data.  \nAlso you don\'t have a Web browser on this device. So I have mailed you the link.`);
            conv.close('Please go to that link and give me access to Read your Youtube data, in order to continue with me.');
          }
        } else {
          // if access granted : normal flow
          conv.ask(`Hey ${data.name} !  \nWelcome back to your YouTube Assistant  \nHow may I help you...`);
        }
      }).catch((err) => {
        conv.close('Sorry, some error occured, please try again later');
      });
    }
  }
});

agent.intent('ask_for_sign_in', (conv) => {
  const {payload} = conv.user.profile;
  if(!payload){
    conv.ask(new SignIn('In order to get personalised assistance'));
  } else {
    conv.ask('As I can see, you are already Signed In');
  }
})

agent.intent('Get Signin', (conv, params, signin) => {
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

      conv.data.url = `${url}`;

      let hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
      let hasWebBrowser = conv.surface.capabilities.has('actions.capability.WEB_BROWSER');

      let screenAvailable = conv.available.surfaces.capabilities.has('actions.capability.SCREEN_OUTPUT');
      let browserAvailable = conv.available.surfaces.capabilities.has('actions.capability.WEB_BROWSER');

      if(hasScreen && hasWebBrowser) {
        conv.ask('I got your account details.  \nNow one last step left.  \nTo get authorised from youtube');
        conv.ask('Please go to the following link, in order to continue with me.');
        conv.ask(new BasicCard({
          text:'In order to give me access to **Read** your Youtube data',
          buttons: new Button({
            title: 'Go to this link ...',
            url: `${url}`
          })
        }));
      } else if(screenAvailable && browserAvailable) {
        let context = `I got your account details.  \nNow one last step left.  \nTo get authorised from youtube  \nAs you don\'t have a Web browser on this device.  \nTo provide you a YouTube Access link`;
        let notification = 'YouTube Access Link';
        let capabilities = ['actions.capability.WEB_BROWSER','actions.capability.SCREEN_OUTPUT'];
        conv.ask(new NewSurface({context, notification, capabilities}));
      } else {
        // send link via email
        conv.ask(`I got your account details.  \nNow one last step left.  \nTo get authorised from youtube.  \nAs you don\'t have a Web browser on this device. So I have mailed you the link.`);
        conv.close('Please go to that link and give me an access to Read your Youtube data, in order to continue with me.');
      } 
    }).catch((err) => {
      conv.close('Sorry, some error occured, please try again later');
    });
    } else {
      conv.close('Getting Signed In, is an esential part to continue.  \nAnd remember you can always ask for a demo...');
    }
});

agent.intent('new_surface_intent', (conv, input, newSurface) => {
  if (newSurface.status === 'OK') {
    conv.ask('Please go to the following link, in order to continue with me.');
    conv.ask(new BasicCard({
      text:'In order to give me access to **Read** your Youtube data',
      buttons: new Button({
        title: 'Go to this link ...',
        url: `${conv.data.url}`
      })
    }));

  } else {
    conv.ask(`Ok, I understand. So I have mailed you the link.`);
    conv.close('Please go to that link and give me an access to Read your Youtube data, in order to continue with me.');
  }
});

agent.intent('demo', (conv) => {
  conv.ask('For a demo, let say I have a YouTube channel "shivurocks".  \nAnd I want updates about my last video uploaded. So this is what I get.');
  conv.ask(new BasicCard({
    image: new Image({
      url: `https://i.ytimg.com/vi/u-zo07xOskM/hqdefault.jpg?sqp=-oaymwEZCPYBEIoBSFXyq4qpAwsIARUAAIhCGAFwAQ==&rs=AOn4CLC4DahnW-iJfKfW3m9r1HQMGiDIdQ`,
      alt: 'shivam sharma',
    }),
    title: 'Demo of My Red Channel',
    subtitle: `08-06-2019`,
    text:'Views : 10,000  \nLikes : 5,000  \nComments : 2,000  \nDislikes : 50',
    buttons: new Button({
      title: 'Link to this video ...',
      url: 'https://www.youtube.com/watch?v=u-zo07xOskM'
    })
  }));
  conv.ask('Your video  "Demo of My Red Channel" has got:  \n10,000 views  \n5,000 likes  \n2,000 comments and  \n50 dislikes  \nIn order to get connected please say Sign In');
})

app.post('/', agent);

app.get('/oauthcallback/', (req, res) => {
  var state = req.query.state;
  var code = req.query.code; 
  var error = req.query.error;

  if(state && code && !error) {
    let {email} = jwt.verify(state, '123abc');
    db.collection('users').doc(`${email}`).get().then((doc) => {
      if(!doc.exists){
        return res.send('Account does not exists ...');
      }
      let data = doc.data();
      if(data.token !== null) {
        return res.send('Access to this account already exists');
      }
      oauth2Client.getToken(code).then((result) => {
        let token = result.tokens;
        db.collection('users').doc(`${email}`).update({token}).then(() => {
          res.send('Access granted Succesfully ...');
        });
      });
    }).catch((err) => {
      res.send('error getting the document' + err);
    });
  } else if(state && (error === 'access_denied')) {
    res.send('some error occured or probably access not given');
  } else {
    res.send('your are not authorized to this page');
  }
});

var port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});