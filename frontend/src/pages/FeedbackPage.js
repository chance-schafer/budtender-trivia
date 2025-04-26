// frontend/src/pages/FeedbackPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function FeedbackPage() {
  // IMPORTANT: Replace with your actual Formspree endpoint URL
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xanoyova";

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    feedbackType: 'General', // Default value
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json' // Send as JSON
        },
        body: JSON.stringify(formData) // Send state data
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your feedback!');
        setFormData({ email: '', name: '', feedbackType: 'General', message: '' }); // Clear form
      } else {
        // Try to get error message from Formspree response
        const data = await response.json();
        const errorMessage = data?.errors?.map(err => err.message).join(', ') || 'An error occurred. Please try again.';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      setSubmitStatus('error');
      setSubmitMessage(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Send Feedback</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        Have suggestions, found a bug, or just want to say hi? Let us know!
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
        {submitStatus === 'success' && (
          <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-300" role="alert">
            {submitMessage}
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">
            {submitMessage}
          </div>
        )}

        {/* Hide form on success to prevent resubmission easily */}
        {submitStatus !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (Optional) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              />
            </div>

            {/* Email (Optional, but useful for replies) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-xs text-gray-500">(Optional, if you'd like a reply)</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              />
            </div>

            {/* Feedback Type (Optional) */}
            <div>
              <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Feedback Type
              </label>
              <select
                id="feedbackType"
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={isSubmitting}
              >
                <option>General</option>
                <option>Bug Report</option>
                <option>Suggestion</option>
                <option>Question</option>
                <option>Praise</option>
              </select>
            </div>

            {/* Message (Required) */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isSubmitting || !formData.message} // Disable if submitting or message is empty
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}

        {/* Link back */}
        {submitStatus === 'success' && (
           <div className="mt-6 text-center">
             <Link to="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
               Back to Home
             </Link>
           </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackPage;
