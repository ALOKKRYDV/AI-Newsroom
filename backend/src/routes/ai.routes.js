const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const aiService = require('../services/ai.service');
const prisma = require('../config/database');

const router = express.Router();

// Research endpoint
router.post('/research', auth, async (req, res) => {
  try {
    const { topic, keywords, articleId } = req.body;

    const result = await aiService.researchAgent(topic, keywords);

    if (articleId) {
      await prisma.agentLog.create({
        data: {
          articleId,
          agentType: 'RESEARCH',
          input: JSON.stringify({ topic, keywords }),
          output: result.data,
          status: result.success ? 'success' : 'error',
          errorMessage: result.error,
          metadata: result.usage
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate article
router.post('/generate-article', auth, async (req, res) => {
  try {
    const { brief, sources, style, articleId } = req.body;

    const result = await aiService.writingAgent(brief, sources, style);

    if (articleId) {
      await prisma.agentLog.create({
        data: {
          articleId,
          agentType: 'WRITING',
          input: JSON.stringify({ brief, style }),
          output: result.data,
          status: result.success ? 'success' : 'error',
          errorMessage: result.error,
          metadata: result.usage
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fact check
router.post('/fact-check', auth, async (req, res) => {
  try {
    const { claim, context, articleId } = req.body;

    const result = await aiService.factCheckAgent(claim, context);

    if (articleId && result.success) {
      const factCheckData = JSON.parse(result.data);
      
      await prisma.factCheck.create({
        data: {
          articleId,
          claim,
          verdict: factCheckData.verdict,
          explanation: factCheckData.explanation,
          confidence: factCheckData.confidence,
          sources: factCheckData.sources || []
        }
      });

      await prisma.agentLog.create({
        data: {
          articleId,
          agentType: 'FACT_CHECKING',
          input: JSON.stringify({ claim, context }),
          output: result.data,
          status: 'success',
          metadata: result.usage
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Editorial review
router.post('/editorial-review', auth, async (req, res) => {
  try {
    const { content, guidelines, articleId } = req.body;

    const result = await aiService.editorialAgent(content, guidelines);

    if (articleId) {
      await prisma.agentLog.create({
        data: {
          articleId,
          agentType: 'EDITORIAL',
          input: JSON.stringify({ contentLength: content.length, guidelines }),
          output: result.data,
          status: result.success ? 'success' : 'error',
          errorMessage: result.error,
          metadata: result.usage
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate image (using Unsplash)
router.post('/generate-image', auth, async (req, res) => {
  try {
    const { description, style } = req.body;

    const result = await aiService.generateImage(description, style);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search images (Unsplash)
router.post('/search-images', auth, async (req, res) => {
  try {
    const { query, count = 5 } = req.body;

    const result = await aiService.searchImages(query, count);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate image with DALL-E (alternative)
router.post('/generate-image-dalle', auth, async (req, res) => {
  try {
    const { description, style } = req.body;

    const result = await aiService.generateImageWithDallE(description, style);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate caption
router.post('/generate-caption', auth, async (req, res) => {
  try {
    const { imageDescription, articleContext } = req.body;

    const result = await aiService.generateCaption(imageDescription, articleContext);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assess source credibility
router.post('/assess-source', auth, async (req, res) => {
  try {
    const { sourceUrl, sourceContent } = req.body;

    const result = await aiService.assessSourceCredibility(sourceUrl, sourceContent);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
