const ejs = require("ejs");
const nodemailer = require("nodemailer");
const path = require("path");
const environment = require("../environments/environment");

let transporter = nodemailer.createTransport({
  // service: "gmail",
  // auth: { user: environment.SMTP_USER, pass: environment.SMTP_PASS },
  // tls: {
  //   host: "freedom.social",
  //   port: 993,
  // },
  headers: "X-PM-Message-Stream: transactional",
  host: "smtp.postmarkapp.com",
  port: 587,
  sender: "info@healing.tube",
  auth: { user: environment.SMTP_USER, pass: environment.SMTP_PASS },
});

exports.sendMail = async function (mailObj, calendarObj = null) {
  try {
    const emailTemplateSource = await ejs.renderFile(
      path.join(__dirname, mailObj.root),
      { ...mailObj.templateData }
    );
    const mailOptions = {
      from: {
        name: "SolarConsultants.Tube",
        address: "info@healing.tube",
      },
      to: mailObj.email,
      subject: mailObj.subject,
      html: emailTemplateSource,
    };
    if (calendarObj) {
      let alternatives = {
        "Content-Type": "text/calendar",
        method: "REQUEST",
        content: Buffer(calendarObj.toString()),
        component: "VEVENT",
        "Content-Class": "urn:content-classes:calendarmessage",
      };
      mailOptions["alternatives"] = alternatives;
      mailOptions["alternatives"]["contentType"] = "text/calendar";
      mailOptions["alternatives"]["content"] = new Buffer(
        calendarObj.toString()
      );
    }
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("error while sending the mail", error);
    return error;
  }
};
