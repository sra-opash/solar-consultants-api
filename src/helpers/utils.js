const environment = require("../environments/environment");
const email = require("./email");
const jwt = require("jsonwebtoken");
const __upload_dir = environment.UPLOAD_DIR;
var fs = require("fs");
var moment = require("moment");
const db = require("../../config/db.config");
const { default: ical } = require("ical-generator");

exports.send404 = function (res, err) {
  res.status(404).send({ error: true, message: err });
};

exports.send500 = function (res, err) {
  res.status(500).send({ error: true, message: err });
};

exports.isWithinRange = function (text, min, max) {
  // check if text is between min and max length
};

exports.getactualfilename = (fname, folder, id) => {
  var fileName = fname;
  const dir = __upload_dir + "/" + folder + "/" + id;
  console.log(dir);
  let files = fs.readdirSync(dir);
  if (files && files.length > 0) {
    files.forEach((file) => {
      console.log("file >> ", file);
      if (fileName.indexOf(file.split(".")[0]) !== -1) {
        fileName = file;
      }
    });
  }

  return [dir, fileName];
};

exports.registrationMail = async (userData, userId) => {
  let jwtSecretKey = environment.JWT_SECRET_KEY;
  let name = userData?.Username || userData.FirstName + " " + userData.LastName;

  const token = jwt.sign(
    {
      userId: userId,
      email: userData.Email,
    },
    jwtSecretKey,
    { expiresIn: "730 days" }
  );

  let registerUrl = `${environment.API_URL}customers/user/verification/${token}`;

  const mailObj = {
    email: userData.Email,
    subject: "Account Activation link",
    root: "../email-templates/registration.ejs",
    templateData: { name: name, url: registerUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.forgotPasswordMail = async (user) => {
  console.log(user);
  if (user) {
    let name = user?.Username || user?.FirstName + " " + user?.LastName;
    const token = jwt.sign(
      {
        userId: user?.Id,
      },
      environment.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    let forgotPasswordUrl = `${environment.FRONTEND_URL}reset-password/user?accesstoken=${token}`;
    const mailObj = {
      email: user?.Email,
      subject: "Forgot password",
      root: "../email-templates/forgot-password.ejs",
      templateData: { name: name, url: forgotPasswordUrl },
    };

    const emailData = await email.sendMail(mailObj);
    return emailData;
  } else {
    return { error: "User not found with this email" };
  }
};

exports.notificationMail = async (userData) => {
  let name = userData?.userName || userData.fileName;
  let msg = `You were tagged in ${userData.senderUsername}'s ${userData.type}.`;
  let redirectUrl = `${environment.FRONTEND_URL}post/${userData.postId}`;

  const mailObj = {
    email: userData.email,
    subject: "SolarConsultants notification",
    root: "../email-templates/notification.ejs",
    templateData: { name: name, msg: msg, url: redirectUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.channelNotificationEmail = async (userData) => {
  let name = userData?.Username;
  let msg = `You have been assign in SolarConsultantsTube channel by the SolarConsultantsTube Admin.
             To access your channel, log into your SolarConsultantsTube account,click on the
             SolarConsultantsTube icon at the top of the page,then click on My Channel.`;

  let redirectUrl = `${environment.FRONTEND_URL}`;
  const mailObj = {
    email: userData.Email,
    subject: "SolarConsultants notification",
    root: "../email-templates/notification.ejs",
    templateData: { name: name, msg: msg, url: redirectUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.communityApproveEmail = async (profileId, isApprove) => {
  const query =
    "select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID =?";
  const values = [profileId];
  const userData = await this.executeQuery(query, values);
  if (userData) {
    let name =
      userData[0]?.Username ||
      userData[0]?.FirstName + " " + userData[0]?.LastName;
    let msg = "";
    if (isApprove === "Y") {
      msg = `SolarConsultants.tube has approved your Practitioner account.`;
    } else {
      msg = `SolarConsultants.tube has unapproved your Practitioner account.`;
    }
    let redirectUrl = `${environment.FRONTEND_URL}`;
    const mailObj = {
      email: userData[0].Email,
      subject: "SolarConsultants notification",
      root: "../email-templates/notification.ejs",
      templateData: { name: name, msg: msg, url: redirectUrl },
    };
    await email.sendMail(mailObj);
    return;
  }
};

exports.cancelAppointmentNotificationMail = async (id, practitionerName) => {
  const query =
    "select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID =?";
  const values = [id];
  const [data] = await this.executeQuery(query, values);
  let name = data?.Username || userData.FirstName;
  let msg = `Your appointment with ${practitionerName} has been cancelled, please book another slot!`;
  let redirectUrl = `${environment.FRONTEND_URL}`;

  const mailObj = {
    email: data.Email,
    subject: "SolarConsultants notification",
    root: "../email-templates/notification.ejs",
    templateData: { name: name, msg: msg, url: redirectUrl },
  };

  await email.sendMail(mailObj);
  return;
};

exports.sendAppointmentMailToUser = async (data) => {
  const query =
    "select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID =?";
  const values = [data.profileId];
  const [userData] = await this.executeQuery(query, values);
  const query1 =
    "select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID =?";
  const values1 = [data.practitionerProfileId];
  const [practitionerData] = await this.executeQuery(query1, values1);
  if (userData) {
    let name = `Hi ${userData.Username || userData.FirstName}`;
    let msg = "";
    msg = `You have a new request for a video call with ${
      practitionerData.Username || practitionerData.FirstName
    }`;
    const date = data.date;
    const time = moment(data.date).format("hh:mm a");
    let redirectUrl = `${environment.FRONTEND_URL}appointment-call/${data.slug}-${userData.Username}`;
    const drName = practitionerData.Username;
    const patientEmail = practitionerData.Email;
    const topic = data.topics;
    const mailObj = {
      email: userData.Email,
      subject: "Request Video Call",
      root: "../email-templates/appointment-user.ejs",
      templateData: {
        name: name,
        msg: msg,
        url: redirectUrl,
        drName: drName,
        date: moment(data.date).format("MMMM Do YYYY"),
        time: time,
        email: patientEmail,
        topic: topic,
      },
    };
    const calObj = await getIcalObjectInstance(
      date,
      msg,
      redirectUrl,
      drName,
      patientEmail
    );
    await email.sendMail(mailObj, calObj);
    return;
  }
};
exports.sendAppointmentMailToPractitioner = async (data) => {
  const query =
    "select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID =?";
  const values = [data.profileId];
  const [userData] = await this.executeQuery(query, values);
  const query1 =
    "select u.Email,p.FirstName,p.LastName,p.Username from users as u left join profile as p on p.UserID = u.Id where p.ID =?";
  const values1 = [data.practitionerProfileId];
  const [practitionerData] = await this.executeQuery(query1, values1);
  if (practitionerData) {
    let name = `Hi ${practitionerData.Username || practitionerData.FirstName}`;
    let msg = "";
    msg = `You have a new request for a video call with ${
      userData.Username || userData.FirstName
    }`;
    const date = data.date;
    const time = moment(data.date).format("hh:mm a");
    let redirectUrl = `${environment.FRONTEND_URL}appointment-call/${data.slug}-${userData.Username}`;
    const userName = userData.Username;
    const patientEmail = userData.Email;
    const topic = data.topics;
    const mailObj = {
      email: practitionerData.Email,
      subject: "Request Video Call",
      root: "../email-templates/appointment-practitioner.ejs",
      templateData: {
        name: name,
        msg: msg,
        url: redirectUrl,
        userName: userName,
        date: moment(data.date).format("MMMM Do YYYY"),
        time: time,
        email: patientEmail,
        topic: topic,
      },
    };
    const calObj = await getIcalObjectInstance(
      date,
      msg,
      redirectUrl,
      userName,
      patientEmail
    );
    await email.sendMail(mailObj, calObj);
    return;
  }
};

const getIcalObjectInstance = async (
  starttime,
  description,
  url,
  name,
  email
) => {
  const cal = ical({
    domain: "healing.tube",
    name: "Appointments Reminder",
  });
  //   cal.domain("healing.tube");
  cal.createEvent({
    start: starttime, // eg : moment()
    end: moment(starttime).add(30, "min"),
    description: description, // 'More description'
    url: url, // 'event url',
    summary: "Request video call with practitioner",
    organizer: {
      // 'organizer details'
      name: name,
      email: email,
    },
  });
  return cal;
};

exports.executeQuery = async (query, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, function (err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};
