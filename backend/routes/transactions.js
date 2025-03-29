const express = require('express');
const router = express.Router();
const { User, Account, Transaction } = require('../models');
const { authenticateUser } = require('../middleware/auth');
const { validateCurrency } = require('../middleware/validation');

// Request money transfer
router.post('/', authenticateUser, validateCurrency, async (req, res) => {
  try {
    const { toPhone, amount, currency } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find sender's account
    const senderAccount = await Account.findOne({
      where: {
        userId,
        currency
      }
    });

    if (!senderAccount) {
      return res.status(404).json({ error: `No ${currency} account found` });
    }

    // Check sufficient balance
    if (parseFloat(senderAccount.balance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      fromAccountId: senderAccount.id,
      toPhone,
      amount,
      currency,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get pending transactions (for employees/admins)
router.get('/pending', authenticateUser, async (req, res) => {
  try {
    // Only employees/admins can view pending transactions
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const pendingTransactions = await Transaction.findAll({
      where: { status: 'pending' },
      include: [{
        model: Account,
        include: [{
          model: User,
          attributes: ['phone']
        }]
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      transactions: pendingTransactions.map(tx => ({
        id: tx.id,
        fromPhone: tx.Account.User.phone,
        toPhone: tx.toPhone,
        amount: tx.amount,
        currency: tx.currency,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    res.status(500).json({ error: 'Failed to fetch pending transactions' });
  }
});

// Approve/reject transaction (employee/admin only)
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    // Only employees/admins can approve transactions
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status, commission = 0 } = req.body;
    const transactionId = req.params.id;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Validate commission
    if (isNaN(commission) || commission < 0) {
      return res.status(400).json({ error: 'Invalid commission' });
    }

    // Find transaction
    const transaction = await Transaction.findByPk(transactionId, {
      include: [{
        model: Account,
        include: [User]
      }]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // If approving, process the transfer
    if (status === 'approved') {
      // Calculate final amount after commission
      const finalAmount = parseFloat(transaction.amount) * (1 + parseFloat(commission)/100);

      // Find sender's account
      const senderAccount = await Account.findByPk(transaction.fromAccountId);
      
      // Check sufficient balance
      if (parseFloat(senderAccount.balance) < finalAmount) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Find receiver's account (create if doesn't exist)
      const receiver = await User.findOne({ where: { phone: transaction.toPhone } });
      if (!receiver) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      let receiverAccount = await Account.findOne({
        where: {
          userId: receiver.id,
          currency: transaction.currency
        }
      });

      if (!receiverAccount) {
        receiverAccount = await Account.create({
          userId: receiver.id,
          currency: transaction.currency,
          balance: 0,
          physicalBalance: 0
        });
      }

      // Update balances
      senderAccount.balance = parseFloat(senderAccount.balance) - finalAmount;
      receiverAccount.balance = parseFloat(receiverAccount.balance) + parseFloat(transaction.amount);
      
      await Promise.all([
        senderAccount.save(),
        receiverAccount.save()
      ]);
    }

    // Update transaction status
    transaction.status = status;
    transaction.commission = commission;
    await transaction.save();

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        commission: transaction.commission,
        updatedAt: transaction.updatedAt
      }
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// Get transaction history
router.get('/', authenticateUser, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        '$Account.userId$': req.user.id
      },
      include: [{
        model: Account,
        attributes: []
      }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx.id,
        toPhone: tx.toPhone,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        commission: tx.commission,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

module.exports = router;