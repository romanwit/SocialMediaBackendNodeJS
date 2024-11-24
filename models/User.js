const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Follow = require('./Follow');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    }
  },
  {
    sequelize, 
    modelName: 'User', 
    tableName: 'Users', 
    timestamps: true, 
  }
);

User.hasMany(Follow, { foreignKey: 'followerId', as: 'Follows' });  
User.hasMany(Follow, { foreignKey: 'followeeId', as: 'Followers' });  

module.exports = User;
