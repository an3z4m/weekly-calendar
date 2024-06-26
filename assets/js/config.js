

var allTimeslots = [];

var allClients = [];

var workdays = [];


const timeslotHourWidth = 14;
const firstTimeslotLeftPadding = 14;
const hoursPerDay  = 12;
const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const week_workingdays = 7;

const todayDate = new Date();
const currentDay = todayDate.getDay();
const currentHour = todayDate.getHours(); // + new Date().getMinutes() / 60;

const startingHour = 8;
const endingHour = 20;

const configCheckAvailability = false;


// allow assigning timeslots to the past
const configAllowPastAssign = true;
