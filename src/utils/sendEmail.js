import nodemailer from 'nodemailer'
// import dotenv from "dotenv"; 
// dotenv.config({
//     path: './env',
//   });
const transporter = nodemailer.createTransport({
    host:'smtp.ethereal.email',
    port: 587,
    secure: true,
    auth: {
      user:'bailee96@ethereal.email',
      pass: 's7kj1FzNcGNYYBm1S2'
    },
  });
  
  export const sendEmail = async ({ email, subject, text, html }) => {
    console.log("text", text);
    try {
      const info = await transporter.sendMail(
        {
          from: `"Makely Pro" ${process.env.MAIL_FROM_ADDRESS}`,
          to: email,
          subject: subject,
          text: text,
          html: html,     
        
        },
        function error(err, info) {
          if (err) {
            console.log("Error in sending Email", err);
            return false;
          }
        }
      );
      return true;
    } catch (error) {
      console.log("Error in send email", error);
      return false;
    }
  };
  