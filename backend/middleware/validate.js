const { validationResult } = require('express-validator');

// Runs after express-validator's checks — 422s with the first error message, or continues.
const validate = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  next();
};

module.exports = validate;
