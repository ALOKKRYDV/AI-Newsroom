const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create comment
router.post('/', [
  auth,
  body('articleId').notEmpty(),
  body('content').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { articleId, content, parentId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId: req.userId,
        content,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Create notification for article author
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true }
    });

    if (article.authorId !== req.userId) {
      await prisma.notification.create({
        data: {
          userId: article.authorId,
          type: 'comment',
          title: 'New Comment',
          message: `${comment.user.name} commented on your article`,
          link: `/articles/${articleId}`
        }
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for article
router.get('/article/:articleId', auth, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        articleId: req.params.articleId,
        parentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update comment
router.patch('/:id', auth, async (req, res) => {
  try {
    const { content, resolved } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id: req.params.id }
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.userId !== req.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: {
        ...(content && { content }),
        ...(resolved !== undefined && { resolved })
      }
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await prisma.comment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
