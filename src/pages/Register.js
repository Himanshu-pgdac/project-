import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './Auth.css'; // Import your CSS (or put it in global styles)

// Basic validation schema for the registration form
const validate = {
  username: (value) => {
    if (!value) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must not exceed 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
    return true;
  },
  email: (value) => {
    if (!value) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
    return true;
  },
  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
      return "Password must contain uppercase, lowercase, number, and special character";
    }
    return true;
  },
  confirmPassword: (value, password) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return true;
  }
};

const Register = () => {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  const [success, setSuccess] = useState(false);
  const [error, setErrorState] = useState('');

  const onSubmit = async (data) => {
    const { username, email, password, confirmPassword } = data;

    // Simple validation
    const usernameError = validate.username(username);
    const emailError = validate.email(email);
    const passwordError = validate.password(password);
    const confirmPasswordError = validate.confirmPassword(confirmPassword, password);

    if (usernameError !== true) return setError('username', { type: 'manual', message: usernameError });
    if (emailError !== true) return setError('email', { type: 'manual', message: emailError });
    if (passwordError !== true) return setError('password', { type: 'manual', message: passwordError });
    if (confirmPasswordError !== true) return setError('confirmPassword', { type: 'manual', message: confirmPasswordError });

    // Simple registration logic (mock API call)
    try {
      // Simulate an API request with a timeout
      setTimeout(() => {
        setSuccess(true);
        setErrorState('');
      }, 2000);
    } catch (err) {
      setErrorState('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-container">
        <div className="auth-image-side">
          <div className="auth-image-content">
            <h2 className="auth-image-title">Welcome Aboard!</h2>
            <p className="auth-image-text">
              Join us and enjoy exclusive cookie deals, rewards, and more sweetness every day.
            </p>
          </div>
        </div>

        <div className="auth-card-side">
          <div className="auth-card">
            <h2 className="auth-title">Register</h2>

            {success ? (
              <div className="alert alert-success">
                Registration successful! You can now login.
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    {...register('username')}
                    className={errors.username ? 'is-invalid' : ''}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username.message}</div>
                  )}
                </div>

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

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'is-invalid' : ''}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                  )}
                </div>

                <button type="submit" className="auth-button" disabled={isSubmitting}>
                  Register
                </button>

                <div className="auth-link-container">
                  <span>Already have an account? </span>
                  <a href="/login" className="auth-link">Login here</a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
