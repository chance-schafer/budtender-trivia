import React from 'react';
import { Link } from 'react-router-dom';

// --- SVG Components for Plant Stages ---
// Using the provided SVG definitions
const SeedlingIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto text-green-500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 60V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 30C20 28 18 18 18 18C28 18 32 30 32 30Z" fill="currentColor" />
  </svg>
);

const SproutIcon = () => (
  <svg viewBox="0 0 64 64" className="w-20 h-20 mx-auto text-green-500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 60V28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 28C20 24 16 14 16 14C26 14 32 28 32 28Z" fill="currentColor" />
    <path d="M32 28C44 24 48 14 48 14C38 14 32 28 32 28Z" fill="currentColor" className="opacity-80" />
  </svg>
);

const GrowingIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto text-green-600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 60V26" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 26C24 20 18 8 18 8C28 10 32 26 32 26Z" fill="currentColor" />
    <path d="M32 26C40 20 46 8 46 8C36 10 32 26 32 26Z" fill="currentColor" className="opacity-80"/>
  </svg>
);

const BuddingIcon = () => (
  <svg viewBox="0 0 64 64" className="w-28 h-28 mx-auto text-emerald-600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 60V24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="20" r="6" fill="#DAA520" /> {/* Using specific color */}
    <path d="M26 22C22 16 12 10 12 10C20 10 28 16 26 22Z" fill="currentColor" />
    <path d="M38 22C42 16 52 10 52 10C44 10 36 16 38 22Z" fill="currentColor" className="opacity-80"/>
  </svg>
);

const FloweringIcon = () => (
  <svg viewBox="0 0 64 64" className="w-32 h-32 mx-auto text-emerald-700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 60V20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="16" r="4" fill="#FFD700" /> {/* Using specific color */}
    <path d="M26 16C24 12 16 8 16 8C22 10 28 12 26 16Z" fill="#FF69B4" /> {/* Using specific color */}
    <path d="M38 16C40 12 48 8 48 8C42 10 36 12 38 16Z" fill="#FF69B4" /> {/* Using specific color */}
  </svg>
);

const HarvestReadyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-36 h-36 mx-auto text-teal-600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 60V18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M26 16C22 10 14 6 14 6C22 8 28 12 26 16Z" fill="#8B4513" /> {/* Using specific color */}
    <path d="M38 16C42 10 50 6 50 6C42 8 36 12 38 16Z" fill="#8B4513" /> {/* Using specific color */}
    <circle cx="32" cy="14" r="6" fill="#FFA500" /> {/* Using specific color */}
  </svg>
);
// --- End of SVG definitions ---


// --- Holographic Card Icon (Keep this) ---
const HolographicCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 7.5l5.571 2.25M3 18.75l4.179-2.25M21 18.75l-4.179-2.25m0 0l-5.571 3-5.571-3M15 12l-3 3m0 0l-3-3m3 3V7.5" />
  </svg>
);


const ProgressVisualization = ({ percentage }) => {
  const safePercentage = Math.max(0, Math.min(100, percentage || 0));

  let PlantIcon;
  let stageText;
  let showCard = false;

  // Determine Plant Stage and Icon
  if (safePercentage < 10) { PlantIcon = SeedlingIcon; stageText = "Seedling"; }
  else if (safePercentage < 30) { PlantIcon = SproutIcon; stageText = "Sprout"; }
  else if (safePercentage < 50) { PlantIcon = GrowingIcon; stageText = "Growing"; }
  else if (safePercentage < 75) { PlantIcon = BuddingIcon; stageText = "Budding"; }
  else if (safePercentage < 100) { PlantIcon = FloweringIcon; stageText = "Flowering"; }
  else {
    PlantIcon = HarvestReadyIcon;
    stageText = "Harvest Ready!";
    showCard = true; // Set flag to show card icon
  }

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-slate-900 rounded-xl shadow-lg text-center border dark:border-gray-700 relative overflow-hidden">
       {/* Optional subtle background pattern */}
       <div className="absolute inset-0 opacity-5 dark:opacity-[3%] bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%20width%3D%2280%22%20height%3D%2280%22%3E%3Cpath%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.2%22%20d%3D%22M10%2010h60v60H10z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')]"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-around">
        {/* Plant Stage */}
        <div className="mb-4 md:mb-0 md:mr-8 transform transition-transform duration-500 hover:scale-110">
          {/* Render the selected PlantIcon component */}
          {PlantIcon && <PlantIcon />}
          <p className="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-300">{stageText}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">({safePercentage.toFixed(1)}% Mastery)</p>
        </div>

        {/* Conditional Card Link */}
        {showCard && (
          <div className="text-center group">
            <Link to="/cultivated-card" title="View Your Cultivated Card" className="inline-block p-4 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
              <HolographicCardIcon />
            </Link>
            <p className="mt-2 text-sm font-semibold text-purple-600 dark:text-purple-400">Cultivated Card Unlocked!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressVisualization;