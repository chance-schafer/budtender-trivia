// frontend/src/pages/ProgressTrackerPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Import Link for the final stage
import apiService from '../services/api'; // Adjust path if needed
import Spinner from '../components/Spinner'; // Adjust path if needed
import {
    ChevronDownIcon,
    ChevronRightIcon,
    AcademicCapIcon, // Advanced Cultivation
    CheckBadgeIcon, // Advanced Quality
    SparklesIcon, // Basic Cultivation
    BookOpenIcon, // History
    BeakerIcon, // Science / Extraction
    TagIcon, // Classification
    ShieldCheckIcon, // Compliance
    ChatBubbleLeftRightIcon, // Customer Service
    ArrowTrendingUpIcon, // Emerging Trends
    BuildingOffice2Icon, // Industry
    HeartIcon, // Medical
    UserCircleIcon, // Physiology
    CpuChipIcon, // Anatomy
    ShoppingBagIcon, // Products
    WrenchScrewdriverIcon, // Troubleshooting
    QuestionMarkCircleIcon // Default
 } from '@heroicons/react/24/outline'; // Using outline style

// --- SVG Components for Progress Visualization ---
// Define SVG components for each stage (Slightly refined "cute" style)
// Using currentColor for easier theme adaptation via parent text color
const Seed = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M32 58 C 20 58 14 47.5 14 36 S 20 14 32 14 S 50 24.5 50 36 S 44 58 32 58 Z" className="text-yellow-600 dark:text-yellow-400"/>
    <path d="M32 18 C 34 16 35 13.5 35 11 C 35 6 32 2 32 2 S 29 6 29 11 C 29 13.5 30 16 32 18 Z" className="text-lime-500 dark:text-lime-300"/>
  </svg>
);

const Seedling = ({ className = "w-20 h-20" }) => (
  <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 59 H 52 V 56 H 12 Z M 15 56 H 49 L 45 42 H 19 Z" fill="#A0522D" stroke="#654321" strokeWidth="1.5"/>
    <rect x="18" y="42" width="28" height="4" fill="#8B4513"/>
    <path d="M32 42 V 22" stroke="currentColor" className="text-lime-600 dark:text-lime-400" strokeWidth="3" strokeLinecap="round"/>
    <path d="M32 28 C 26 22 23 29 32 28 Z" fill="currentColor" className="text-lime-600 dark:text-lime-400"/>
    <path d="M32 28 C 38 22 41 29 32 28 Z" fill="currentColor" className="text-lime-600 dark:text-lime-400"/>
  </svg>
);

const SmallPlant = ({ className = "w-24 h-24" }) => (
   <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 59 H 52 V 56 H 12 Z M 15 56 H 49 L 45 40 H 19 Z" fill="#A0522D" stroke="#654321" strokeWidth="1.5"/>
    <rect x="18" y="40" width="28" height="4" fill="#8B4513"/>
    <path d="M32 40 V 18" stroke="currentColor" className="text-green-600 dark:text-green-400" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M32 22 C 24 16 20 25 32 22 Z" fill="currentColor" className="text-green-600 dark:text-green-400"/>
    <path d="M32 22 C 40 16 44 25 32 22 Z" fill="currentColor" className="text-green-600 dark:text-green-400"/>
    <path d="M32 30 C 27 27 24 33 32 30 Z" fill="currentColor" className="text-green-600 dark:text-green-400"/>
    <path d="M32 30 C 37 27 40 33 32 30 Z" fill="currentColor" className="text-green-600 dark:text-green-400"/>
     <path d="M32 38 C 29 36 27 40 32 38 Z" fill="currentColor" className="text-green-600 dark:text-green-400"/>
    <path d="M32 38 C 35 36 37 40 32 38 Z" fill="currentColor" className="text-green-600 dark:text-green-400"/>
  </svg>
);

