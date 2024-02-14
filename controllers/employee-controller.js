const Employee = require("../model/user.model");

// get all user from database
const getAllEmployees = async (req, res) => {
    const employees = await Employee.find();
    if (!employees) return res.status(400).json({ message: "No employee found.", data: { status: 400 } });
    res.json(employees);
}

// this function will Update the employee details using id 
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "employee id is required.", data: { status: 400 } });
    const employee = await Employee.findOne({ email: req.body.email })
    if (employee) return res.status(400).json({ message: "Email already exists.", data: { status: 400 } });
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({ updatedEmployee })
}


// This function will delete the employee using there is 
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (!id) return res.status(400).json({ message: "employee id is required.", data: { status: 400 } });
    const employee = await Employee.findOneAndDelete({ _id: id }).exec();
    if (!employee) { return res.status(400).json({ message: "employee not found.", data: { status: 400 } }); }
    res.status(400).json({ message: "employee deleted successfully", data: { status: 400 } });
}

module.exports = { getAllEmployees, updateEmployee, deleteEmployee }