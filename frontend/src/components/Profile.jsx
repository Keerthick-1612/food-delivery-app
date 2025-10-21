import React from "react";
import { Link } from "react-router-dom";

function Profile({ user }) {
  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      {user.role === "customer" && (
        <p style={{ marginTop: 12 }}>
          <Link to="/menu">View Menu</Link>
        </p>
      )}
      {user.role === "admin" && (
        <p style={{ marginTop: 12 }}>
          <Link to="/admin">Go to Admin Dashboard</Link>
        </p>
      )}
    </div>
  );
}

export default Profile;
