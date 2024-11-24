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

sequelize.sync().then(
	() => console.log("Database connected"));

app.get('/api/user/:id', async(req, res)=>{
	const user = await User.findByPk(req.params.id, {include: ['Follows']});
	res.json(user);
});

app.get('/api/posts', async (req, res) => {
  const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
  res.json(posts);
});

app.get('/api/posts/:id', async (req, res) => {
  const post = await Post.findByPk(req.params.id, { include: 
    [
      {
          model: User,
          as: 'LikedUsers',  
          attributes: ['id', 'username'],  
          through: { attributes: [] }  
        }, 
      Comment] 
  });
  res.json(post);
});

app.post('/api/posts', async (req, res) => {
  const post = await Post.create({
    title: req.body.title,
    desc: req.body.desc,
    author: req.body.author || 1,
  });
  res.json(post);
});

app.put('/api/posts/:id', async (req, res) => {
  await Post.update(req.body, { where: { id: req.params.id } });
  res.json({ message: 'Post updated' });
});

app.delete('/api/posts/:id', async (req, res) => {
  await Post.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Post deleted' });
});

app.post('/api/follow/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const followeeId = req.params.id;

    const follower = await User.findByPk(userId);
    if (!follower) {
      return res.status(404).json({ message: 'Follower user not found' });
    }

    const userToFollow = await User.findByPk(followeeId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    console.log(`trying to follow: ${userId}, ${followeeId}`);

    await Follow.create({ followerId: userId, followeeId: followeeId });

    res.json({ message: 'Followed user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
});


app.post('/api/unfollow/:id', async (req, res) => {

  try {
	     const { userId } = req.body;
	     const followeeId = req.params.id;

    	const follower = await User.findByPk(userId);
    		if (!follower) {
      		return res.status(404).json({ message: 'Follower user not found' });
    	}

      const userToFollow = await User.findByPk(followeeId);
      if (!userToFollow) {
          return res.status(404).json({ message: 'User to follow not found' });
      }

  	 await Follow.destroy({ where: { followerId: userId, followeeId: followeeId } });
  	 res.json({ message: 'Unfollowed user' });
  } catch (error) {
	console.error(error);
    	res.status(500).json({ message: 'Error unfollowing user', error: error.message });
	}
});

app.post('/api/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.id;

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
    console.error(`Error liking post: ${error}`);
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
});

app.post('/api/unlike/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.id;

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
    console.error(`Error unliking post: ${error}`);
    res.status(500).json({ message: 'Error unliking post', error: error.message });
  }
});


app.post('/api/comment/:id', async (req, res) => {
  
  const { userId } = req.body;
  const user = await User.findByPk(userId);
  
  if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  const postId = req.params.id; 
  console.log(`postId = ${postId}`);
  const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

  const comment = await Comment.create({
    comment: req.body.comment,
    userId: userId,
    postId: postId,
  });
  res.json(comment);
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, email } = req.body; // Извлечение данных из запроса
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

