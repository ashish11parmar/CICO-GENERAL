const express = require('express');
const { verifyToken } = require('../services/verifyToken');
const hrmsController = require('../controllers/hrms-controller');
const { validateHoliday } = require('../validation/validate-controller');
const settingController = require('../controllers/setting-controller');
const router = express.Router();

//_____________Employee Designation_________________
router.post('/designation', verifyToken, hrmsController.createDesignation)
router.get('/designation', hrmsController.getDesignations)
router.put('/designation/:id', hrmsController.updateDesignation)
router.delete('/designation/:id', hrmsController.deleteDesignation)

//_____________Employee Type______________________
router.get('/types', hrmsController.getEmployeeTypes)
router.post('/types', verifyToken, hrmsController.createEmployeeType)
router.put('/types/:id', hrmsController.updateEmployeeType)
router.delete('/types/:id', hrmsController.deleteEmployeeType)

// ____________Employee Role______________________
router.post('/roles', verifyToken, hrmsController.createEmployeeRole)
router.get('/roles', hrmsController.getEmployeeRoles)


//_____________Employee HRMS All__________________
router.get('', hrmsController.allHrmsType)

//_____________Employee Holiday API_______________
router.post('/holiday', validateHoliday, verifyToken, hrmsController.createHoliday)
router.get('/holiday', verifyToken, hrmsController.getAllHoliday)
router.put('/holiday/:id', validateHoliday, verifyToken, hrmsController.updateHoliday)
router.delete('/holiday/:id', verifyToken, hrmsController.deleteHoliday)


//_____________Company Setting Routes_____________
router.post('/company', verifyToken, settingController.createSettingCompanyWise)
router.get('/company', verifyToken, settingController.getCompanySettings)
router.put('/company/:id', verifyToken, settingController.updateCompanySettings)
router.delete('/company/:id', verifyToken, settingController.deleteCompanySettings)

module.exports = router