const sequelize = require('../config/database');
const User = require('./user');
const { Reading, SLOTS } = require('./reading');

User.hasMany(Reading, { foreignKey: 'userId', onDelete: 'CASCADE' });
Reading.belongsTo(User, { foreignKey: 'userId' });

User.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
User.hasMany(User, { as: 'patients', foreignKey: 'doctorId' });

module.exports = { sequelize, User, Reading, SLOTS };
