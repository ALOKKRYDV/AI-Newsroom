const express = require('express');
const { auth, roleAuth } = require('../middleware/auth.middleware');
const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// SSE clients storage
const sseClients = new Map();

// SSE endpoint for real-time updates
router.get('/stream/:articleId', auth, (req, res) => {
  const { articleId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = `${req.userId}-${Date.now()}`;
  
  if (!sseClients.has(articleId)) {
    sseClients.set(articleId, new Map());
  }
  
  sseClients.get(articleId).set(clientId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients.get(articleId)?.delete(clientId);
    if (sseClients.get(articleId)?.size === 0) {
      sseClients.delete(articleId);
    }
  });
});

// Broadcast update to all clients watching an article
const broadcastUpdate = (articleId, data) => {
  const clients = sseClients.get(articleId);
  if (clients) {
    clients.forEach((client) => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
};

// Create article
router.post('/', [
  auth,
  body('title').trim().notEmpty(),
  body('content').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content = '', tags = [] } = req.body;

    // Always create as DRAFT
    const article = await prisma.article.create({
      data: {
        title,
        content,
        tags,
        authorId: req.userId,
        status: 'DRAFT'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit for review (writer -> IN_REVIEW)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    if (article.authorId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the author or admin can submit for review' });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: { status: 'IN_REVIEW' }
    });

    // Notify editors (simplified: create notifications for all editors)
    const editors = await prisma.user.findMany({ where: { role: 'EDITOR' } });
    for (const ed of editors) {
      await prisma.notification.create({
        data: {
          userId: ed.id,
          type: 'review',
          title: 'Article submitted for review',
          message: `Article "${article.title}" was submitted for review.`,
          link: `/articles/${id}`
        }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all articles (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, authorId, search, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              comments: true,
              versions: true
            }
          }
        }
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single article
router.get('/:id', auth, async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        sources: true,
        citations: {
          include: {
            source: true
          }
        },
        images: true,
        comments: {
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
              }
            }
          },
          where: {
            parentId: null
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        factChecks: true,
        agentLogs: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, status, tags, featuredImage } = req.body;

    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check permissions
    if (existingArticle.authorId !== req.userId && req.userRole !== 'EDITOR' && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;

    // Create version if content changed
    if (content !== undefined && content !== existingArticle.content) {
      const versionCount = await prisma.articleVersion.count({
        where: { articleId: id }
      });

      await prisma.articleVersion.create({
        data: {
          articleId: id,
          userId: req.userId,
          content: existingArticle.content,
          title: existingArticle.title,
          versionNumber: versionCount + 1
        }
      });
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Broadcast update via SSE
    broadcastUpdate(id, {
      type: 'article-updated',
      article,
      updatedBy: req.userId
    });

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.authorId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await prisma.article.delete({
      where: { id }
    });

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get article versions
router.get('/:id/versions', auth, async (req, res) => {
  try {
    const versions = await prisma.articleVersion.findMany({
      where: { articleId: req.params.id },
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
        versionNumber: 'desc'
      }
    });

    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish article
router.post('/:id/publish', [auth, roleAuth('EDITOR', 'ADMIN')], async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    broadcastUpdate(req.params.id, {
      type: 'article-published',
      article
    });

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
