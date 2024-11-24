const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const User = require('./User');
const Post = require('./Post');

class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id"
      },
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      references: {
        model: Post,
        key: "id"
      },
      allowNull: false
    }
  },
  {
    sequelize, 
    modelName: 'Comment', 
    tableName: 'Comments', 
    timestamps: true, 
  }
);

User.hasMany(Comment, { foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });

module.exports = Comment;
