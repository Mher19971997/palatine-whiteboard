import React from 'react';
import { useForm } from 'react-hook-form';
import { useLogin } from '@palatine_whiteboard_frontend/hooks';
import { useAuth } from '@palatine_whiteboard_frontend/contexts/AuthContext';
import type { LoginData } from '@palatine_whiteboard_frontend/api/types';

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
    const loginMutation = useLogin();
    const { login } = useAuth();

    const onSubmit = async (data: LoginData) => {
        try {
            const response = await loginMutation.mutateAsync(data);
            login(response.data.access_token);
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
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
                        {...register('password', { required: 'Password is required' })}
                    />
                    {errors.password && <span className="error">{errors.password.message}</span>}
                </div>

                <button
                    type="submit"
                    disabled={loginMutation.isLoading}
                    className="submit-btn"
                >
                    {loginMutation.isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p>
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="link-btn">
                    Register here
                </button>
            </p>
        </div>
    );
};