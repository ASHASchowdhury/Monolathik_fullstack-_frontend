import React, { useState, useEffect } from "react";
import axios from "axios";
import DepartmentList from "../components/DepartmentList";
import DepartmentForm from "../components/DepartmentFrom"; // Fixed typo: DepartmentFrom → DepartmentForm

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://10.0.6.1:8080/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDepartmentAdded = () => {
    setEditingDepartment(null);
    fetchDepartments();
  };

  const handleEditDepartment = (dept) => {
    setEditingDepartment(dept);
  };

  const handleViewDepartment = (dept) => {
    alert(`Department Details:\nID: ${dept.id}\nName: ${dept.name}\nDescription: ${dept.description}`);
  };

  return (
    <div>
      <DepartmentForm
        onDepartmentAdded={handleDepartmentAdded}
        editingDepartment={editingDepartment}
      />
      <DepartmentList
        departments={departments}
        onDepartmentDeleted={fetchDepartments}
        onEditDepartment={handleEditDepartment}
        onViewDepartment={handleViewDepartment}
      />
    </div>
  );
}

export default DepartmentPage;