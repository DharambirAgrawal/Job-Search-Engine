import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "./Toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      showToast("Please enter a name", "error");
      return;
    }

    const userData = {
      name: userName,
      skills: userSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    };

    try {
      if (editingUserId) {
        await api.updateUser(editingUserId, userData);
        showToast("User updated successfully", "success");
        setEditingUserId(null);
      } else {
        await api.addUser(userData);
        showToast("User added successfully", "success");
      }
      setUserName("");
      setUserSkills("");
      loadUsers();
    } catch (error) {
      showToast(
        editingUserId ? "Failed to update user" : "Failed to add user",
        "error"
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.deleteUser(userId);
      showToast("User deleted successfully", "success");
      loadUsers();
    } catch (error) {
      showToast("Failed to delete user", "error");
    }
  };

  return (
    <section id="users" className="tab-content">
      <h2>User Management</h2>

      <div className="card">
        <h3>Add New User</h3>
        <form id="add-user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="user-name">Name:</label>
            <input
              type="text"
              id="user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="user-skills">Skills (comma-separated):</label>
            <input
              type="text"
              id="user-skills"
              placeholder="JavaScript, React, Node.js"
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            Add User
          </button>
        </form>
      </div>

      <div className="card">
        <h3>User List</h3>
        <button onClick={loadUsers} className="btn btn-small">
          Refresh
        </button>
        <div className="list-container">
          {loading ? (
            <p className="loading">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="info-message">No users found</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="list-item">
                <h4>{user.name}</h4>
                <div className="skills-list">
                  {user.skills &&
                    user.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="btn btn-small"
                    style={{ marginRight: "8px" }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setEditingUserId(user._id);
                      setUserName(user.name || "");
                      setUserSkills((user.skills || []).join(", "));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="btn btn-small"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Users;
