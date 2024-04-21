import { useState } from "react";
import FirebaseAuthService from "../FirebaseAuthService";

function LoginForm({ existinUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await FirebaseAuthService.registerUser(username, password);
      setUsername("");
      setPassword("");
    } catch (error) {
      alert(error.message);
    }
  }
  function handleLogout() {
    FirebaseAuthService.logoutUser();
  }
  return (
    <div className="login-form-container">
      {existinUser ? (
        <div className="row">
          <h3>Welcome {existinUser.email}</h3>
          <button type="button" className="primary-button" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-label login-label"> Username:Email
          <input
            type="text"
            required
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="input-label login-label"> Username:Password
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <div className="button-box">
              <button className="primary-button" type="submit">Register</button>
            </div>
        </form>
      )}
    </div>
  );
}

export default LoginForm;
