const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const User = require('./User');
const Post = require('./Post');

class Like extends Model {}

Like.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id"
      },
      primaryKey: true,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      references: {
        model: Post,
        key: "id"
      },
      primaryKey: true,
      allowNull: false,
    }
  },
  {
    sequelize, 
    modelName: 'Like', 
    tableName: 'Likes', 
    timestamps: true, 
  }
);

Post.belongsToMany(User, { through: Like, foreignKey: 'postId', as: 'LikedUsers' });
User.belongsToMany(Post, { through: Like, foreignKey: 'userId', as: 'LikedPosts' });
//Like.hasMany(Post, {foreignKey: "id", as: "posts"});

module.exports = Like;
