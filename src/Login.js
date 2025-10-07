import React, { useState } from 'react';


function Login({ onLogin }) {

  console.log('onLogin prop:', onLogin);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent page refresh
    if (onLogin) {
      onLogin(username, password);  
    } else {
      console.error("onLogin function is not defined!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 shadow-sm bg-light rounded">
      <h2 className="mb-4">Sign In</h2>
      <div className="mb-3">
        <label htmlFor="username" className="form-label">Username</label>
        <input
          type="text"
          className="form-control"
          id="username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"  // Add autocomplete attribute
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"  // Add autocomplete attribute
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-100">Log In</button>
    </form>
  );
}

export default Login;