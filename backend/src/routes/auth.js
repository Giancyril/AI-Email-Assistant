const express = require('express');
const jwt = require('jsonwebtoken');
const oauth2Client = require('../config/google');
const { google } = require('googleapis');
// Prisma or DB connection can be imported here once ready
// For now, let's write routes structure with placeholder database logic
const router = express.Router();

// GET /auth/google
router.get('/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});

// GET /auth/callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Auth code is missing' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user details
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const email = userInfo.data.email;
    const name = userInfo.data.name;
    const picture = userInfo.data.picture;

    // TODO: Store or upsert User in DB
    // TODO: Store OAuth tokens (access_token, refresh_token, expires_at)
    
    // Create JWT
    const token = jwt.sign(
      { email, name, picture },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Redirect to frontend dashboard with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login/callback?token=${token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /auth/me
router.get('/me', (req, res) => {
  // authMiddleware handles authentication, injects req.user
  res.json({ user: req.user });
});

module.exports = router;
