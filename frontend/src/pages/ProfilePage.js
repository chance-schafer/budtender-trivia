// frontend/src/pages/ProfilePage.js (Revised)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Spinner from '../components/Spinner';
import { GREENLIGHT_KC_LOCATIONS } from '../constants/locations'; // <-- Import the shared list

function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth(); // Assuming setCurrentUser updates context/localStorage
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state - initialize with current user data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    storeLocation: '',
    // Add other editable fields like password if needed
  });

  // Populate form when currentUser is available
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        storeLocation: currentUser.storeLocation || '', // Use current location or empty string
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    // Prepare payload - only send fields that might change
    // Exclude username/email if they aren't editable here
    const payload = {
      storeLocation: formData.storeLocation || null, // Send null if empty string selected
      // Add password fields if implementing password change
    };

    try {
      // Assuming you have an endpoint like PUT /api/users/me to update the logged-in user
      const response = await apiService.put('/users/me', payload);

      // Update the user context with the potentially updated data from the response
      // The exact structure depends on what your PUT endpoint returns
      const updatedUser = response.data.user || { ...currentUser, ...payload }; // Example update logic
      setCurrentUser(updatedUser); // Update AuthContext

      setSuccessMessage('Profile updated successfully!');

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    // Handle case where user data isn't loaded yet (optional, AuthContext might handle this)
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Your Profile</h1>

      {error && <p className="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 rounded text-red-700 dark:text-red-200 text-sm">{error}</p>}
      {successMessage && <p className="p-3 mb-4 bg-green-100 dark:bg-green-900 border border-green-400 rounded text-green-700 dark:text-green-200 text-sm">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        {/* Display Username (Read-only example) */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            readOnly // Make it read-only if username changes aren't allowed here
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 sm:text-sm"
          />
        </div>

        {/* Display Email (Read-only example) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            readOnly // Make it read-only if email changes aren't allowed here
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 sm:text-sm"
          />
        </div>

        {/* Store Location Dropdown (Using Imported Constant) */}
        <div>
          <label htmlFor="storeLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Store Location</label>
          <select
            id="storeLocation"
            name="storeLocation" // Ensure name matches state key
            value={formData.storeLocation} // Controlled component
            onChange={handleInputChange} // Update state on change
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- No Location Set --</option>
            {/* Map over the imported constant array */}
            {GREENLIGHT_KC_LOCATIONS.map(loc => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select the store you primarily work at.</p>
        </div>

        {/* Add Password Change fields here if needed */}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
