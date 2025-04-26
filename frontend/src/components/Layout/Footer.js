// frontend/src/components/Layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-400 mt-auto">
      <div className="container mx-auto px-4 py-6">

        {/* Tip Jar Section */}
        <div className="text-center mb-4 border-b border-gray-700 pb-4">
          <h4 className="font-semibold text-gray-200 mb-2">Enjoying the App?</h4>
          <p className="text-sm mb-3">Consider supporting its development!</p>
          <div className="flex justify-center items-center space-x-4">
            {/* Replace '#' with your actual payment links */}
            <a href="https://venmo.com/u/cschafer27" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors" title="Venmo">
              {/* You can use icons here if you like */}
              Venmo
            </a>
            <span className="text-gray-600">|</span>
            <a href="https://paypal.me/cschafer27" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors" title="PayPal">
              PayPal
            </a>
            <span className="text-gray-600">|</span>
            <a href="https://cash.app/$cschafer27" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors" title="Cash App">
              Cash App
            </a>
          </div>
        </div>

        {/* Footer Links & Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          <p>&copy; {currentYear} Budtender Trivia. All rights reserved.</p>
          <div className="mt-2 sm:mt-0">
            {/* Added Feedback Link */}
            <Link to="/feedback" className="hover:text-gray-200 transition-colors">
              Send Feedback
            </Link>
            {/* Add other links like Privacy Policy or Terms if needed */}
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
