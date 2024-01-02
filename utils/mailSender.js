const nodeMailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "prakash@email.com", // sender address
      to: email, // list of receivers
      subject: title, // Subject line
      html: body, // html body
    });

    console.log("Message sent: %s", info.messageId);

    return info;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = mailSender;
