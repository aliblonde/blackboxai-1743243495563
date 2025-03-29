const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        phone: { 
            type: DataTypes.STRING, 
            unique: true,
            validate: {
                is: /^\+?\d{10,15}$/ // Basic phone number validation
            }
        },
        pin: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: { 
            type: DataTypes.ENUM('user', 'employee', 'admin'), 
            defaultValue: 'user' 
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

    // Add hooks for password hashing here later
    return User;
};