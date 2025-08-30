import { useState } from "react";
import { LoginForm } from "@palatine_whiteboard_frontend/components/auth/LoginForm";
import { RegisterForm } from "@palatine_whiteboard_frontend/components/auth/RegisterForm";

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="auth-page">
            {isLogin ? (
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
                <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
        </div>
    );
};