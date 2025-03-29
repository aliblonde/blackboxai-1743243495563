const express = require('express');
const router = express.Router();
const { User, Account } = require('../models');
const { authenticateUser } = require('../middleware/auth');
const { validateCurrency } = require('../middleware/validation');

// Create new account (for a specific currency)
router.post('/', authenticateUser, validateCurrency, async (req, res) => {
  try {
    const { currency } = req.body;
    const userId = req.user.id;

    // Check if account already exists for this currency
    const existingAccount = await Account.findOne({ 
      where: { 
        userId,
        currency 
      } 
    });

    if (existingAccount) {
      return res.status(400).json({ 
        error: `Account for ${currency} already exists` 
      });
    }

    // Create new account
    const account = await Account.create({
      userId,
      currency,
      balance: 0,
      physicalBalance: 0
    });

    res.status(201).json({
      success: true,
      account: {
        id: account.id,
        currency: account.currency,
        balance: account.balance,
        physicalBalance: account.physicalBalance
      }
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Get all accounts for user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const accounts = await Account.findAll({ 
      where: { userId: req.user.id },
      attributes: ['id', 'currency', 'balance', 'physicalBalance']
    });

    res.json({ 
      success: true, 
      accounts 
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Deposit funds (physical money)
router.post('/:id/deposit', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;
    const accountId = req.params.id;

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find and update account
    const account = await Account.findOne({ 
      where: { 
        id: accountId,
        userId: req.user.id 
      } 
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update balances
    account.balance = parseFloat(account.balance) + parseFloat(amount);
    account.physicalBalance = parseFloat(account.physicalBalance) + parseFloat(amount);
    await account.save();

    res.json({ 
      success: true,
      newBalance: account.balance,
      newPhysicalBalance: account.physicalBalance
    });
  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({ error: 'Failed to deposit funds' });
  }
});

// Withdraw funds (physical money)
router.post('/:id/withdraw', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;
    const accountId = req.params.id;

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find account
    const account = await Account.findOne({ 
      where: { 
        id: accountId,
        userId: req.user.id 
      } 
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check sufficient balance
    if (parseFloat(account.balance) < parseFloat(amount) || 
        parseFloat(account.physicalBalance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Update balances
    account.balance = parseFloat(account.balance) - parseFloat(amount);
    account.physicalBalance = parseFloat(account.physicalBalance) - parseFloat(amount);
    await account.save();

    res.json({ 
      success: true,
      newBalance: account.balance,
      newPhysicalBalance: account.physicalBalance
    });
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    res.status(500).json({ error: 'Failed to withdraw funds' });
  }
});

module.exports = router;