// d:\Base_Directory_Storage\Coding\dispensary-app\backend\config\auth.config.js

// Default expiration time (24 hours in seconds)
const defaultJwtExpiration = 86400;
let effectiveJwtExpiration = defaultJwtExpiration;

// Check if JWT_EXPIRATION environment variable is set
if (process.env.JWT_EXPIRATION) {
  // Attempt to parse the environment variable as an integer (base 10)
  const parsedExpiration = parseInt(process.env.JWT_EXPIRATION, 10);

  // Check if parsing was successful and the value is a positive number
  if (!isNaN(parsedExpiration) && parsedExpiration > 0) {
    effectiveJwtExpiration = parsedExpiration;
    console.log(`Using JWT expiration from environment: ${effectiveJwtExpiration}s`);
  } else {
    // Log a warning if the environment variable value is invalid
    console.warn(`Invalid JWT_EXPIRATION value "${process.env.JWT_EXPIRATION}". Using default: ${defaultJwtExpiration}s.`);
  }
} else {
    console.log(`JWT_EXPIRATION not set in environment. Using default: ${defaultJwtExpiration}s`);
}

module.exports = {
    // Read JWT secret from environment variable for security
    // Provide a default fallback ONLY for local dev if .env is missing (not recommended for production)
    secret: process.env.JWT_SECRET || "fallback-very-secret-key-replace-in-env",

    // Use the determined expiration time
    jwtExpiration: effectiveJwtExpiration,

    // Optional: Configuration for refresh tokens if used
    // jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION ? parseInt(process.env.JWT_REFRESH_EXPIRATION, 10) : 604800, // e.g., 7 days default
};
