const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const prisma = require('../config/database');

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
router.get('/me/stats', auth, async (req, res) => {
  try {
    const [articlesCount, commentsCount, publishedCount] = await Promise.all([
      prisma.article.count({ where: { authorId: req.userId } }),
      prisma.comment.count({ where: { userId: req.userId } }),
      prisma.article.count({ 
        where: { 
          authorId: req.userId,
          status: 'PUBLISHED'
        }
      })
    ]);

    res.json({
      articlesCount,
      commentsCount,
      publishedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
