import { Link } from "react-router-dom";

export const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-lg text-gray-600 mb-6">
                Упс! Такой страницы не существует.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
                Вернуться на главную
            </Link>
        </div>
    );
}