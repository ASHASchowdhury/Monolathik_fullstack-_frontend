import React, { useState, useEffect } from "react";
import axios from "axios";


function EmployeeForm({ onEmployeeAdded, selectedEmployee, onUpdateComplete }) {
  const [employee, setEmployee] = useState({
    id: null,
    name: "",
    phoneNumber: "",
    email: "",
    gender: "",
    active: true,
    departmentDTO: { id: "" },
  });

  const [departments, setDepartments] = useState([]);

  // Load departments
  useEffect(() => {
    axios.get("http://10.0.6.1:8080/departments")
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));
  }, []);

  // Load selected employee for update
  useEffect(() => {
    if (selectedEmployee) {
      setEmployee(selectedEmployee);
    }
  }, [selectedEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (employee.id) {
        // Update
        await axios.put(`http://10.0.6.1:8080/employees/${employee.id}`, employee);
        alert("Employee updated successfully!");
        onUpdateComplete();
      } else {
        // Add
        await axios.post("http://10.0.6.1:8080/employees", employee);
        alert("Employee added successfully!");
        onEmployeeAdded();
      }

      setEmployee({
        id: null,
        name: "",
        phoneNumber: "",
        email: "",
        gender: "",
        active: true,
        departmentDTO: { id: "" },
      });
    } catch (err) {
      console.error(err);
      alert("Error saving employee");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2 style={{ gridColumn: "span 2" }}>
        {employee.id ? "Update Employee" : "Add Employee"}
      </h2>

    <div style={{ gridColumn: "span 2" }}>
    <span style={{ fontWeight: "bold" }}>Name</span>
    <input
      type="text"
      id="name"
      name="name"
      value={employee.name}
      placeholder="Enter name"
      onChange={handleChange}
      required
    />
  </div>

     <div>
   <span style={{ fontWeight: "bold" }}>Phone Number</span>
    <input
      type="text"
      id="phoneNumber"
      name="phoneNumber"
      value={employee.phoneNumber}
      placeholder="Enter phone number"
      onChange={handleChange}
      required
    />
  </div>
      
      <div>
        <span style={{ fontWeight: "bold" }}>Email</span>
      <input
        type="email"
        name="email"
        value={employee.email}
        placeholder="Enter email"
        onChange={handleChange}
        required
      />
      </div>

      <div>
      <span style={{ fontWeight: "bold" }}>Select Gender</span>
      <select
        name="gender"
        value={employee.gender}
        onChange={handleChange}
        required
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      </div>

      <div>
        <span style={{ fontWeight: "bold" }}>Select Department</span>
      <select
        name="departmentId"
        value={employee.departmentDTO.id}
        onChange={(e) => setEmployee({ ...employee, departmentDTO: { id: Number(e.target.value) } })}
        required
        style={{ gridColumn: "span 2" }}
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>
       </div>
       
         <div className="radio-container" style={{ gridColumn: "span 2" }}>
        <span>Active:</span>
        <input
          type="radio"
          id="active-yes"
          name="active"
          checked={employee.active === true}
          onChange={() => setEmployee({ ...employee, active: true })}
        />
        <label htmlFor="active-yes">Yes</label>

        <input
          type="radio"
          id="active-no"
          name="active"
          checked={employee.active === false}
          onChange={() => setEmployee({ ...employee, active: false })}
        />
        <label htmlFor="active-no">No</label>
      </div>


      <button type="submit" style={{ gridColumn: "span 2", height: "30px", padding: "5px 10px", width: "150px", justifySelf: "start" }}>
        {employee.id ? "Update" : "Save"}
      </button>
    </form>
  );
}

export default EmployeeForm;
