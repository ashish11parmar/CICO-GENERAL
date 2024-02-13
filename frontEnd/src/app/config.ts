// let url = 'https://hrms.mylionsgroup.com/wp-json/'; // production
// let url = 'https://hrms-staging.raoinfo.tech/wp-json/'; // production
let scriptUrl = 'https://script.google.com/macros/s/'; // script URL
// let url = 'https://hrms-demo.raoinfo.tech/wp-json/'; // DEMO URL
// let url = 'https://hrms-demo.raoinfo.tech/wp-json/'; // DEMO URL
let url = 'https://app.cico.raoinfo.tech/wp-json/'; // GENRAL VERSION DEMO URL

// console.log = function () { }
// console.log = function () { }
export const config = {
  version: require('../../package.json').version,
  authUrl: `${url}jwt-auth/v1/token`,
  attendance: `${url}cico/v2/attendance/lists`,
  employeeList: `${url}wp/v2/`,
  usersMe: `${url}wp/v2/users/me?context=edit`,
  hrms: `${url}erp/v1/hrm/`,
  updateUser: `${url}wp/v2/`,
  cicohrms: `${url}cico/v1/hrm/`,
  updatePswd: `${url}cico/v1/hr/`,
  Regularizations: `${url}wp/v2/regularization`,
  regularizationsStatus: `${url}wp/v2/`,
  uploadMediaUrl: `${url}wp/v2/media`,
  attendanceURL: `${url}cico/v2/attendance`,
  /** @note signup for new company start */ 
  createCompany: `${url}wp/v2/users`,
  verifyCompany: `${url}cico/v2/company/`,
  sendCode: `${url}cico/v2/company/verify`,
  getCompany: `${url}wp/v2/users/me`,
  /** @note signup for new company end */
  department: `${url}erp/v1/hrm/departments?per_page=100&page=1`,
  // dailyLogsSheet: `1DbngGz7Cdgxe9NmPU-2Evxzzl88n5hrhrCzhSp2Ytek`, //production
  dailyLogsSheet: `1b0hG8Sb0xFsadfdxP9vlX_BpbWs_VcXXnrUsAO1DU94`,
  // masterAttendanceSheet: `17msvVsLoNeEHLPwR_ONFYxoOEebtYvdw6MYgYW81dZc`, //prod
  // masterAttendanceSheet : `1qcch_bXcNye2v-XLuBhg8ey-jk-OHRZmrGW7TXbppGg`, //staging
  masterAttendanceSheet: `1ewZVc6uc9oFqh_9jIVWpdknt3JFF0ZIGFp3Ss37SEYE`, // demo CICO master sheet.
  logsAppScriptAPI: `https://script.google.com/macros/s/AKfycbyvYoUtOHTh4w9DeGkzQLYFcmMos7zMc4UKzq-pFrxhw74jtVVZMDWQzvtttc1PNZ62Rg/exec`,
  getUrl: `https://script.google.com/macros/s/AKfycbx1wYrX1YgXRoa5f_ZlBJiAGpiem1ph4A-Ti3X4eh6ZycCa0PazZz0pxEsT1IaMk67cAw/exec`,
  RequesteLeave: `${url}cico/v1/hrm/leaves/pending`,
  // reminderConfigSheetId: '1xM3wD2l0oP_VmmQt-G9fz-NFteHfTGZXWeVx4gP8KcU', // production
  reminderConfigSheetId: '156D0sfgrdcN_1paNhUKZqisKxouYC88TlYkNxBUzdPE', // Demo
  updateReminderUrl: `${scriptUrl}AKfycbwSpfWLG81dYHc_fJuCbAY6wpANo3z7TrTgV1jp0POkYSy4qKwU-xSEFQNZBqmucuLMpQ/exec` /** Updating reminder */,
  addReminderUrl: `${scriptUrl}AKfycbwm4S9OV9t6YiRdO0xxCG3pKH-xwE5J1XESN6yIflef7afvLWwFuYLnJoD0ilAgGJFh/exec` /** Adding new reminder */,
  getJSONResponse: `${scriptUrl}AKfycbxghygDnadloKuX1bvehjW_i8M_QJ0caSEY1zXB6f8HHcw4-M3rwuz1tLR12gRxvnmv/exec`,
  reminderTitleOptions: [
    'Reminder for Clock in',
    "It's time for lunch!",
    "It's time for Tea!",
    "It's time for Coffee!",
    'Reminder for Stop break',
    'Good Night, see you tomorrow!',
  ],
  remidnerMesageOptions: [
    "Don't forget to clock in for marking your visit!",
    "Don't forget to start your break in CICO ",
    'Enjoy your tea break',
    'Enjoy your coffee break',
    "Hope you enjoyed your meal, let's get back to work!",
    "Don't forget to stop your logs in CICO",
  ],
  regularizationShiftTime: ['10:00:00', "13:30:00", '14:30:00', '19:30:00'],
  regularizationShiftStatus: ['clock-start', "break-start", 'break-stop', 'clock-stop'],
  defaultLocation: ['22.2937005', '70.746129'], // First is latitude and second is longitude
  regularizationScriptUrl: `${scriptUrl}AKfycbzyQAvlcKNimuLtLLv-jjDSWJsvlcyqDmugvzk-S81RtQD7dfc3LODFH1uu28WDZkPsaQ/exec`,
  clockStartTime: '10:15:00',
  indexedDbDatabaseName: 'UserLogs',
  indexedDbDatabaseVersion: 3,
  reportingManagerList: ['HR', 'Team Lead', 'Project Manager', 'SDE - 3', 'Solutions Architect', 'Sr. Web Designer'],
};
