import React, { useState } from "react";
import axios from "axios";

function DepartmentForm() {
  const [department, setDepartment] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/departments", department);
      alert("Department added successfully!");
      setDepartment({ name: "", description: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding department");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Add Department</h2>
      <input
        type="text"
        name="name"
        value={department.name}
        placeholder="Department Name"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="description"
        value={department.description}
        placeholder="Description"
        onChange={handleChange}
        required
      />
      <button type="submit">Add Department</button>
    </form>
  );
}

export default DepartmentForm;
