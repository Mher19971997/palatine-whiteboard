import React from 'react';
import { useForm } from 'react-hook-form';
import { useRegister } from '@palatine_whiteboard_frontend/hooks';
import type { RegisterData } from '@palatine_whiteboard_frontend/api/types';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>();
  const registerMutation = useRegister() as any;

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerMutation.mutateAsync(data);
      onSwitchToLogin();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <button 
          type="submit" 
          disabled={registerMutation.isLoading}
          className="submit-btn"
        >
          {registerMutation.isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p>
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="link-btn">
          Login here
        </button>
      </p>
    </div>
  );
};