const utils = require("../helpers/utils");
const Appointments = require("../models/appointments.model");
const moment = require("moment");

const { getPagination, getCount, getPaginationData } = require("../helpers/fn");

exports.findAll = async (req, res) => {
  const { page, size, search, startDate, endDate } = req.body;
  const { limit, offset } = getPagination(page, size);
  const searchCountData = await Appointments.findAndSearchAll(
    limit,
    offset,
    search,
    startDate,
    endDate
  );
  return res.send(
    getPaginationData(
      { count: searchCountData.count, docs: searchCountData.data },
      page,
      limit
    )
  );
};

exports.createAppointment = async (req, res) => {
  const data = req.body?.appointment;
  const topics = req.body?.topics;
  const date = moment(data.appointmentDateTime).format("YYYY-MM-DD HH:MM:SS");
  console.log(date);
  const appointmentData = {
    appointmentDateTime: date,
    profileId: data.profileId,
    practitionerProfileId: data.practitionerProfileId,
    practitionerName: data.practitionerName,
  };
  const slug = req.body?.slug;
  if (appointmentData) {
    const oldAppointment = await Appointments.findAppointmentByDate(date);
    if (oldAppointment.length) {
      return res.send({
        error: false,
        message:
          "Appointments already book with other patient, please select other slots!",
      });
    } else {
      const id = await Appointments.createAppointments(appointmentData);
      const emailData = {
        profileId: appointmentData.profileId,
        practitionerProfileId: appointmentData.practitionerProfileId,
        topics: topics,
        slug: slug,
        date: moment(date).format("YYYY-MM-DDTHH:mm:ss[Z]"),
      };
      await utils.sendAppointmentMailToPractitioner(emailData);
      await utils.sendAppointmentMailToUser(emailData);
      console.log(id);
      if (id) {
        return res.json({
          error: false,
          message: "Your appointment is booked please check your mail.",
        });
      } else {
        return res
          .status(401)
          .send({ error: true, message: "something went wrong" });
      }
    }
  }
};

exports.getPractitionerAppointments = async (req, res) => {
  const id = req.params.id;
  if (id) {
    const appointmentsList = await Appointments.getPractitionerAppointments(id);
    if (appointmentsList.length) {
      res.send({ error: false, data: appointmentsList });
    } else {
      res.send({ error: false, message: "Appointments not found!" });
    }
  } else {
    res.status(400).send({ error: true, message: "something went wrong!" });
  }
};

exports.getUserAppointments = async (req, res) => {
  const id = req.params.id;
  if (id) {
    const appointmentsList = await Appointments.getUserAppointments(id);
    if (appointmentsList.length) {
      res.send({ error: false, data: appointmentsList });
    } else {
      res.send({ error: false, message: "Appointments not found!" });
    }
  } else {
    res.status(400).send({ error: true, message: "something went wrong!" });
  }
};

exports.changeAppointmentStatus = async (req, res) => {
  const data = req.body;
  if (data.appointmentId) {
    const isUpdate = await Appointments.changeAppointmentStatus(
      data.appointmentId
    );
    if (isUpdate) {
      await utils.cancelAppointmentNotificationMail(
        data.profileId,
        data.practitionerName
      );
      await utils.cancelAppointmentNotificationMail(
        data.practitionerProfileId,
        data.practitionerName
      );
      res.send({
        error: false,
        message: "Your appointment has been cancelled",
      });
    } else {
      res.send({ error: false, message: "Appointments not found!" });
    }
  } else {
    res.status(400).send({ error: true, message: "something went wrong!" });
  }
};
