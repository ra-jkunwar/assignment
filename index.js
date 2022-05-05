// require the necessary modules
const express = require('express');


const cron = require('node-cron');
const moment = require('moment');
const nodemailer = require('nodemailer');
const connectToMongo = require('./db');


const Subscribers = require('./models/subs.model');
const Content = require('./models/content.model');
connectToMongo();
require('dotenv').config();



// intialize the app
const app = express();
app.use(express.json());
// Configuring app for use
app.use('/',require('./routes/newsletter.route'));




// *************************************************************************************************************************
//Sending newsletters using nodemailer




const sendEmail = async (content)=>{
  const subs = await Subscribers.find({topic_name: content.topic});
  const receiver = subs[0].subsList;
  const receiverString = receiver.join(', ');

// *************************************************************************************************************************
   
  //Using Gmail as a transport service and created transporter object
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure:false,
    requireTLS:true,
    auth: {
      user: process.env.DEV_MAIL, 
      pass: process.env.DEV_MAIL_PASSWORD
    }
  });

  let subject = 'CureLink | '+content.topic+' | '+content.title;

  let text = content.content_body;
  

  let mailOptions = {
    from: process.env.DEV_MAIL,
    to: receiverString,
    subject,
    text
  };
// *************************************************************************************************************************
  
  //Sending mail through sendMail() function of transporter object
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Newsletter sent successfully: ' + info.response);
    }
  }); 
}

// *************************************************************************************************************************
//Scheduling our email using node-cron
cron.schedule('00 * * * * *', ()=>{
  //Search for contents which are not sent yet
  Content.find({isSent: false}).then((contents)=>{
    let cList = [];
    for(let content of contents){
      let send_time = moment(content.send_at).valueOf();
      let cur_time = moment.utc().valueOf();
      
      //Push the contents in the array whose current time matches with the sent time
      if(Math.abs(send_time-cur_time)<=59000){
        cList.push(content);
      }
    }
    return cList;
  }).then((cList)=>{

    //Send all the contents of the array via email and make isSent: true
    for(let li of cList){
      sendEmail(li);
      Content.findByIdAndUpdate(li._id,{"$set": {"isSent": true}},
      function(err){
        if(err){ 
            console.log(err);
        }
    });
    }
  })
})


//Listen for connections
const port = process.env.PORT || 4000;
app.listen(port, () => {
   console.log(`Currently Listening at http://localhost:${port}`);
});
