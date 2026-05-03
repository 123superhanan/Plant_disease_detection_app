const { sendError } = require('../utils/apiResponse');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return sendError(res, 400, 'Validation error', errors);
    }
    
    req[property] = value;
    next();
  };
};

module.exports = { validate };