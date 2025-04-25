function errorHandler(err, req, res, next) {
    console.error("Global Error Handler Caught:");
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack || "No stack trace available");
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'An unexpected error occurred';
  
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message: message,
    });
  }
  module.exports = errorHandler;