// d:\Base_Directory_Storage\Coding\dispensary-app\frontend\src\pages\AdminToolsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import EditQuestionModal from '../components/Admin/EditQuestionModal';
import { GREENLIGHT_KC_LOCATIONS } from '../constants/locations'; // <-- Import the shared list

// --- Constants ---
const TABS = {
  INVITES: 'inviteCodes',
  USERS: 'userManagement',
  QUESTIONS: 'questionManagement',
};

// --- Removed local definition of GREENLIGHT_KC_LOCATIONS ---

// --- Invite Codes Component ---
const InviteCodesManager = () => {
  const [inviteCodes, setInviteCodes] = useState([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State for generation form
  const [storeLocation, setStoreLocation] = useState(''); // This will hold the selected location
  const [isReusable, setIsReusable] = useState(false);
  const [maxUses, setMaxUses] = useState('');

  // State for deleting
  const [deletingCodeId, setDeletingCodeId] = useState(null);

 // Fetch existing codes
  const fetchCodes = useCallback(async () => {
    setIsLoadingCodes(true);
    setError(null); // Clear general error on fetch
    try {
      const response = await apiService.get('/invites');
      setInviteCodes(response.data || []);
    } catch (err) {
      console.error("Error fetching invite codes:", err);
      setError(err.response?.data?.message || "Failed to load invite codes.");
    } finally {
      setIsLoadingCodes(false);
    }
  }, []);


  // Handler for generating a code
   const handleGenerateCode = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSuccessMessage('');

    let maxUsesValue = null;
    if (isReusable && maxUses) {
        const parsedMaxUses = parseInt(maxUses, 10);
        if (!isNaN(parsedMaxUses) && parsedMaxUses > 0) {
            maxUsesValue = parsedMaxUses;
        } else {
            setError("Max Uses must be a positive number.");
            setIsGenerating(false);
            return;
        }
    }

    const payload = {
        storeLocation: storeLocation || null,
        isReusable: isReusable,
        maxUses: maxUsesValue
    };

    try {
      const response = await apiService.post('/invites', payload);
      const codeDetails = response.data.inviteCode;
      if (!codeDetails) {
          throw new Error("Invite code details missing in response.");
      }
      const maxUsesText = codeDetails.maxUses === null ? 'Infinite' : codeDetails.maxUses;
      const locationText = codeDetails.storeLocation || 'N/A';

      setSuccessMessage(`Generated code: ${codeDetails.code} (Reusable: ${codeDetails.isReusable}, Max Uses: ${maxUsesText}, Location: ${locationText})`);

      setStoreLocation(''); // Reset dropdown selection
      setIsReusable(false);
      setMaxUses('');
      fetchCodes(); // Refresh the list
    } catch (err) {
      console.error("Error generating invite code:", err);
      setError(err.response?.data?.message || err.message || "Failed to generate code.");
    } finally {
      setIsGenerating(false);
    }
  };

   // Handler for deleting a code
   const handleDeleteCode = async (codeId, codeValue) => {
    if (!window.confirm(`Are you sure you want to delete invite code "${codeValue}"? This will prevent future signups with this code but will NOT affect existing users.`)) {
      return;
    }
    setDeletingCodeId(codeId);
    setError(null);
    setSuccessMessage('');
    try {
      await apiService.delete(`/invites/${codeId}`);
      setSuccessMessage(`Code ${codeValue} deleted successfully.`);
      fetchCodes();
    } catch (err) {
      console.error(`Error deleting code ${codeId}:`, err);
      setError(err.response?.data?.message || `Failed to delete code ${codeValue}.`);
    } finally {
      setDeletingCodeId(null);
    }
  };


  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  return (
    <div className="space-y-6">
      {/* Display Success/Error Messages */}
      {error && <p className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 rounded text-red-700 dark:text-red-200 text-sm">{error}</p>}
      {successMessage && <p className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 rounded text-green-700 dark:text-green-200 text-sm">{successMessage}</p>}

      {/* Generate Code Section (Combined) */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Generate Invite Code</h3>
        <form onSubmit={handleGenerateCode} className="space-y-4">
            {/* --- Store Location Dropdown (Using Imported Constant) --- */}
            <div>
                <label htmlFor="storeLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Store Location (Optional)</label>
                <select
                    id="storeLocation"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                    <option value="">-- General Code (No Location) --</option>
                    {/* Map over the imported constant array */}
                    {GREENLIGHT_KC_LOCATIONS.map(loc => (
                        <option key={loc} value={loc}>
                            {loc}
                        </option>
                    ))}
                </select>
            </div>
            {/* --- End Store Location Dropdown --- */}

            {/* Reusable Checkbox */}
            <div className="flex items-center">
                <input
                    id="isReusable"
                    name="isReusable"
                    type="checkbox"
                    checked={isReusable}
                    onChange={(e) => setIsReusable(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-900 dark:border-gray-600"
                />
                <label htmlFor="isReusable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Reusable Code?
                </label>
            </div>
             {/* Max Uses (Only show if reusable) */}
             {isReusable && (
                <div>
                    <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Uses (Optional)</label>
                    <input
                        type="number"
                        id="maxUses"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        min="1"
                        placeholder="Leave blank for infinite"
                        className="mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                </div>
             )}
            {/* Submit Button */}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              disabled={isGenerating}
            >
              {isGenerating ? <Spinner size="sm" /> : 'Generate Code'}
            </button>
        </form>
      </div>

      {/* List Invite Codes Section */}
      <div>
         <h3 className="text-lg font-medium my-4 text-gray-800 dark:text-gray-100">Existing Invite Codes</h3>
        {isLoadingCodes ? (
          <div className="flex justify-center"><Spinner /></div>
        ) : inviteCodes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No invite codes found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-md dark:border-gray-600">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reusable</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Uses / Max</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {inviteCodes.map(code => (
                  <tr key={code.id}>
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">{code.code}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{code.storeLocation || '-'}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {code.isReusable ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {code.usesCount} / {code.maxUses ?? '∞'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{code.createdAt ? format(new Date(code.createdAt), 'PP') : 'N/A'}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                        <button
                            onClick={() => handleDeleteCode(code.id, code.code)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 p-1 flex items-center justify-center"
                            disabled={deletingCodeId === code.id}
                            title="Delete Invite Code"
                        >
                            {deletingCodeId === code.id ? <Spinner size="xs" /> : <TrashIcon className="h-4 w-4" />}
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- User Management Component ---
// ... (UserManagement component remains unchanged) ...
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming GET /users returns { data: [...] }
      const response = await apiService.get('/users');
      setUsers(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone and will remove all their associated data.`)) {
      return;
    }
    setDeletingUserId(userId);
    setError(null);
    try {
      await apiService.delete(`/users/${userId}`);
      fetchUsers(); // Refresh user list on success
    } catch (err) {
      console.error(`Error deleting user ${userId}:`, err);
      setError(err.response?.data?.message || `Failed to delete user ${username}.`);
    } finally {
      setDeletingUserId(null); // Reset loading state
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Manage Users</h3>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {isLoading ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No users found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md dark:border-gray-600">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Store</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.id}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  {/* Ensure roles is an array before joining */}
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{Array.isArray(user.roles) ? user.roles.join(', ') : ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.storeLocation || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.createdAt ? format(new Date(user.createdAt), 'PP') : 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 flex items-center justify-center" // Added flex for spinner
                      disabled={deletingUserId === user.id} // Disable button while deleting this specific user
                      title="Delete User"
                    >
                      {deletingUserId === user.id ? <Spinner size="sm" /> : <TrashIcon className="h-5 w-5" />}
                    </button>
                    {/* Add Edit Role button later if needed */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


// --- Question Management Component (UPDATED - Removed whitespace in table) ---
const QuestionManagement = () => {
  // ... (state, functions, useEffect remain the same) ...
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

   // Fetch distinct categories for dropdowns
   const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
        const response = await apiService.get('/questions/categories');
        setAvailableCategories(response.data?.data || []);
    } catch (catErr) {
        console.error("Error fetching categories:", catErr);
        setError(prev => prev || "Failed to load category options.");
    } finally {
        setIsLoadingCategories(false);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      const response = await apiService.get('/questions/all', { params });
      setQuestions(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.response?.data?.message || "Failed to load questions.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  const handleEditQuestion = (questionId) => {
    const questionToEdit = questions.find(q => q.id === questionId);
    if (questionToEdit) {
      setEditingQuestion(questionToEdit);
      setEditError(null);
      setIsEditing(true);
    } else {
        console.error("Could not find question with ID:", questionId);
        setError("Could not find the selected question to edit.");
    }
  };

  const handleSaveChanges = async (questionId, updatedData) => {
    console.log("AdminToolsPage: Data being sent to PUT /questions/:id", { questionId, updatedData });
    setEditError(null);
    try {
      const response = await apiService.put(`/questions/${questionId}`, updatedData);
      console.log("Update response:", response.data);
      fetchQuestions();
      fetchCategories();
      setIsEditing(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error(`Error updating question ${questionId}:`, err);
      const message = err.response?.data?.message || "Failed to update question.";
      setEditError(message);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [fetchQuestions, fetchCategories]);

  const filterCategories = [...new Set(questions.map(q => q.category).filter(Boolean))].sort();


  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Manage Questions</h3>

      {/* Filters/Search */}
       <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={isLoadingCategories || isLoading}
        >
          <option value="">All Categories</option>
          {filterCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        {isLoadingCategories && <Spinner size="xs" className="inline-block ml-2" />}
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {editError && !error && <p className="text-orange-600 text-sm mb-3">Edit Error: {editError}</p>}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : questions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No questions found matching criteria.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md dark:border-gray-600">
          <table className="min-w-full w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
            {/* --- Removed whitespace within colgroup --- */}
            <colgroup><col style={{ width: '3%' }} /><col style={{ width: '25%' }} /><col style={{ width: '17%' }} /><col style={{ width: '20%' }} /><col style={{ width: '15%' }} /><col style={{ width: '15%' }} /><col style={{ width: '5%' }} /></colgroup>
            <thead className="bg-gray-50 dark:bg-gray-700">
              {/* --- Removed whitespace within tr --- */}
              <tr><th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th><th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Question</th><th className="px-2 pr-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th><th className="px-2 pl-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Options</th><th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Correct Answer</th><th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Explanation</th><th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th></tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {questions.map(q => {
                const optionsString = Array.isArray(q.options) ? q.options.join(' | ') : '';
                return (
                  // --- Removed whitespace within tr ---
                  <tr key={q.id}><td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">{q.id}</td><td
                      className="px-2 py-2 text-sm text-gray-900 dark:text-gray-100 truncate align-top"
                      title={q.question}
                    >{q.question}</td><td
                      className="px-2 pr-4 py-2 text-sm text-blue-600 dark:text-blue-400 align-top"
                      title={q.category || ''}
                    >{q.category || '-'}</td><td
                      className="px-2 pl-4 py-2 text-sm text-purple-600 dark:text-purple-400 truncate align-top"
                      title={optionsString}
                    >{optionsString}</td><td
                      className="px-2 py-2 text-sm font-semibold text-green-600 dark:text-green-400 truncate align-top"
                      title={q.correct_answer}
                    >{q.correct_answer}</td><td
                      className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 truncate align-top"
                      title={q.explanation || ''}
                    >{q.explanation || '-'}</td><td className="px-2 py-2 text-sm align-top"><button
                        onClick={() => handleEditQuestion(q.id)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                        title="Edit Question"
                      ><PencilSquareIcon className="h-5 w-5" /></button></td></tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingQuestion && (
        <EditQuestionModal
          isOpen={isEditing}
          onClose={() => { setIsEditing(false); setEditingQuestion(null); setEditError(null); }}
          questionData={editingQuestion}
          onSave={handleSaveChanges}
          availableCategories={availableCategories}
        />
      )}
    </div>
  );
};



// --- Main Admin Tools Page Component ---
// ... (Main component remains unchanged) ...
function AdminToolsPage() {
  const { currentUser, loadingAuthState } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.INVITES); // Default to invites

  // Check for admin or moderator role
  const canAccess = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_MODERATOR');

  if (loadingAuthState) {
      return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  }
  // Redirect if user doesn't have the required role
  if (!canAccess) {
    // Use Navigate component for redirection
    return <Navigate to="/" replace state={{ message: "Access Denied: Admin/Moderator role required." }} />;
  }

  // Helper for tab styling
  const getTabClass = (tabName) => {
    return `py-2 px-4 text-sm font-medium rounded-t-lg cursor-pointer transition-colors duration-150 ${
      activeTab === tabName // Active Tab Styling
        ? 'border-indigo-500 border-l border-t border-r text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800' // Active tab style
        : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-600' // Inactive tab style
    }`;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Admin / Moderator Tools</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {/* Render tabs only if user has appropriate role (already checked by canAccess) */}
          <button onClick={() => setActiveTab(TABS.INVITES)} className={getTabClass(TABS.INVITES)}>
            Invite Codes
          </button>
          <button onClick={() => setActiveTab(TABS.USERS)} className={getTabClass(TABS.USERS)}>
            User Management
          </button>
          <button onClick={() => setActiveTab(TABS.QUESTIONS)} className={getTabClass(TABS.QUESTIONS)}>
            Question Management
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow p-4 sm:p-6 border-l border-r border-b border-gray-200 dark:border-gray-700 min-h-[400px]">
        {activeTab === TABS.INVITES && <InviteCodesManager />}
        {activeTab === TABS.USERS && <UserManagement />}
        {activeTab === TABS.QUESTIONS && <QuestionManagement />}
      </div>
    </div>
  );
}

export default AdminToolsPage;
