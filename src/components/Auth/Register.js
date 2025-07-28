import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Invalid Email!");
      return;
    }
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(password)) {
      alert("Password must be 6+ chars with uppercase, lowercase & number!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3001/api/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      alert("Registered Successfully!");
    } catch (err) {
      alert("Registration Failed!");

      const errorMsg = err.response?.data?.message || err.message || "Registration failed";
  alert(errorMsg);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Form.Group>
      <Button variant="primary" type="submit">Register</Button>
    </Form>
  );
};
export default Register;