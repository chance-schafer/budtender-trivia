// d:\Base_Directory_Storage\Coding\dispensary-app\frontend\src\components\Layout\Header.js
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Ensure path is correct (../../)
import { useTheme } from '../../contexts/ThemeContext'; // Ensure path is correct (../../)
import apiService from '../../services/api'; // Ensure path is correct (../../)
import {
    SunIcon,
    MoonIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    ChartBarIcon,
    IdentificationIcon,
    CogIcon,
    BookOpenIcon,
    ArrowPathIcon // Keep loading icon if used elsewhere (like dropdown)
} from '@heroicons/react/24/outline';

function Header() {
  const { currentUser, logout, loadingAuthState } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Keep state for potential use in dropdown or other features
  const [showCultivatedLink, setShowCultivatedLink] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false); // Keep for dropdown

  const isAdminOrMod = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_MODERATOR');

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await logout();
      navigate('/login?message=Logged out successfully.');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Keep this effect if the dropdown link still needs the mastery check
  useEffect(() => {
    if (loadingAuthState || !currentUser) {
      setShowCultivatedLink(false);
      return;
    }

    const fetchSummaryForHeader = async () => {
        setIsLoadingSummary(true); // Still set loading for potential dropdown use
        try {
          const response = await apiService.get('/stats/summary');
          // Still set the state based on mastery for potential dropdown use
          setShowCultivatedLink(response?.data?.data?.overallMastery >= 100);
        } catch (error) {
          console.error(">>> Header: Error fetching summary for card link:", error);
          setShowCultivatedLink(false);
        } finally {
          setIsLoadingSummary(false); // Clear loading state
        }
    };
    fetchSummaryForHeader();

  }, [currentUser, loadingAuthState]);


  const activeClassName = "bg-emerald-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center";
  const inactiveClassName = "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center";

  // --- User Menu Logic (Keep as is) ---
  let userMenuContent;
  if (loadingAuthState) {
    userMenuContent = (
      <div className="ml-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
      </div>
    );
  } else if (currentUser) {
    userMenuContent = (
      <div className="relative ml-3">
        <div>
          <button
            type="button"
            className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            id="user-menu-button"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 hover:text-white" />
          </button>
        </div>
        {isDropdownOpen && (
          <div
            className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabIndex="-1"
          >
            <span className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              Hi, {currentUser.username}!
            </span>
            <NavLink
              to="/profile"
              className={({ isActive }) => `flex items-center px-4 py-2 text-sm ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              role="menuitem" tabIndex="-1" onClick={() => setIsDropdownOpen(false)}
            >
              <UserCircleIcon className="h-4 w-4 mr-2" /> Profile
            </NavLink>
            <NavLink
              to="/progress"
              className={({ isActive }) => `flex items-center px-4 py-2 text-sm ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              role="menuitem" tabIndex="-1" onClick={() => setIsDropdownOpen(false)}
            >
              <ChartBarIcon className="h-4 w-4 mr-2" /> Progress
            </NavLink>
            {/* Cultivated Card Link in dropdown still uses showCultivatedLink state */}
            {showCultivatedLink && (
              <NavLink
                to="/cultivated-card" // Assuming this is the correct path
                className={({ isActive }) => `flex items-center px-4 py-2 text-sm ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                role="menuitem" tabIndex="-1" onClick={() => setIsDropdownOpen(false)}
              >
                <IdentificationIcon className="h-4 w-4 mr-2 text-purple-500" /> Cultivated Card
              </NavLink>
            )}
            {isAdminOrMod && (
              <NavLink
                to="/admin-tools"
                className={({ isActive }) => `flex items-center px-4 py-2 text-sm ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                role="menuitem"
                tabIndex="-1"
                onClick={() => setIsDropdownOpen(false)}
              >
                <CogIcon className="h-4 w-4 mr-2" /> Admin Tools
              </NavLink>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              tabIndex="-1"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    );
  } else {
    userMenuContent = (
      <Link to="/login" className={inactiveClassName}>Login</Link>
    );
  }
  // --- End User Menu Logic ---


  return (
    <nav className="bg-gray-800 dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side: Logo & Main Nav Links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-white font-bold text-xl flex items-center">
              <AcademicCapIcon className="h-8 w-8 mr-2 text-emerald-400" />
              Budtender Trivia
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Show these links only if logged in */}
                {currentUser && (
                  <>
                    <NavLink to="/trivia" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                      Trivia
                    </NavLink>
                    <NavLink to="/progress" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                      <ChartBarIcon className="h-4 w-4 mr-1.5" />
                      Progress
                    </NavLink>
                    <NavLink to="/guide" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                       <BookOpenIcon className="h-4 w-4 mr-1.5" />
                       Guide
                    </NavLink>
                    {/* --- Always show Cultivated link when logged in --- */}
                    {/* Removed isLoadingSummary and showCultivatedLink checks */}
                    <NavLink to="/cultivated" className={({ isActive }) => isActive ? activeClassName : inactiveClassName}>
                        <IdentificationIcon className="h-4 w-4 mr-1.5 text-purple-400" />
                        Cultivated
                    </NavLink>
                    {/* --- End Always show Cultivated link --- */}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Theme Toggle & User Menu */}
          <div className="flex items-center">
             <button
                onClick={toggleTheme}
                className="mr-4 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
              </button>
            {userMenuContent}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
