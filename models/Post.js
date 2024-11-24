const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const User = require('./User');

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    author: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      },
      allowNull: false,
    }
  },
  {
    sequelize, 
    modelName: 'Post', 
    tableName: 'Posts', 
    timestamps: true, 
  }
);

User.hasMany(Post, { foreignKey: 'author', as: 'posts' }); 
Post.belongsTo(User, { foreignKey: 'author', as: 'user' }); 


module.exports = Post;
