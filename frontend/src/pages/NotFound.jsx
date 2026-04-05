import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <p className="text-6xl font-bold text-indigo-200">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-400 text-sm">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
