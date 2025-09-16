import React, { useState } from "react";
import axios from "axios";

function EmployeeForm() {
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    departmentId: "",
  });

  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/employees", employee);
      alert("Employee added successfully!");
      setEmployee({ name: "", email: "", departmentId: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding employee");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Add Employee</h2>
      <input 
        type="text"
        name="name"
        value={employee.name}
        placeholder="Name"
        onChange={handleChange}
        required
      />
      <input 
        type="email"
        name="email"
        value={employee.email}
        placeholder="Email"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="departmentId"
        value={employee.departmentId}
        placeholder="Department ID"
        onChange={handleChange}
        required
      />
      <button type="submit">Add Employee</button>
    </form>
  );
}

export default EmployeeForm;
 