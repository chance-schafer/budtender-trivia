// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ensure path is correct
import Spinner from '../components/Spinner'; // Ensure path is correct

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(''); // <-- Add state for invite code
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth(); // Assuming register is exposed by useAuth

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic frontend validation
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }
    if (!inviteCode.trim()) { // Check if invite code is entered
        setError("Invite code is required.");
        setIsLoading(false);
        return;
    }

    try {
      // Pass inviteCode to the register function
      await register(username, email, password, inviteCode);
      setSuccess("Registration successful! You can now log in.");
      // Optionally redirect after a delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error("Register page error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username-register" className="sr-only">Username</label>
            <input
              id="username-register" name="username" type="text" required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading}
            />
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email-register" className="sr-only">Email address</label>
            <input
              id="email-register" name="email" type="email" autoComplete="email" required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
            />
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password-register" className="sr-only">Password</label>
            <input
              id="password-register" name="password" type="password" autoComplete="new-password" required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
            />
          </div>
          {/* --- Invite Code Field --- */}
          <div>
            <label htmlFor="invite-code" className="sr-only">Invite Code</label>
            <input
              id="invite-code" name="inviteCode" type="text" required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Invite Code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} disabled={isLoading}
            />
          </div>
          {/* --- End Invite Code Field --- */}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
