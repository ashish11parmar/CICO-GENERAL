const validateAdmin = async (req, res, next) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password || !req.body.phoneNumber || !req.body.companyname) {
        return res.status(400).json({ message: 'All field are required.' })
    }
    next();
}
const validateLogin = async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Email and Password is required' })
    }
    next();
}
const validateCreateEmp = async (req, res, next) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password || !req.body.gender || !req.body.hiringDate || !req.body.status || !req.body.department || !req.body.type || !req.body.role) {
        return res.status(400).json({ message: 'All field are required.' })
    }
    next();
}

const validateHoliday = async (req, res, next) => {
    console.log(req.body);
    if (!req.body.holidayName || !req.body.startDate || !req.body.endDate || !req.body.description) {
        return res.status(400).json({ message: 'All field are required.' })
    }
    next();
}

module.exports = { validateAdmin, validateLogin, validateCreateEmp, validateHoliday }