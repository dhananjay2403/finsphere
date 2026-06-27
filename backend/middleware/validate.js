const { validationResult } = require('express-validator');

/**
 * Runs after express-validator checks.
 * If errors exist, returns 422 with the first error message.
 * Otherwise, calls next() to proceed to the controller.
*/
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
