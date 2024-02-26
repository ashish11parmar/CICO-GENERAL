const { Designation, Types, Roles} = require('../model/hrms.model');

//_____________Employee Designation_________________
const getDesignations = async (req, res) => {
    try {
        const designations = await Designation.find();
        res.status(200).json(designations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createDesignation = async (req, res) => {
    try {
        const designation = await Designation.findOne({ title: req.body.title })
        if (designation) {
            return res.status(400).json({ message: "Designation already exists" })
        } else {
            const designation = new Designation(req.body);
            await designation.save();
            res.status(201).json({ msg: "designation added successfully.", data: designation });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const updateDesignation = async (req, res) => {
    try {
        const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ msg: "Designation updated.", data: designation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteDesignation = async (req, res) => {
    try {
        const designation = await Designation.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: "Designation deleted.", data: designation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//_____________Employee Type________________________
const getEmployeeTypes = async (req, res) => {
    try {
        const types = await Types.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const createEmployeeType = async (req, res) => {
    try {
        const empType = await Types.findOne({ title: req.body.title })
        if (empType) {
            return res.status(400).json({ message: "employee types already exists" })
        } else {
            const types = new Types(req.body);
            await types.save();
            res.status(201).json({ msg: "employee types added successfully.", data: types });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}
const updateEmployeeType = async (req, res) => {
    try {
        const types = await Types.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ msg: "employee types updated.", data: types });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}
const deleteEmployeeType = async (req, res) => {
    try {
        const types = await Types.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: "employee types deleted.", data: types });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
}

//________________Employee Role_______________________

const createEmployeeRole = async (req, res)=>{
    try {
        const empRole = await Roles.findOne({ title: req.body.title })
        if (empRole) {
            return res.status(400).json({ message: "employee types already exists" })
        } else {
            const roles = new Roles(req.body);
            await roles.save();
            res.status(201).json({ msg: "employee roles added successfully.", data: roles });
        }
    }catch (e){
        res.status(500).json({msg: e.message})
    }
}
const getEmployeeRoles = async (req, res)=>{
    try {
        const roles = await Roles.find();
        res.status(200).json(roles);
    }catch (e){
        res.status(500).json({msg: e.message})
    }
}



module.exports = { createDesignation, getDesignations, updateDesignation, deleteDesignation, getEmployeeTypes, createEmployeeType, updateEmployeeType, deleteEmployeeType, createEmployeeRole, getEmployeeRoles }