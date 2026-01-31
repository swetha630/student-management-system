import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center print:hidden">
      <Link to="/" className="text-xl font-bold text-blue-600">Student Manager</Link>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name} ({user.role})</span>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-blue-600">Login</Link>
            <Link to="/register" className="text-blue-600">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
