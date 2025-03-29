const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Account = sequelize.define('Account', {
        currency: { 
            type: DataTypes.ENUM('IQD', 'USD'),
            allowNull: false
        },
        balance: { 
            type: DataTypes.DECIMAL(15, 2), 
            defaultValue: 0,
            validate: {
                min: 0 // Prevent negative balances
            }
        },
        physicalBalance: { 
            type: DataTypes.DECIMAL(15, 2), 
            defaultValue: 0,
            validate: {
                min: 0
            }
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

    // Add association to User model here later
    return Account;
};