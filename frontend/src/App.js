// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import TriviaGame from './components/TriviaGame';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CultivatedPage from './pages/CultivatedPage';
import ProfilePage from './pages/ProfilePage';
import ProgressTrackerPage from './pages/ProgressTrackerPage';
import HolographicCardPage from './pages/HolographicCardPage';
import FeedbackPage from './pages/FeedbackPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AdminToolsPage from './pages/AdminToolsPage';
import ResourceGuidePage from './pages/ResourceGuidePage';
// TODO: Create a NotFoundPage component

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen font-inter bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/cultivated" element={<CultivatedPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                {/* --- End Public Routes --- */}


                {/* --- Protected Routes --- */}
                <Route path="/trivia" element={<PrivateRoute><TriviaGame /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/progress" element={<PrivateRoute><ProgressTrackerPage /></PrivateRoute>} />
                <Route path="/cultivated-card" element={<PrivateRoute><HolographicCardPage /></PrivateRoute>} />
                <Route path="/guide" element={<PrivateRoute><ResourceGuidePage /></PrivateRoute>} />
                {/* Admin/Mod Route */}
                <Route path="/admin-tools" element={<PrivateRoute><AdminToolsPage /></PrivateRoute>} />
                {/* --- End Protected Routes --- */}

                {/* TODO: Add a 404 Not Found route: <Route path="*" element={<NotFoundPage />} /> */}
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
