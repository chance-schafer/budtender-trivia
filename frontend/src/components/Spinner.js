import React from 'react';

/**
 * A simple loading spinner component using Tailwind CSS for animation.
 * Indicates that data is being loaded or an operation is in progress.
 */
function Spinner() {
  return (
    <div className="flex justify-center items-center py-10" aria-label="Loading...">
      {/* The spinning element */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div> {/* Adjusted border for visibility */}
    </div>
  );
}

export default Spinner;