const MediumPlant = ({ className = "w-28 h-28" }) => (
  <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 61 H 54 V 58 H 10 Z M 13 58 H 51 L 47 40 H 17 Z" fill="#A0522D" stroke="#654321" strokeWidth="1.5"/>
    <rect x="16" y="40" width="32" height="4" fill="#8B4513"/>
    <path d="M32 40 V 12" stroke="currentColor" className="text-emerald-600 dark:text-emerald-400" strokeWidth="4" strokeLinecap="round"/>
    <path d="M32 18 C 20 10 15 22 32 18 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/> <path d="M32 18 C 44 10 49 22 32 18 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/>
    <path d="M32 26 C 24 22 19 30 32 26 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/> <path d="M32 26 C 40 22 45 30 32 26 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/>
    <path d="M32 34 C 27 32 22 38 32 34 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/> <path d="M32 34 C 37 32 42 38 32 34 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/>
    <path d="M32 40 C 29 38 25 42 32 40 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/> <path d="M32 40 C 35 38 39 42 32 40 Z" fill="currentColor" className="text-emerald-600 dark:text-emerald-400"/>
  </svg>
);

const LargePlant = ({ className = "w-32 h-32" }) => (
 <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 61 H 54 V 58 H 10 Z M 13 58 H 51 L 47 38 H 17 Z" fill="#A0522D" stroke="#654321" strokeWidth="1.5"/>
    <rect x="16" y="38" width="32" height="4" fill="#8B4513"/>
    <path d="M32 38 V 5" stroke="currentColor" className="text-teal-600 dark:text-teal-400" strokeWidth="4.5" strokeLinecap="round"/>
    <path d="M32 10 C 18 2 10 15 32 10 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/> <path d="M32 10 C 46 2 54 15 32 10 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/>
    <path d="M32 18 C 22 14 15 23 32 18 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/> <path d="M32 18 C 42 14 49 23 32 18 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/>
    <path d="M32 26 C 25 24 18 30 32 26 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/> <path d="M32 26 C 39 24 46 30 32 26 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/>
    <path d="M32 34 C 28 32 22 38 32 34 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/> <path d="M32 34 C 36 32 42 38 32 34 Z" fill="currentColor" className="text-teal-600 dark:text-teal-400"/>
    {/* Buds */}
    <circle cx="32" cy="12" r="4" fill="#14532d" className="dark:fill-green-700"/> <circle cx="25" cy="20" r="3" fill="#14532d" className="dark:fill-green-700"/> <circle cx="39" cy="20" r="3" fill="#14532d" className="dark:fill-green-700"/>
    <circle cx="28" cy="28" r="2.5" fill="#14532d" className="dark:fill-green-700"/> <circle cx="36" cy="28" r="2.5" fill="#14532d" className="dark:fill-green-700"/>
  </svg>
);

