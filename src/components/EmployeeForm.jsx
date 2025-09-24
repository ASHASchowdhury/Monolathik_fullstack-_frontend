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
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load departments
  useEffect(() => {
    axios
      .get("http://10.0.6.1:8080/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Load selected employee for update
  useEffect(() => {
    if (selectedEmployee) {
      setEmployee(selectedEmployee);
    } else {
      resetForm();
    }
  }, [selectedEmployee]);

  const resetForm = () => {
    setEmployee({
      id: null,
      name: "",
      phoneNumber: "",
      email: "",
      gender: "",
      active: true,
      departmentDTO: { id: "" },
    });
  };

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
        setModalMessage("Employee updated successfully!");
        setIsModalOpen(true);
        onUpdateComplete();
      } else {
        // Add
        await axios.post("http://10.0.6.1:8080/employees", employee);
        setModalMessage("Employee added successfully!");
        setIsModalOpen(true);
        onEmployeeAdded();
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setModalMessage("Error saving employee");
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <h2 style={{ gridColumn: "span 2" }}>
          {employee.id ? "Update Employee" : "Add Employee"}
        </h2>

        <div style={{ gridColumn: "span 2" }}>
          <label><strong>Name</strong></label>
          <input
            type="text"
            name="name"
            value={employee.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label><strong>Phone Number</strong></label>
          <input
            type="text"
            name="phoneNumber"
            value={employee.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label><strong>Email</strong></label>
          <input
            type="email"
            name="email"
            value={employee.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label><strong>Gender</strong></label>
          <select name="gender" value={employee.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label><strong>Department</strong></label>
          <select
            name="departmentId"
            value={employee.departmentDTO.id || ""}
            onChange={(e) =>
              setEmployee({
                ...employee,
                departmentDTO: { id: Number(e.target.value) },
              })
            }
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
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

        <button
          type="submit"
          style={{
            gridColumn: "span 2",
            height: "35px",
            width: "150px",
            justifySelf: "start",
          }}
        >
          {employee.id ? "Update" : "Save"}
        </button>
      </form>

      {/* ✅ Modal Popup - Same as DepartmentForm */}
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

export default EmployeeForm;