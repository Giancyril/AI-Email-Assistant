const express = require('express');
const authMiddleware = require('../middleware/auth');
const { listThreads, getThread, sendReply } = require('../services/gmailService');
const router = express.Router();

const prisma = require('../config/db');
const { google } = require('googleapis');

async function getValidTokens(userId) {
  const tokenRecord = await prisma.oAuthToken.findFirst({
    where: { userId }
  });

  if (!tokenRecord) {
    throw new Error('OAuth credentials not found. Please log in again.');
  }

  let accessToken = tokenRecord.accessToken;

  // Check if token has expired or is close to expiring (within 1 minute)
  if (tokenRecord.expiresAt.getTime() - 60000 < Date.now() && tokenRecord.refreshToken) {
    try {
      const oauth2 = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2.setCredentials({
        refresh_token: tokenRecord.refreshToken
      });

      const { credentials } = await oauth2.refreshAccessToken();
      const expiresAt = credentials.expiry_date 
        ? new Date(credentials.expiry_date) 
        : new Date(Date.now() + 3600 * 1000);

      await prisma.oAuthToken.update({
        where: { id: tokenRecord.id },
        data: {
          accessToken: credentials.access_token,
          expiresAt
        }
      });

      accessToken = credentials.access_token;
    } catch (refreshErr) {
      console.error('Failed to auto-refresh access token:', refreshErr);
    }
  }

  return { accessToken, refreshToken: tokenRecord.refreshToken };
}

// GET /api/emails
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { accessToken, refreshToken } = await getValidTokens(req.user.id);
    const { maxResults, pageToken, q } = req.query;
    const listResponse = await listThreads(accessToken, refreshToken, { maxResults: maxResults || 15, pageToken, q });
    
    if (!listResponse.threads || listResponse.threads.length === 0) {
      return res.json({ threads: [], nextPageToken: null });
    }

    // Fetch details for each thread in parallel
    const richThreads = await Promise.all(
      listResponse.threads.map(async (t) => {
        try {
          const threadDetails = await getThread(accessToken, refreshToken, t.id);
          const messages = threadDetails.messages || [];
          if (messages.length === 0) return null;
          
          const firstMessage = messages[0];
          const headers = firstMessage.payload.headers || [];
          
          const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
          const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
          const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
          
          let formattedDate = 'Recent';
          if (dateHeader) {
            try {
              const d = new Date(dateHeader.value);
              const isToday = d.toDateString() === new Date().toDateString();
              formattedDate = isToday 
                ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } catch (dateErr) {
              formattedDate = dateHeader.value;
            }
          }

          // Check if thread contains unread messages
          const isRead = !messages.some(m => m.labelIds && m.labelIds.includes('UNREAD'));
          
          return {
            id: t.id,
            subject: subjectHeader ? subjectHeader.value : 'No Subject',
            from: fromHeader ? fromHeader.value : 'Unknown Sender',
            snippet: t.snippet || firstMessage.snippet || '',
            date: formattedDate,
            isRead: isRead,
            urgency: 'Medium', // default, can be classified on demand
            intent: 'Request'
          };
        } catch (err) {
          console.error(`Error fetching rich details for thread ${t.id}:`, err);
          return null;
        }
      })
    );

    res.json({
      threads: richThreads.filter(Boolean),
      nextPageToken: listResponse.nextPageToken
    });
  } catch (error) {
    console.error('List emails error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch emails' });
  }
});

function parseMessageParts(part, result = { html: '', text: '' }) {
  if (part.mimeType === 'text/plain' && part.body && part.body.data) {
    result.text += Buffer.from(part.body.data, 'base64').toString('utf-8');
  } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
    result.html += Buffer.from(part.body.data, 'base64').toString('utf-8');
  }

  if (part.parts) {
    for (const subPart of part.parts) {
      parseMessageParts(subPart, result);
    }
  }

  return result;
}

function parseMessage(message) {
  const payload = message.payload;
  if (!payload) return { text: '', html: '' };

  const result = { html: '', text: '' };

  if (payload.body && payload.body.data) {
    const content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    if (payload.mimeType === 'text/html') {
      result.html = content;
    } else {
      result.text = content;
    }
  }

  if (payload.parts) {
    parseMessageParts(payload, result);
  }

  // If we only got HTML, create plain text by stripping HTML tags
  if (!result.text && result.html) {
    result.text = result.html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove CSS blocks
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove JS blocks
      .replace(/<[^>]*>/g, ' ') // Strip HTML tags
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }

  // If we only got text, create HTML by wrapping it in styled container
  if (!result.html && result.text) {
    result.html = `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #333; white-space: pre-wrap;">${result.text}</div>`;
  }

  return result;
}

// GET /api/emails/:threadId
router.get('/:threadId', authMiddleware, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { accessToken, refreshToken } = await getValidTokens(req.user.id);
    const thread = await getThread(accessToken, refreshToken, threadId);
    
    if (!thread || !thread.messages || thread.messages.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const firstMessage = thread.messages[0];
    const headers = firstMessage.payload.headers || [];
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';

    const parsedMessages = thread.messages.map(m => {
      const mHeaders = m.payload.headers || [];
      const mFrom = mHeaders.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';
      const mDate = mHeaders.find(h => h.name.toLowerCase() === 'date')?.value || '';
      
      let timeStr = mDate;
      try {
        if (mDate) {
          const d = new Date(mDate);
          timeStr = d.toLocaleString();
        }
      } catch {}

      const parsed = parseMessage(m);

      return {
        id: m.id,
        sender: mFrom,
        time: timeStr,
        content: parsed.text,
        htmlContent: parsed.html
      };
    });

    res.json({
      id: thread.id,
      subject,
      from,
      messages: parsedMessages
    });
  } catch (error) {
    console.error('Get email thread error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch thread' });
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

    const { accessToken, refreshToken } = await getValidTokens(req.user.id);
    const result = await sendReply(accessToken, refreshToken, threadId, body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ error: error.message || 'Failed to send reply' });
  }
});

module.exports = router;
