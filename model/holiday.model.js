const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const holidaySchema = new Schema({

    holidayName: {
        type: String
    },
    description: {
        type: String
    },
    startDate: {
        type: String
    },
    endDate: {
        type: String
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
})

const Holiday = mongoose.model('holiday', holidaySchema);
module.exports = Holiday