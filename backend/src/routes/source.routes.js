const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const prisma = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Add source to article
router.post('/', [
  auth,
  body('articleId').notEmpty(),
  body('url').isURL(),
  body('title').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { articleId, url, title, publisher, publishedAt, summary } = req.body;

    const source = await prisma.source.create({
      data: {
        articleId,
        url,
        title,
        publisher,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        summary
      }
    });

    res.status(201).json(source);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sources for article
router.get('/article/:articleId', auth, async (req, res) => {
  try {
    const sources = await prisma.source.findMany({
      where: { articleId: req.params.articleId },
      include: {
        citations: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update source
router.patch('/:id', auth, async (req, res) => {
  try {
    const { credibilityScore, summary } = req.body;

    const source = await prisma.source.update({
      where: { id: req.params.id },
      data: {
        ...(credibilityScore !== undefined && { credibilityScore }),
        ...(summary && { summary })
      }
    });

    res.json(source);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete source
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.source.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add citation
router.post('/citations', [
  auth,
  body('articleId').notEmpty(),
  body('sourceId').notEmpty(),
  body('quote').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { articleId, sourceId, quote, context, position } = req.body;

    const citation = await prisma.citation.create({
      data: {
        articleId,
        sourceId,
        quote,
        context,
        position
      },
      include: {
        source: true
      }
    });

    res.status(201).json(citation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
