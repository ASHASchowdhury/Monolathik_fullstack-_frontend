import React, { useState } from "react";
import axios from "axios";

function DepartmentForm({ onDepartmentAdded, editingDepartment }) { // Added editingDepartment prop
  const [department, setDepartment] = useState({
    name: "",
    description: "",
  });
  const [modalMessage, setModalMessage] = useState("");
const [isModalOpen, setIsModalOpen] = useState(false);
  

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
      await axios.put(`http://10.0.6.1:8080/departments/${editingDepartment.id}`, department);
      setModalMessage("Department updated successfully!");
      setIsModalOpen(true);
    } else {
      await axios.post("http://10.0.6.1:8080/departments", department);
      setModalMessage("Department added successfully!");
      setIsModalOpen(true);
    }
    setDepartment({ name: "", description: "" });
    onDepartmentAdded(); // refresh list
  } 
     catch (err) {
    console.error("Error saving department:", err);
    setModalMessage("Error saving department");
    setIsModalOpen(true);
  }
  };

  return (
  <>
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
        />
      </div>

      <button type="submit">
        {editingDepartment ? "Update" : "Save"}
      </button>
    </form>

    {/* ✅ Modal */}
    {isModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Message</h3>
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
          </div>
          <div className="modal-body">
            <p>{modalMessage}</p>
          </div>
          <div className="modal-footer">
            <button className="modal-ok-btn" onClick={() => setIsModalOpen(false)}>OK</button>
          </div>
        </div>
      </div>
    )}
  </>
);

}

export default DepartmentForm;       /* DepartmentModal.css */


/* Other styles (modal-overlay, header, body, footer) can be shared with Employee modal */