const CuredBud = ({ className = "w-28 h-28" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M32 8 Q 18 15 21 30 T 18 45 Q 25 58 32 62 Q 39 58 46 45 T 43 30 Q 46 15 32 8 Z" className="text-orange-900 dark:text-orange-500" fill="#8B4513"/>
    <circle cx="32" cy="25" r="2.5" className="text-amber-600 dark:text-amber-400"/>
    <circle cx="28" cy="38" r="2" className="text-amber-600 dark:text-amber-400"/>
    <circle cx="36" cy="38" r="2" className="text-amber-600 dark:text-amber-400"/>
    <circle cx="32" cy="50" r="2.5" className="text-amber-600 dark:text-amber-400"/>
    <circle cx="25" cy="48" r="1.5" className="text-amber-600 dark:text-amber-400"/>
    <circle cx="39" cy="48" r="1.5" className="text-amber-600 dark:text-amber-400"/>
  </svg>
);

const BaggedBud = ({ className = "w-28 h-28" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Combined className for the main bag path */}
    <path d="M14 60 V 20 C 14 12 20 8 32 8 C 44 8 50 12 50 20 V 60 H 44 V 25 C 44 20 40 16 32 16 C 24 16 20 20 20 25 V 60 H 14 Z" stroke="#A9A9A9" className="dark:stroke-gray-500" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.1"/>
    {/* Combined className for the top seal rectangle */}
    <rect x="10" y="8" width="44" height="6" fill="#D3D3D3" className="dark:fill-gray-600 dark:stroke-gray-400" stroke="#808080" strokeWidth="1" rx="2"/>
    {/* Combined className for the bud path */}
    <path d="M32 25 Q 25 30 27 40 T 25 50 Q 28 58 32 61 Q 36 58 40 50 T 37 40 Q 40 30 32 25 Z" fill="#15803d" className="dark:fill-green-600"/>
    {/* Combined className for the circles */}
    <circle cx="32" cy="38" r="2" fill="#16a34a" className="dark:fill-green-500"/>
    <circle cx="28" cy="48" r="1.5" fill="#16a34a" className="dark:fill-green-500"/>
    <circle cx="36" cy="48" r="1.5" fill="#16a34a" className="dark:fill-green-500"/>
  </svg>
);


// Simple placeholder for the card link/icon
const HolographicCardIcon = ({ className = "w-32 h-32" }) => (
    <div className={`${className} p-2 rounded-lg bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-pulse flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}>
        <span className="text-white font-bold text-center text-sm drop-shadow-lg">Cultivated! ✨<br/>(View Card)</span>
    </div>
);
// --- End SVG Components ---

// --- Progress Visualization Component ---
const ProgressVisualization = ({ percentage }) => {
  let StageComponent = Seed; // Default to Seed
  let stageName = "Seed";
  let isComplete = false;

  // Determine stage based on percentage
  // Adjust thresholds as needed
  if (percentage >= 100) { StageComponent = HolographicCardIcon; stageName = "Cultivated Master!"; isComplete = true; }
  else if (percentage >= 90) { StageComponent = BaggedBud; stageName = "Bagged & Ready"; }
  else if (percentage >= 75) { StageComponent = CuredBud; stageName = "Curing"; }
  else if (percentage >= 55) { StageComponent = LargePlant; stageName = "Flowering"; }
  else if (percentage >= 35) { StageComponent = MediumPlant; stageName = "Vegetative Growth"; }
  else if (percentage >= 15) { StageComponent = SmallPlant; stageName = "Sprout"; }
  else if (percentage >= 0) { StageComponent = Seedling; stageName = "Seedling"; }

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">Your Growth</h2>
      <div className="mb-2">
        {/* Conditionally render Link or just the SVG */}
        {isComplete ? (
          <Link to="/cultivated-card" aria-label="View your Cultivated Budtender Card">
            {/* HolographicCardIcon is a div, not an SVG, so no aria-hidden needed here */}
            <StageComponent />
          </Link>
        ) : (
          // StageComponent here will be one of the SVGs, which have aria-hidden
          <StageComponent />
        )}
      </div>
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">{stageName}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">(Based on Overall Mastery)</p>
    </div>
  );
};
// --- End Progress Visualization Component ---


// --- Helper Function for Main Category Icons ---
const getMainCategoryIcon = (mainCategoryName) => {
    const commonClasses = "h-5 w-5 text-gray-500 dark:text-gray-400"; // Common styling for icons

    // Add aria-hidden="true" to all icons as they are decorative next to text
    switch (mainCategoryName) {
        case "Advanced Cultivation Techniques": return <AcademicCapIcon className={commonClasses} aria-hidden="true" />;
        case "Advanced Quality Assessment": return <CheckBadgeIcon className={commonClasses} aria-hidden="true" />;
        case "Basic Cultivation Concepts": return <SparklesIcon className={commonClasses} aria-hidden="true" />;
        case "Cannabis History": return <BookOpenIcon className={commonClasses} aria-hidden="true" />;
        case "Cannabis Science Fundamentals": return <BeakerIcon className={commonClasses} aria-hidden="true" />;
        case "Classification": return <TagIcon className={commonClasses} aria-hidden="true" />;
        case "Compliance, Safety & Regulations": return <ShieldCheckIcon className={commonClasses} aria-hidden="true" />;
        case "Customer Service & Sales Techniques": return <ChatBubbleLeftRightIcon className={commonClasses} aria-hidden="true" />;
        case "Emerging Trends": return <ArrowTrendingUpIcon className={commonClasses} aria-hidden="true" />;
        case "Extraction Methods": return <BeakerIcon className={commonClasses} aria-hidden="true" />; // Reusing BeakerIcon
        case "Industry & Society": return <BuildingOffice2Icon className={commonClasses} aria-hidden="true" />;
        case "Medical Applications & Patient Guidance": return <HeartIcon className={commonClasses} aria-hidden="true" />;
        case "Physiology & Effects": return <UserCircleIcon className={commonClasses} aria-hidden="true" />;
        case "Plant Anatomy": return <CpuChipIcon className={commonClasses} aria-hidden="true" />;
        case "Products & Consumption Methods": return <ShoppingBagIcon className={commonClasses} aria-hidden="true" />;
        case "Troubleshooting": return <WrenchScrewdriverIcon className={commonClasses} aria-hidden="true" />;
        default: return <QuestionMarkCircleIcon className={commonClasses} aria-hidden="true" />; // Default icon
    }
};
// --- End Helper Function ---


// --- Helper Component: ProgressBar ---
// Added ariaLabel prop for accessibility
const ProgressBar = ({ percentage, ariaLabel }) => {
  const safePercentage = Math.max(0, Math.min(100, percentage || 0));
  let bgColor = 'bg-red-500';
  if (safePercentage >= 85) {
    bgColor = 'bg-green-500';
  } else if (safePercentage >= 60) {
    bgColor = 'bg-yellow-500';
  }

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden my-1">
      <div
        className={`h-2.5 rounded-full ${bgColor} transition-all duration-500 ease-out`}
        style={{ width: `${safePercentage}%` }}
        role="progressbar"
        aria-valuenow={safePercentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={ariaLabel || "Progress"} // Use provided label or default
      ></div>
    </div>
  );
};

// --- Helper Component: Collapsible Section ---
const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full py-3 px-1 text-left text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded" // Added focus ring
                aria-expanded={isOpen}
                // Consider adding aria-controls pointing to the ID of the content div if needed
            >
                <span>{title}</span>
                {isOpen ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                )}
            </button>
            {isOpen && (
                // Optionally add id here and link with aria-controls above
                <div className="pb-4 pt-2 px-1 pl-6"> {/* Indent content */}
                    {children}
                </div>
            )}
        </div>
    );
};


// --- Main Progress Tracker Page ---
function ProgressTrackerPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [groupedMastery, setGroupedMastery] = useState({});
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingSubCats, setIsLoadingSubCats] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummaryData = useCallback(async () => {
    setIsLoadingSummary(true);
    setError(null);
    try {
      const response = await apiService.get('/stats/summary');
      setSummaryData(response.data?.data || { overallMastery: 0, categoryMastery: {} });
    } catch (err) {
      console.error("Error fetching summary data:", err);
      setError(err.response?.data?.message || "Failed to load summary progress data.");
      setSummaryData({ overallMastery: 0, categoryMastery: {} }); // Ensure it's not null on error
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const fetchSubCategoryData = useCallback(async () => {
    setIsLoadingSubCats(true);
    // Don't reset main error here, only set if sub-cat fails
    try {
      const response = await apiService.get('/stats/mastery-by-subcategory');
      const data = response.data?.data || [];
      const grouped = data.reduce((acc, item) => {
        const mainCat = item.mainCategory || 'Uncategorized';
        if (!acc[mainCat]) {
          acc[mainCat] = [];
        }
        // Ensure mastery is a number, default to 0
        const masteryValue = parseFloat(item.mastery);
        acc[mainCat].push({
            subCategory: item.sub_category || item.subCategory || 'Unknown Sub-Category',
            mastery: !isNaN(masteryValue) ? masteryValue : 0
        });
        // Sort sub-categories alphabetically
        acc[mainCat].sort((a, b) => (a.subCategory || '').localeCompare(b.subCategory || ''));
        return acc;
      }, {});
      setGroupedMastery(grouped);
    } catch (err) {
      console.error("Error fetching sub-category mastery:", err);
      // Set error only if no error already exists from summary fetch
      setError(prev => prev || (err.response?.data?.message || "Failed to load sub-category mastery data."));
    } finally {
      setIsLoadingSubCats(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaryData();
    fetchSubCategoryData();
  }, [fetchSummaryData, fetchSubCategoryData]);

  // Sort keys safely after data is potentially available
  const sortedMainCategories = Object.keys(groupedMastery).sort((a, b) => a.localeCompare(b));
  const sortedSummaryCategories = summaryData ? Object.keys(summaryData.categoryMastery).sort((a, b) => a.localeCompare(b)) : [];

  const overallMasteryValue = summaryData?.overallMastery || 0;
  const isLoading = isLoadingSummary || isLoadingSubCats;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Your Progress</h1>

      {/* Display error prominently if it exists */}
      {error && !isLoading && (
          <p className="p-4 mb-4 text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 border border-red-400 rounded" role="alert">
              {error}
          </p>
      )}

      {isLoading ? (
         <div className="flex justify-center items-center min-h-[300px]"><Spinner size="lg"/></div>
      ) : summaryData ? ( // Check if summaryData is available before rendering main content
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Overall Mastery & Dynamic Art */}
            <div className="lg:col-span-1 space-y-6">
                <ProgressVisualization percentage={overallMasteryValue} />
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Overall Mastery</h2>
                    <p className={`text-5xl font-bold mb-4 ${
                        overallMasteryValue >= 85 ? 'text-green-600 dark:text-green-400' :
                        overallMasteryValue >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                    }`}>
                        {overallMasteryValue.toFixed(1)}%
                    </p>
                    <ProgressBar percentage={overallMasteryValue} ariaLabel="Overall Mastery Progress" />
                </div>
            </div>

            {/* Right Column: Category & Sub-Category Mastery */}
            <div className="lg:col-span-2 space-y-6">
                {/* Mastery by Main Category */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                        Mastery by Category
                    </h2>
                    {/* Check specifically for summary categories length */}
                    {sortedSummaryCategories.length === 0 ? (
                         <p className="p-4 text-gray-500 dark:text-gray-400">No category data available.</p>
                    ) : (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {sortedSummaryCategories.map(category => (
                                <div key={category}>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        {/* --- Render Main Category Icon --- */}
                                        <div className="flex items-center space-x-2 flex-shrink min-w-0 mr-2"> {/* Added mr-2 */}
                                            {getMainCategoryIcon(category)}
                                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={category}>{category}</span> {/* Added truncate and title */}
                                        </div>
                                        {/* --- End Render Icon --- */}
                                        <span className={`font-semibold flex-shrink-0 ml-auto ${ /* Added ml-auto */
                                            summaryData.categoryMastery[category] >= 85 ? 'text-green-600 dark:text-green-400' :
                                            summaryData.categoryMastery[category] >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`}>
                                            {/* Ensure mastery value exists before calling toFixed */}
                                            {(summaryData.categoryMastery[category] ?? 0).toFixed(1)}%
                                        </span>
                                    </div>
                                    <ProgressBar
                                        percentage={summaryData.categoryMastery[category]}
                                        ariaLabel={`${category} Mastery Progress`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mastery by Sub-Category (Collapsible) */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                        Mastery by Sub-Category
                    </h2>
                    {/* Show spinner only while sub-cats are loading */}
                    {isLoadingSubCats ? (
                        <div className="p-6 flex justify-center"><Spinner /></div>
                    ) : sortedMainCategories.length === 0 ? (
                        <p className="p-6 text-gray-500 dark:text-gray-400">No sub-category mastery data available yet.</p>
                    ) : (
                        <div>
                            {sortedMainCategories.map((mainCategory) => (
                            <CollapsibleSection key={mainCategory} title={mainCategory} defaultOpen={false}>
                                <ul className="space-y-3">
                                {groupedMastery[mainCategory].map((sub) => (
                                    <li key={sub.subCategory}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-700 dark:text-gray-300 mr-2 truncate" title={sub.subCategory}>{sub.subCategory}</span> {/* Added truncate, title, mr-2 */}
                                            <span className={`font-medium ml-auto flex-shrink-0 ${ /* Added ml-auto, flex-shrink-0 */
                                                sub.mastery >= 85 ? 'text-green-600 dark:text-green-400' :
                                                sub.mastery >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                            }`}>
                                                {sub.mastery.toFixed(1)}%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            percentage={sub.mastery}
                                            ariaLabel={`${sub.subCategory} Mastery Progress`}
                                        />
                                    </li>
                                ))}
                                </ul>
                            </CollapsibleSection>
                            ))}
                        </div>
                    )}
                    {/* Removed the incorrect nav/button code block */}
                </div>
            </div>
        </div>
      ) : (
          // Fallback message if summaryData is null/undefined after loading and no error was caught
          // This handles edge cases where API might return success but empty/invalid data
          !isLoading && !error && <p className="p-4 text-center text-gray-500 dark:text-gray-400">Could not load progress data.</p>
      )}
    </div>
  );
}

export default ProgressTrackerPage;
