// frontend/src/pages/HolographicCardPage.js
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Spinner from '../components/Spinner';

// --- Define the Cultivated Card Component ---
// (Adapted from the placeholder in ProgressVisualization)
const CultivatedCardDisplay = () => {
  // Basic styling for the card - enhance as needed
  return (
    <div className="relative group w-64 h-96 mx-auto perspective">
      <div className="relative w-full h-full rounded-xl shadow-xl transition-all duration-500 transform-style-3d group-hover:rotate-y-12">
        {/* Holographic Background Effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden bg-gradient-to-br from-green-300 via-blue-400 to-purple-500 opacity-80 animate-holo-flow"></div>
        {/* Card Content */}
        <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white bg-black bg-opacity-20 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-shadow-md">Cultivated Master</h2>
            <p className="text-sm mb-4 text-shadow-sm">Budtender Trivia</p>
            {/* Placeholder for User Info or Badge */}
            <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5m-9 4.5v-4.5m0-11.25h9.75l-.623 1.87a1.875 1.875 0 01-1.756 1.38H7.629a1.875 1.875 0 01-1.756-1.38L5.25 3h9.75z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-center opacity-80">Proof of 100% Knowledge Mastery</p>
        </div>
      </div>
      {/* Add CSS for perspective, transform-style-3d, rotate-y, text-shadow, and animate-holo-flow if needed */}
      <style jsx>{`
        .perspective { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .group-hover\\:rotate-y-12:hover { transform: rotateY(12deg); }
        .text-shadow-md { text-shadow: 1px 1px 3px rgba(0,0,0,0.5); }
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.4); }
        @keyframes holo-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-holo-flow {
          background-size: 400% 400%;
          animation: holo-flow 10s ease infinite;
        }
      `}</style>
    </div>
  );
};


function HolographicCardPage() {
  const { currentUser, loadingAuthState } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCheckedMastery, setHasCheckedMastery] = useState(false); // Track if check is done

  useEffect(() => {
    // Don't fetch if auth state is still loading or if there's no user
    if (loadingAuthState || !currentUser) {
      if (!loadingAuthState && !currentUser) {
        // Auth check done, but no user. Stop loading to allow redirect.
        setIsLoading(false);
      }
      return; // Exit early
    }

    const fetchSummary = async () => {
      console.log(">>> HolographicCardPage: Attempting to fetch summary...");
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.get('/stats/summary');
        console.log(">>> HolographicCardPage: Summary data received:", response.data);
        if (response.data && response.data.data) {
          setSummaryData(response.data.data);
        } else {
          console.warn(">>> HolographicCardPage: Summary response structure unexpected:", response.data);
          setError("Received unexpected data format from server.");
          setSummaryData(null); // Ensure summaryData is null on unexpected format
        }
      } catch (err) {
        console.error(">>> HolographicCardPage: Error fetching summary:", err);
        setError(err.response?.data?.message || err.message || 'Failed to load progress data.');
        setSummaryData(null); // Clear data on error
      } finally {
        console.log(">>> HolographicCardPage: Fetch finished.");
        setIsLoading(false);
        setHasCheckedMastery(true); // Mark mastery check as complete
      }
    };

    fetchSummary();

  }, [currentUser, loadingAuthState]); // Dependencies

  // --- Render Logic ---

  // 1. Handle Auth Loading / Not Logged In
  if (loadingAuthState) {
    return <div className="flex justify-center items-center min-h-[300px]"><Spinner /></div>;
  }
  if (!currentUser) {
    console.log(">>> HolographicCardPage: Not logged in, redirecting...");
    return <Navigate to="/login?message=Please log in to view your card." replace />;
  }

  // 2. Handle Data Fetching Loading State
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[300px]"><Spinner /></div>;
  }

  // 3. Handle Fetch Error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 p-4 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-md shadow mb-4">
          Error: {error}
        </p>
        <Link to="/progress" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to Progress Tracker
        </Link>
      </div>
    );
  }

  // 4. Handle Mastery Check Result (only after check is complete)
  if (hasCheckedMastery) {
    if (summaryData && summaryData.overallMastery >= 100) {
      // --- Display the Card ---
      return (
        <div className="container mx-auto px-4 py-12 flex flex-col items-center">
           <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100 text-center">Your Cultivated Card</h1>
           <CultivatedCardDisplay />
           <Link to="/progress" className="mt-8 text-indigo-600 dark:text-indigo-400 hover:underline">
             Back to Progress Tracker
           </Link>
        </div>
      );
    } else {
      // --- Not Mastered Yet ---
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Almost There!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't reached 100% mastery yet. Keep learning to unlock your Cultivated Card!
            {summaryData && ` (Current Mastery: ${summaryData.overallMastery.toFixed(1)}%)`}
          </p>
          <Link to="/progress" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Progress Tracker
          </Link>
        </div>
      );
    }
  }

  // Fallback (shouldn't normally be reached if logic above is sound)
  return <div className="flex justify-center items-center min-h-[300px]"><Spinner /></div>;
}

export default HolographicCardPage;
