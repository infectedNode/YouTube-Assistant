const {
    Image,
    Suggestions,
    BasicCard,
    Button
} = require('actions-on-google'); 

// Demo Intent
const demoIntent = (conv) => {
    const {payload} = conv.user.profile;  
  
    conv.ask('For a demo, let say I have a YouTube channel "shivurocks".  \nAnd I want updates about my last video uploaded. So this is what I get.');
    
    if(!payload) {
        conv.ask('<speak> Your video "<emphasis level="moderate">Title of the Video</emphasis>" has got <break time="200ms" /> :-  \n10,000 Views <break time="300ms" />,  \n5,000 Likes <break time="300ms" />,  \n2,000 Comments <break time="300ms" /> and,  \n50 dislikes <break time="500ms" />.  \nIn order to get connected, please say Sign In </speak>');
        conv.ask(new Suggestions(['Sign In','Help','Developer']));
    } else {
        conv.ask('<speak> Your video "<emphasis level="moderate">Title of the Video</emphasis>" has got <break time="200ms" /> :-  \n10,000 Views <break time="300ms" />,  \n5,000 Likes <break time="300ms" />,  \n2,000 Comments <break time="300ms" /> and,  \n50 dislikes <break time="500ms" />.  \nSo, how can I help you ? </speak>');
        conv.ask(new Suggestions(['Video Reports','Channel Reports','Help','Developer']));
    }
  
    conv.ask(new BasicCard({
        image: new Image({
            url: 'https://youtube-assistant.herokuapp.com/images/introdemo.jpg',
            alt: 'title of the video',
        }),
        title: 'Title of the Video',
        subtitle: `1st Jun 2019`,
        text:'Views : 10,000  \nLikes : 5,000  \nComments : 2,000  \nDislikes : 50',
        buttons: new Button({
            title: 'Link to the video',
            url: 'https://youtube-assistant.herokuapp.com/'
        })
    }));
}

module.exports = {demoIntent}