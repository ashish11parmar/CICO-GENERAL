const Employee = require("../model/Userschema");

// get all user from database
const getAllEmployees = async (req, res) => {
    const employees = await Employee.find();
    if (!employees) return res.status(204).json({ message: "No employees found" });
    res.json(employees);
}

// this function will Update the employee details using id 
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, companyname, phone, email, password } = req.body;
    if (!id) return res.status(400).json({ message: "Employee ID required" })
    const employee = await Employee.findOne({ _id: id }).exec();
    if (!employee) {
        return res.status(400).json({ message: `Employee not found` })
    }

    console.log(employee, req.body);

    const updatedEmployee = await Employee.findByIdAndUpdate(id, { firstname, lastname, companyname, phone, email, password }, { new: true })
    updatedEmployee.save();
    res.status(200).json({ updatedEmployee })
}


// This function will delete the employee using there is 
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (!id) {
        return res.status(400).json({ message: "Employee ID required" })
    }
    const employee = await Employee.findOneAndDelete({ _id: id }).exec();
    if (!employee) {
        return res.status(400).json({ message: `Employee not found` })
    }
    res.status(200).json({ message: `Employee deleted` })
}

module.exports = { getAllEmployees, updateEmployee, deleteEmployee }