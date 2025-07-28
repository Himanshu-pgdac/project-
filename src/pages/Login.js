import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Update the path as needed

// Basic validation logic for the login form
const validate = {
  email: (value) => {
    if (!value) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
    return true;
  },
  password: (value) => {
    if (!value) return "Password is required";
    return true;
  }
};

const Login = ({ setAuth }) => {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate(); // Hook to handle navigation

  const onSubmit = async (data) => {
    const { email, password } = data;

    // Simple validation
    const emailError = validate.email(email);
    const passwordError = validate.password(password);

    if (emailError !== true) return setError('email', { type: 'manual', message: emailError });
    if (passwordError !== true) return setError('password', { type: 'manual', message: passwordError });

    try {
      // Simulate an API request (you can replace this with a real API call)
      console.log('Attempting login with:', email, password);

      // Replace the following if condition with your actual API call
      if (email === 'user@example.com' && password === 'Password123!') {
        // Simulate successful login and store token/user data
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify({ id: 1, email, name: 'John Doe' }));

        // Update authentication state
        setAuth(true);

        // Navigate to the menu page after successful login
        navigate('/menu'); // Replace '/menu' with the actual route for your menu page
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-container">
        <div className="auth-image-side">
          <div className="auth-image-content">
            <h2 className="auth-image-title">Welcome Back!</h2>
            <p className="auth-image-text">Login to continue your cookie journey. 🍪</p>
          </div>
        </div>

        <div className="auth-card-side">
          <div className="auth-card">
            <h2 className="auth-title">Login</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={errors.email ? 'is-invalid' : ''}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className={errors.password ? 'is-invalid' : ''}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-link-container">
              <a href="/register" className="auth-link">Don't have an account? Register</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
