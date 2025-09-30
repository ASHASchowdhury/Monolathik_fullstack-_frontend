import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import EmployeePage from "./pages/EmployeePage";
import DepartmentPage from "./pages/DepartmentPage";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  // If you want to use the dashboard as main interface
  if (currentView === "dashboard") {
    return <Dashboard />;
  }

  // If you want to keep your original layout with navigation
  return (
    <div className="container">
      <h1>Office Management System</h1>
      <div className="nav">
        <button onClick={() => setCurrentView("dashboard")}>Dashboard</button>
        <button onClick={() => setCurrentView("employees")}>Employees</button>
        <button onClick={() => setCurrentView("departments")}>Departments</button>
      </div>

      {currentView === "employees" && <EmployeePage />}
      {currentView === "departments" && <DepartmentPage />}
    </div>
  );
}

export default App;