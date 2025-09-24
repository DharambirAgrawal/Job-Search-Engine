import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "./Toast";
import Skeleton from "./Skeleton";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers(); // eslint-disable-next-line react-hooks/exhaustive-deps
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
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingUserId) {
        await api.updateUser(editingUserId, userData);
        showToast("User updated successfully", "success");
      } else {
        await api.addUser(userData);
        showToast("User added successfully", "success");
      }
      setEditingUserId(null);
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
    } catch {
      showToast("Failed to delete user", "error");
    }
  };

  return (
    <section id="users" className="tab-content">
      <h2>User Management</h2>

      <div className="card">
        <h3>{editingUserId ? "Edit User" : "Add New User"}</h3>
        <form
          id="add-user-form"
          onSubmit={handleSubmit}
          aria-label={editingUserId ? "Edit existing user" : "Add new user"}
        >
          <div className="form-group">
            <label htmlFor="user-name">Name:</label>
            <input
              type="text"
              id="user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              aria-required="true"
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
          <div
            className="button-group"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              className="btn"
              aria-label={editingUserId ? "Save user changes" : "Add user"}
            >
              {editingUserId ? "Save Changes" : "Add User"}
            </button>
            {editingUserId && (
              <button
                type="button"
                className="btn outline"
                onClick={() => {
                  setEditingUserId(null);
                  setUserName("");
                  setUserSkills("");
                }}
                aria-label="Cancel editing user"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>User List</h3>
        <button
          onClick={loadUsers}
          className="btn btn-small"
          aria-label="Refresh users"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <div className="list-container">
          {loading ? (
            <div className="list-grid" aria-busy="true">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="list-item card" aria-hidden="true">
                  <Skeleton
                    height={18}
                    style={{ marginBottom: 8, width: "50%" }}
                  />
                  <Skeleton
                    height={12}
                    style={{ marginBottom: 8, width: "80%" }}
                  />
                  <Skeleton height={12} style={{ width: "60%" }} />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="info-message">No users found</p>
          ) : (
            <div className="list-grid">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="list-item card"
                  tabIndex={0}
                  aria-label={`User ${user.name}`}
                >
                  <h4>{user.name}</h4>
                  <div className="skills-list">
                    {user.skills &&
                      user.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="btn btn-small secondary"
                      aria-label={`Delete user ${user.name}`}
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
                      className="btn btn-small outline"
                      aria-label={`Edit user ${user.name}`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Users;
