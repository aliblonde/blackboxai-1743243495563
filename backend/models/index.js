const { Sequelize } = require('sequelize');
const config = require('../config/database');
const UserModel = require('./User');
const AccountModel = require('./Account');
const TransactionModel = require('./Transaction');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define
  }
);

const models = {
  User: UserModel(sequelize),
  Account: AccountModel(sequelize),
  Transaction: TransactionModel(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// User has many Accounts
models.User.hasMany(models.Account, { foreignKey: 'userId' });
models.Account.belongsTo(models.User, { foreignKey: 'userId' });

// Account has many Transactions (as sender)
models.Account.hasMany(models.Transaction, { foreignKey: 'fromAccountId' });
models.Transaction.belongsTo(models.Account, { foreignKey: 'fromAccountId' });

module.exports = {
  ...models,
  sequelize,
  Sequelize
};