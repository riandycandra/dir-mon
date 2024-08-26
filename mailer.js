const nodemailer = require('nodemailer');
const chalk = require('chalk')

require('dotenv').config();

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  }
});

const notifyMe = (content) => {
  let mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: 'Notifikasi Migrasi JM Arsip - MinIO',
    text: content
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(chalk.red("[-] [SENDING EMAIL ERROR] : " + error.message));
    } else {
      console.log(chalk.greenBright("[+] [SENDING EMAIL SUCCESS] : " + content));
    }
  }); 
}

module.exports = {
  notifyMe
}