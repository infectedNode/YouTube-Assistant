const {
    Image,
    BasicCard,
    Button
} = require('actions-on-google'); 

// Developer Intent
const developerIntent = (conv) => {

    conv.ask('<speak> I am Developed by "Mr Shivam Sharma". <break time="200ms" /> An Indian Developer, who has created me with Love. </speak>');
  
    conv.ask(new BasicCard({
        image: new Image({
            url: 'https://youtube-assistant.herokuapp.com/images/ShivamSharma.jpg',
            alt: 'shivam sharma',
        }),
        title: 'Shivam Sharma',
        subtitle: 'An Indian Developer',
        text:  `I am Developed by "Mr. Shivam Sharma". An Indian Developer, who has created me with Love.  \nTo get connected with him, you can find him on Instagram by the name "shivamdotcom"`,
        buttons: new Button({
            title: 'Connect with Me',
            url: `https://www.instagram.com/shivamdotcom/`,
        })
    }));
  
    conv.close('To get connected with him, you can find him on Instagram by the name "shivamdotcom"');
}

module.exports = {developerIntent}