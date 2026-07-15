import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <h1 className="text-7xl font-bold">404</h1>

      <p className="text-gray-500">
        The page you are looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
