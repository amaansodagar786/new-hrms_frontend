import React from 'react';
import EmployeeSalary from '../../Employee/Salary/EmployeeSalary';
import './ManagerSalary.scss';

const ManagerSalary = () => {
  return (
    <div className="manager-salary">
      <div className="manager-salary-header">
        <h1>My Salary</h1>
        <p>View your salary details, payment history, and download payslips</p>
      </div>
      <EmployeeSalary />
    </div>
  );
};

export default ManagerSalary;