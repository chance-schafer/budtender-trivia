// frontend/src/components/Admin/EditQuestionModal.js
import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';

// --- Accept availableCategories prop ---
function EditQuestionModal({ isOpen, onClose, questionData, onSave, availableCategories = [] }) {
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when questionData changes
  useEffect(() => {
    if (questionData) {
      setQuestionText(questionData.question || '');
      setCategory(questionData.category || ''); // Keep setting initial category
      // ... options, correctAnswer, explanation ...
      const currentOptions = Array.isArray(questionData.options) ? questionData.options : [];
      const paddedOptions = [...currentOptions];
      while (paddedOptions.length < 4) {
        paddedOptions.push('');
      }
      setOptions(paddedOptions);
      setCorrectAnswer(questionData.correct_answer || '');
      setExplanation(questionData.explanation || '');
      setError('');
    } else {
      // Reset form
      setQuestionText('');
      setCategory(''); // Reset category
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setExplanation('');
      setError('');
    }
  }, [questionData]);

  const handleOptionChange = (index, value) => { /* ... */ };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic Validation
    const filledOptions = options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) { /* ... */ }
    if (!correctAnswer.trim()) { /* ... */ }
    if (!filledOptions.includes(correctAnswer.trim())) { /* ... */ }
     if (!questionText.trim() || !category.trim()) { // Category validation still applies
        setError("Question text and category are required.");
        setIsLoading(false);
        return;
    }

    const updatedData = {
      question: questionText.trim(),
      category: category.trim(), // Send selected category
      options: filledOptions,
      correct_answer: correctAnswer.trim(),
      explanation: explanation.trim() || null,
    };

    try {
      await onSave(questionData.id, updatedData);
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ... Modal Header ... */}
         <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Edit Question (ID: {questionData?.id})
            </h2>
            <button onClick={onClose} /* ... */ > &times; </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Question Text */}
          <div>
            <label htmlFor="editQuestionText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question Text</label>
            <textarea id="editQuestionText" rows="3" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* --- Category Dropdown --- */}
          <div>
            <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              id="editCategory"
              value={category} // Controlled component
              onChange={(e) => setCategory(e.target.value)} // Update state on change
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="" disabled>-- Select a Category --</option>
              {/* Map over the categories passed via props */}
              {availableCategories.map(catName => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
              {/* Optional: Allow adding a new category? Requires more logic */}
              {/* <option value="--new--">Add New Category...</option> */}
            </select>
            {/* Optional: Input field to appear if 'Add New' is selected */}
          </div>
          {/* --- End Category Dropdown --- */}

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options (Provide at least 2)</label>
            {options.map((option, index) => (
              <input key={index} type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
              />
            ))}
          </div>

          {/* Correct Answer */}
          <div>
            <label htmlFor="editCorrectAnswer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correct Answer</label>
            <input type="text" id="editCorrectAnswer" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required placeholder="Must match one of the options above"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Explanation */}
          <div>
            <label htmlFor="editExplanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Explanation (Optional)</label>
            <textarea id="editExplanation" rows="2" value={explanation} onChange={(e) => setExplanation(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
             <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"> Cancel </button>
             <button type="submit" disabled={isLoading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"> {isLoading ? <Spinner size="sm" /> : 'Save Changes'} </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditQuestionModal;
