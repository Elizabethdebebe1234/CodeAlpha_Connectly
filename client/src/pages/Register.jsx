import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("connectly_token", data.token);
      localStorage.setItem("connectly_user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Join Connectly</h1>
        <p>Create your account and connect with people.</p>

        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />

        {error && <p className="error">{error}</p>}

        <button disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p>Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}