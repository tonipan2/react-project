import React from 'react';

function Dashboard({ userData, onLogout }) {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Dashboard</h2>
      {/* Menu Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm rounded">
        <div className="container-fluid">
          <span className="navbar-brand">Welcome, {userData?.username || 'User'}!</span>
          <button className="btn btn-outline-danger ms-auto" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Dashboard;
