const { body, validationResult } = require('express-validator');

// Currency validation
const validateCurrency = [
  body('currency').isIn(['IQD', 'USD']).withMessage('Invalid currency'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Phone number validation
const validatePhone = [
  body('phone').matches(/^\+?\d{10,15}$/).withMessage('Invalid phone number format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// PIN validation
const validatePIN = [
  body('pin')
    .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits')
    .isNumeric().withMessage('PIN must contain only numbers'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Amount validation
const validateAmount = [
  body('amount')
    .isFloat({ gt: 0 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateCurrency,
  validatePhone,
  validatePIN,
  validateAmount
};