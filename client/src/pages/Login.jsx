import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/auth/login", {
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
        <h1>Welcome back</h1>
        <p>Sign in to Connectly.</p>

        <input
          type="email"
          placeholder="Email address"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="error">{error}</p>}

        <button disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p>New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}