import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.error('Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('\nOpening browser for Google authorization...');
console.log('If it does not open automatically, visit:\n');
console.log(authUrl, '\n');

// Try to open the browser automatically
const { default: open } = await import('open').catch(() => ({ default: null }));
if (open) await open(authUrl);

// Spin up a temporary server to catch the OAuth callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('Missing code parameter.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h2>Authorization complete — you can close this tab.</h2>');

    console.log('\n✓ Success! Add this to your .env:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

    if (!tokens.refresh_token) {
      console.log('Note: no refresh_token returned. This usually means the account already');
      console.log('authorized this app. Go to https://myaccount.google.com/permissions,');
      console.log('revoke access for Ringa, then re-run this script.\n');
    }
  } catch (err) {
    console.error('Failed to exchange code for tokens:', err.message);
    res.writeHead(500);
    res.end('Authorization failed. Check the terminal.');
  } finally {
    server.close();
  }
});

server.listen(3000, () => {
  console.log('Waiting for Google to redirect back to http://localhost:3000/oauth/callback ...\n');
});
