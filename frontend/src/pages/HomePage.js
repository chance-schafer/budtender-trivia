import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Welcome to Budtender Trivia!</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            Test and enhance your knowledge on cannabis science, products, customer interaction, compliance, and medical applications. Are you ready to become an expert?
        </p>
        <Link
            to="/trivia" // Link to the main trivia game page
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 text-xl shadow-md hover:shadow-lg"
        >
            Start Trivia!
        </Link>
        {/* Placeholder for Cultivated Preview */}
        {/* <div className="mt-12 p-6 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-md"> ... </div> */}
    </div>
  );
}

export default HomePage;