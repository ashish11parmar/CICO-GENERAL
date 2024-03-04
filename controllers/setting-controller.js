const settingModel = require('../model/setting.model');
const User = require('../model/user.model');

const settingController = {};

settingController.createSettingCompanyWise = async (req, res) => {
    const companyId = req.user.id
    try {
        req.body.companyId = companyId;
        const setting = await settingModel.create(req.body);
        res.status(201).json({ msg: "setting created successfully", data: setting });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: error.message });
    }

}
settingController.getCompanySettings = async (req, res) => {
    const companyId = req.user.id
    try {
        const company = await User.findById({ _id: companyId })
        const settings = await settingModel.find({ companyId: companyId });
        let settingPayload = {
            companyname: company.companyname,
            autoClockOutTime: settings[0].autoClockOutTime,
            shiftStartTime: settings[0].shiftStartTime,
            shiftStopTime: settings[0].shiftStopTime,
            multipleLocation: settings[0].multipleLocation
        }
        res.status(200).json({ msg: 'Setting found for this company', data: settingPayload });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: error.message });
    }
}
settingController.updateCompanySettings = async (req, res) => {
    console.log("update setting");
}
settingController.deleteCompanySettings = async (req, res) => {
    console.log("delete setting");
}

module.exports = settingController;