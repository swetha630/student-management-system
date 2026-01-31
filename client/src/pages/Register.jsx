import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    enrollmentNo: '',
    branch: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input name="name" onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input name="email" type="email" onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input name="password" type="password" onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div className="mb-4">
            <label className="block mb-1">Role</label>
            <select name="role" onChange={handleChange} className="w-full border p-2 rounded">
                <option value="student">Student</option>
                <option value="admin">Admin</option>
            </select>
        </div>

        {formData.role === 'student' && (
            <>
                <div className="mb-4">
                    <label className="block mb-1">Enrollment No</label>
                    <input name="enrollmentNo" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Branch</label>
                    <input name="branch" onChange={handleChange} className="w-full border p-2 rounded" required />
                </div>
            </>
        )}

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default Register;
