var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Appointments = function (appointment) {
  this.appointmentDateTime = appointment.appointmentDateTime;
  this.profileId = appointment.profileId;
  this.practitionerProfileId = appointment.practitionerProfileId;
  this.practitionerName = appointment.practitionerName;
  this.isCancelled = appointment?.isCancelled || "N";
};

Appointments.findAndSearchAll = async (
  limit,
  offset,
  search,
  startDate,
  endDate
) => {
  let whereCondition = `${
    search ? `a.practitionerName LIKE '%${search}%'` : ""
  }`;

  if (startDate && endDate) {
    whereCondition += `${
      search ? `AND` : ``
    } a.createdDate >= '${startDate}' AND a.createdDate <= '${endDate}'`;
  } else if (startDate) {
    whereCondition += `${search ? `AND` : ``} a.createdDate >= '${startDate}'`;
  } else if (endDate) {
    whereCondition += `${search ? `AND` : ``} a.createdDate <= '${endDate}'`;
  }
  const searchCount = await executeQuery(
    `SELECT count(id) as count FROM appointments as a ${
      whereCondition ? `WHERE ${whereCondition} ` : ""
    }`
  );
  const searchData = await executeQuery(
    `SELECT a.id, a.practitionerName, a.appointmentDateTime, a.createdDate,a.profileId,a.isCancelled,p.FirstName,p.LastName,p.ProfilePicName,p.Username FROM appointments as a left join profile as p on p.ID = a.profileId  ${
      whereCondition ? `WHERE ${whereCondition} ` : ""
    } order by createdDate desc limit ? offset ?`,
    [limit, offset]
  );

  return {
    count: searchCount?.[0]?.count || 0,
    data: searchData,
  };
};

Appointments.createAppointments = async (data) => {
  const query = "Insert into appointments set ?";
  const values = [data];
  const appointment = await executeQuery(query, values);
  console.log(appointment.insertId);
  if (appointment) {
    return appointment.insertId;
  }
};

Appointments.findAppointmentByDate = async (date) => {
  const query = "Select * from appointments where appointmentDateTime = ?";
  const values = [date];
  const appointments = await executeQuery(query, values);
  if (appointments) {
    return appointments;
  } else {
    return null;
  }
};

Appointments.getPractitionerAppointments = async (id) => {
  const query =
    "select a.*,p.Username,p.FirstName,p.LastName,p.ProfilePicName from appointments as a left join profile as p on p.ID = a.profileId where a.isCancelled = 'N' and a.practitionerProfileId = ?";
  const values = [id];
  const appointmentList = await executeQuery(query, values);
  if (appointmentList) {
    return appointmentList;
  } else {
    return [];
  }
};

Appointments.getUserAppointments = async (id) => {
  const query =
    "select a.*,p.Username,p.FirstName,p.LastName,p.ProfilePicName from appointments as a left join profile as p on p.ID = a.practitionerProfileId where a.isCancelled = 'N' and a.profileId = ?";
  const values = [id];
  const appointmentList = await executeQuery(query, values);
  if (appointmentList) {
    return appointmentList;
  } else {
    return [];
  }
};

Appointments.changeAppointmentStatus = async (id) => {
  const query = "update appointments set isCancelled = 'Y' where id =?";
  const values = [id];
  const data = await executeQuery(query, values);
  if (data) {
    return true;
  } else {
    return false;
  }
};

module.exports = Appointments;
