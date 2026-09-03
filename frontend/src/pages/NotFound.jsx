import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 text-center">
    <div>
      <p className="text-6xl font-bold text-navy-900">404</p>
      <p className="text-slate-500 mt-2">This page doesn't exist.</p>
      <Link to="/" className="btn-primary inline-block mt-6">Back to Home</Link>
    </div>
  </div>
);

export default NotFound;
