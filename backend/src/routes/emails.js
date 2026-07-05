const express = require('express');
const authMiddleware = require('../middleware/auth');
const { listThreads, getThread, sendReply } = require('../services/gmailService');
const router = express.Router();

// GET /api/emails
router.get('/', authMiddleware, async (req, res) => {
  try {
    // TODO: Fetch user's tokens from database
    const accessToken = req.user.accessToken; // placeholder
    const refreshToken = req.user.refreshToken; // placeholder

    const { maxResults, pageToken, q } = req.query;
    const threads = await listThreads(accessToken, refreshToken, { maxResults, pageToken, q });
    res.json(threads);
  } catch (error) {
    console.error('List emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// GET /api/emails/:threadId
router.get('/:threadId', authMiddleware, async (req, res) => {
  try {
    const { threadId } = req.params;
    // TODO: Fetch user's tokens from database
    const accessToken = req.user.accessToken;
    const refreshToken = req.user.refreshToken;

    const thread = await getThread(accessToken, refreshToken, threadId);
    res.json(thread);
  } catch (error) {
    console.error('Get email thread error:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// POST /api/emails/:threadId/send
router.post('/:threadId/send', authMiddleware, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ error: 'Reply body is required' });
    }

    // TODO: Fetch user's tokens from database
    const accessToken = req.user.accessToken;
    const refreshToken = req.user.refreshToken;

    const result = await sendReply(accessToken, refreshToken, threadId, body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

module.exports = router;
