const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const settingSchema = new Schema({
    autoClockOutTime: {
        type: String
    },
    shiftStartTime: {
        type: String
    },
    shiftStopTime: {
        type: String
    },
    companyName: {
        type: String
    },
    multipleLocation: [
        {
            type: Object
        }
    ]
})

const Setting = mongoose.model('setting', settingSchema);
module.exports = Setting