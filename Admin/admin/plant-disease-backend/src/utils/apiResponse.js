const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };