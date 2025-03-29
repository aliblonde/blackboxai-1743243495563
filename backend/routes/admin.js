const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateUser } = require('../middleware/auth');

// Get all users (admin only)
router.get('/users', authenticateUser, async (req, res) => {
  try {
    // Only admins can view all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const users = await User.findAll({
      attributes: ['id', 'phone', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', authenticateUser, async (req, res) => {
  try {
    // Only admins can change roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { role } = req.body;
    const userId = req.params.id;

    // Validate role
    if (!['user', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent modifying own role
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ error: 'Cannot modify your own role' });
    }

    // Find and update user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get system statistics (admin only)
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    // Only admins can view stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [userCount, accountCount, transactionCount] = await Promise.all([
      User.count(),
      Account.count(),
      Transaction.count()
    ]);

    res.json({
      success: true,
      stats: {
        userCount,
        accountCount,
        transactionCount
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

module.exports = router;