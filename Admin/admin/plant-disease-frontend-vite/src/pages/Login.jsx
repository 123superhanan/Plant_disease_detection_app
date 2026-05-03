import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf, FaSeedling, FaTractor } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <FaLeaf className="text-green-600 text-4xl animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Plant Disease Admin</h1>
          <p className="text-gray-600 mt-2">Welcome back! Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@plantdisease.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <div className="mt-2 bg-gray-50 rounded-lg p-3">
            <p className="font-mono text-xs">📧 admin@plantdisease.com</p>
            <p className="font-mono text-xs">🔑 Admin@123456</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4 text-gray-400 text-xs">
          <FaSeedling />
          <FaTractor />
          <FaLeaf />
        </div>
      </div>
    </div>
  );
};

export default Login;