const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "aztetics.ti@gmail.com",
    pass: "wjir jxyq fkwn dvaq ",
  },
});

transporter.verify().then(() =>{
    console.log('El envio de correos esta listo')
})


module.exports = transporter;