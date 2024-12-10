const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const User = require('./models/User');
const Post = require('./models/Post');
const Follow = require('./models/Follow');
const Like = require('./models/Like');
const Comment = require('./models/Comment');

const app = express();
app.use(bodyParser.json());

sequelize.sync().then(() => console.log("Database connected"));

app.get('/api/user/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findByPk(userId, { include: ['Follows'] });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'LikedUsers',
          attributes: ['id', 'username'],
          through: { attributes: [] }
        },
        Comment
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, desc, author } = req.body;
    if (!title || !desc) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const newPost = await Post.create({
      title,
      desc,
      author: author || 1
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const [updatedRows] = await Post.update(req.body, { where: { id: postId } });
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const deletedRows = await Post.destroy({ where: { id: postId } });
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

app.post('/api/follow/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const followeeId = parseInt(req.params.id, 10);

    if (isNaN(followeeId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const follower = await User.findByPk(userId);
    if (!follower) {
      return res.status(404).json({ message: 'Follower user not found' });
    }

    const userToFollow = await User.findByPk(followeeId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    await Follow.create({ followerId: userId, followeeId });
    res.json({ message: 'Followed user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
});

app.post('/api/unfollow/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const followeeId = parseInt(req.params.id, 10);

    if (isNaN(followeeId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const follower = await User.findByPk(userId);
    if (!follower) {
      return res.status(404).json({ message: 'Follower user not found' });
    }

    const userToFollow = await User.findByPk(followeeId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User to unfollow not found' });
    }

    const deleted = await Follow.destroy({ where: { followerId: userId, followeeId } });
    if (deleted) {
      res.json({ message: 'Unfollowed user' });
    } else {
      res.status(404).json({ message: 'Follow relationship not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
});

app.post('/api/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user or post ID format' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Like.create({ userId, postId });
    res.json({ message: 'Post liked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

app.post('/api/unlike/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user or post ID format' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const deleted = await Like.destroy({ where: { userId, postId } });
    if (deleted) {
      res.json({ message: 'Post unliked' });
    } else {
      res.status(404).json({ message: 'Like not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unliking post', error: error.message });
  }
});

app.post('/api/comment/:id', async (req, res) => {
  try {
    const { userId, comment } = req.body;
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user or post ID format' });
    }

    if (!comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = await Comment.create({
      comment,
      userId,
      postId
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    const newUser = await User.create({ username, email });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.listen(8000, () => console.log('Server running on port 8000'));
