const { google } = require('googleapis');
const oauth2Client = require('../config/google');

function getGmailClient(accessToken, refreshToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  return google.gmail({ version: 'v1', auth });
}

/**
 * List email threads.
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {object} options - maxResults, pageToken, q
 */
async function listThreads(accessToken, refreshToken, options = {}) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.threads.list({
    userId: 'me',
    maxResults: options.maxResults || 20,
    pageToken: options.pageToken,
    q: options.q
  });
  return res.data;
}

/**
 * Get full thread messages and details.
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {string} threadId
 */
async function getThread(accessToken, refreshToken, threadId) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.threads.get({
    userId: 'me',
    id: threadId
  });
  return res.data;
}

/**
 * Send a reply to an email thread.
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {string} threadId
 * @param {string} body - Plain text body
 */
async function sendReply(accessToken, refreshToken, threadId, body) {
  const gmail = getGmailClient(accessToken, refreshToken);
  const thread = await getThread(accessToken, refreshToken, threadId);
  if (!thread || !thread.messages || thread.messages.length === 0) {
    throw new Error('Thread not found or empty.');
  }

  const lastMessage = thread.messages[thread.messages.length - 1];
  const headers = lastMessage.payload.headers;

  const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
  const messageIdHeader = headers.find(h => h.name.toLowerCase() === 'message-id');
  const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');

  let subject = subjectHeader ? subjectHeader.value : '';
  if (subject && !subject.toLowerCase().startsWith('re:')) {
    subject = `Re: ${subject}`;
  }

  const to = fromHeader ? fromHeader.value : '';
  const replyToId = messageIdHeader ? messageIdHeader.value : '';

  // Construct MIME message
  const rawMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${replyToId}`,
    `References: ${replyToId}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body
  ].join('\r\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
      threadId: threadId
    }
  });

  return res.data;
}

module.exports = {
  listThreads,
  getThread,
  sendReply
};
