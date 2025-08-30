import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@palatine_whiteboard_frontend/contexts/AuthContext";
import { EditorPage } from "@palatine_whiteboard_frontend/pages/editor";
import { AuthPage } from "@palatine_whiteboard_frontend/pages/auth";
import { NotFoundPage } from "@palatine_whiteboard_frontend/pages/notfound";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

export default function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} />
                <Route path="/" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}
