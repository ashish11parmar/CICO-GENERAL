const Employee = require("../model/employee-model");


const getAllEmployees = async (req, res) => {
    const employees = await Employee.find();
    if (!employees) return res.status(204).json({ message: "No employees found" });
    res.json(employees);

}

const createNewEmployee = async (req, res) => {
    const { name, email, phone, salary } = req.body;
    if (!name || !email || !phone || !salary) {
        res.status(400).json({ message: "All fields are required" })
    }
    const employee = await Employee.create(req.body);
    if (!employee) {
        res.status(400).json({ message: "Invalid employee data received" })
    }

    console.log('Cookies: ', req.headers.authorization)
    console.log(employee);
    res.status(201).json({ employee });
}




const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    if (!id) return res.status(400).json({ message: "Employee ID required" })
    const employee = await Employee.findOne({ _id: id }).exec();
    if (!employee) {
        return res.status(400).json({ message: `Employee not found` })
    }
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (password) employee.password = password;
    const updatedEmployee = await employee.save();
    res.status(200).json({ updatedEmployee })
}


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

module.exports = { getAllEmployees, createNewEmployee, updateEmployee, deleteEmployee }