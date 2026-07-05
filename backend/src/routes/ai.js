const express = require('express');
const authMiddleware = require('../middleware/auth');
const { summarizeThread, generateDrafts, suggestFollowups, classifyThread } = require('../services/geminiService');
const router = express.Router();

// POST /api/ai/summarize
router.post('/summarize', authMiddleware, async (req, res) => {
  try {
    const { threadContent } = req.body;
    if (!threadContent) {
      return res.status(400).json({ error: 'Thread content is required' });
    }

    const summary = await summarizeThread(threadContent);
    res.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// POST /api/ai/draft
router.post('/draft', authMiddleware, async (req, res) => {
  try {
    const { threadContent, tone } = req.body;
    if (!threadContent) {
      return res.status(400).json({ error: 'Thread content is required' });
    }

    const drafts = await generateDrafts(threadContent, tone);
    res.json({ drafts });
  } catch (error) {
    console.error('Draft generation error:', error);
    res.status(500).json({ error: 'Failed to generate drafts' });
  }
});

// POST /api/ai/followup
router.post('/followup', authMiddleware, async (req, res) => {
  try {
    const { threadContent } = req.body;
    if (!threadContent) {
      return res.status(400).json({ error: 'Thread content is required' });
    }

    const followups = await suggestFollowups(threadContent);
    res.json({ followups });
  } catch (error) {
    console.error('Followups error:', error);
    res.status(500).json({ error: 'Failed to suggest followups' });
  }
});

// POST /api/ai/classify
router.post('/classify', authMiddleware, async (req, res) => {
  try {
    const { threadContent } = req.body;
    if (!threadContent) {
      return res.status(400).json({ error: 'Thread content is required' });
    }

    const classification = await classifyThread(threadContent);
    res.json(classification);
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: 'Failed to classify thread' });
  }
});

module.exports = router;
