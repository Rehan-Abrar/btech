// src/api/auth.js
// Day 2: wire Login.jsx handleSubmit to login(), Register.jsx to register().
// Store JWT from login response in localStorage, add Authorization header to all fetch calls.

export const login = async (email, password) => {
  // Day 2: const res = await fetch("/api/auth/login", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // const data = await res.json();
  // localStorage.setItem("axon_token", data.token);
  // return data.user;
};

export const register = async ({ name, email, password, role }) => {
  // Day 2: return await fetch("/api/auth/register", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ name, email, password, role }),
  // }).then(r => r.json());
};

export const logout = () => {
  // Day 2: localStorage.removeItem("axon_token");
};