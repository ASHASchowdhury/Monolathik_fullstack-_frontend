import React, { useState } from "react";
import axios from "axios";

function DepartmentForm({ onDepartmentAdded, editingDepartment }) { // Added editingDepartment prop
  const [department, setDepartment] = useState({
    name: "",
    description: "",
  });

  // Update form when editingDepartment changes
  React.useEffect(() => {
    if (editingDepartment) {
      setDepartment({
        name: editingDepartment.name,
        description: editingDepartment.description || "",
      });
    } else {
      setDepartment({ name: "", description: "" });
    }
  }, [editingDepartment]);

  const handleChange = (e) => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        // Update existing department
        await axios.put(`http://10.0.6.1:8080/departments/${editingDepartment.id}`, department);
        alert("Department updated successfully!");
      } else {
        // Add new department
        await axios.post("http://10.0.6.1:8080/departments", department);
        alert("Department added successfully!");
      }
      setDepartment({ name: "", description: "" });
      onDepartmentAdded(); // refresh list
    } catch (err) {
      console.error("Error saving department:", err);
      alert("Error saving department");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>{editingDepartment ? "Edit Department" : "Add Department"}</h2>


      <div>
        <span style={{ fontWeight: "bold" }}>Department Name</span>
      <input
        type="text"
        id="name"
        name="name"
        value={department.name}
        placeholder="Enter department name"
        onChange={handleChange}
        required
      />
      </div>


      <div>
        <span style={{ fontWeight: "bold" }}>Description</span>
      <input
        type="text"
        id="description"
        name="description"
        value={department.description}
        placeholder="Enter description"
        onChange={handleChange}
        style={{gridColumn: "span 2"}}
      />
      </div>
      <button 
        type="submit" 
        style={{
          gridColumn: "span 2", 
          height: "30px", 
          padding: "5px 10px",
          width: "150px",
          justifySelf: "start"
          
        }}
      >
        {editingDepartment ? "Update" : "Save"}
      </button>
    </form>
  );
}

export default DepartmentForm;       /* DepartmentModal.css */


/* Other styles (modal-overlay, header, body, footer) can be shared with Employee modal */