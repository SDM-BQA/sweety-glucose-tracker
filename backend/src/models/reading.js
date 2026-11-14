const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SLOTS = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];

class Reading extends Model {}

Reading.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      // Stored as a plain date (no time component) so "one reading per
      // slot per day" comparisons don't have to worry about timezones.
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    slot: {
      type: DataTypes.ENUM(...SLOTS),
      allowNull: false,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Reading',
    tableName: 'readings',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'date', 'slot'],
      },
    ],
  }
);

module.exports = { Reading, SLOTS };
