// frontend/src/pages/CultivatedPage.js
import React, { useState, useEffect } from 'react';
import apiService from '../services/api'; // Ensure path is correct
import Spinner from '../components/Spinner'; // Ensure path is correct
import { format } from 'date-fns'; // Ensure date-fns is installed

function CultivatedPage() {
  const [cultivatedData, setCultivatedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCultivated = async () => {
      console.log(">>> CultivatedPage: Attempting to fetch cultivated data...");
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.get('/scores/cultivated'); // Endpoint for cultivated list
        console.log(">>> CultivatedPage: Cultivated data received:", response.data);
        if (response.data && Array.isArray(response.data.data)) {
          setCultivatedData(response.data.data);
        } else {
          console.warn(">>> CultivatedPage: Cultivated response structure unexpected:", response.data);
          setError(response.data?.message || "Received unexpected data format from server.");
          setCultivatedData([]); // Ensure it's an empty array on unexpected format
        }
      } catch (err) {
        console.error(">>> CultivatedPage: Error fetching cultivated:", err);
        setError(err.response?.data?.message || err.message || 'Failed to load cultivated list.');
        setCultivatedData([]); // Clear data on error
      } finally {
        console.log(">>> CultivatedPage: Fetch finished.");
        setIsLoading(false);
      }
    };

    fetchCultivated();
  }, []); // Empty dependency array means this runs once on mount

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[300px]"><Spinner /></div>;
  }

  if (error) {
    return <p className="text-center text-red-500 p-4 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-md shadow">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Cultivated Masters</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        Users who have achieved 100% mastery across all questions.
      </p>

      {cultivatedData.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 p-4">
          No users have reached the Cultivated Master status yet. Keep learning!
        </p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                {/* --- ADD Store Header --- */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Store
                </th>
                {/* --- End Header --- */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Best Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mastery %
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Achieved On
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {cultivatedData.map((user) => (
                <tr key={user.rank} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    {user.username} {/* Data field remains username */}
                  </td>
                  {/* --- ADD Store Data Cell --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {/* Display the store location or a dash if it's null/empty */}
                    {user.storeLocation || '-'}
                  </td>
                  {/* --- End Data Cell --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.score}/{user.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">
                    {user.percentage?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {/* Use date-fns for formatting */}
                    {user.date ? format(new Date(user.date), 'PP') : 'N/A'} {/* Example: Sep 14, 2023 */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CultivatedPage;
