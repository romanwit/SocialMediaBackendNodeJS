const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

class Follow extends Model {}

Follow.init(
  {
    followerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: "id"
      },
      primaryKey: true,
      allowNull: false,
    },
    followeeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: "id"
      },
      primaryKey: true,
      allowNull: false,
    }
  },
  {
    sequelize, 
    modelName: 'Follow', 
    tableName: 'Follows', 
    timestamps: true, 
  }
);

module.exports = Follow;
