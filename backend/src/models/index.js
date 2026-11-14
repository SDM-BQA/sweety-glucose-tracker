const sequelize = require('../config/database');
const User = require('./user');
const { Reading, SLOTS } = require('./reading');

User.hasMany(Reading, { foreignKey: 'userId', onDelete: 'CASCADE' });
Reading.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Reading, SLOTS };
