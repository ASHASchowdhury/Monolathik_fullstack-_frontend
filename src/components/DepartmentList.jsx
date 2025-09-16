import React, { useEffect, useState } from "react";
import axios from "axios";

function DepartmentList() {
  const [departments, setDepartments] = useState([]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Error deleting department");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="list">
      <h2>Departments</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.name}</td>
              <td>{d.description}</td>
              <td>
                <button onClick={() => deleteDepartment(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentList;
