const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Transaction = sequelize.define('Transaction', {
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0.01 // Minimum transfer amount
            }
        },
        currency: {
            type: DataTypes.ENUM('IQD', 'USD'),
            allowNull: false
        },
        commission: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        toPhone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\+?\d{10,15}$/
            }
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    // Add associations to Account and User models here later
    return Transaction;
};