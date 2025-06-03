const { ChatTokenBuilder } = require("agora-token");
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // For environment variables

const app = express();
const PORT = process.env.PORT || 5500;

// App credentials - should be in environment variables
const APP_ID = process.env.APP_ID || "aacbfe2f1fe741cfb54fcf66e8b43420";
const APP_CERTIFICATE = process.env.APP_CERTIFICATE || "79b3b2e5cf9b4ab48fbdfc42a8659ed0";

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.disable('x-powered-by');

// Constants
const DEFAULT_TOKEN_EXPIRATION = 86400; // 1 hour
const MAX_TOKEN_EXPIRATION = 86400; // 24 hours

/**
 * Generate RTC Token
 */
const generateRtcToken = (req, res) => {
  const channelName = req.query.channelName;
  const uid = req.query.uid || 0;
  const expirationTime = parseInt(req.query.expirationTime) || DEFAULT_TOKEN_EXPIRATION;

  // Validate inputs
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  if (!APP_ID || !APP_CERTIFICATE) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    res.json({
      status: "success",
      token,
      appId: APP_ID,
      channel: channelName,
      uid,
      expiresAt: privilegeExpiredTs
    });
  } catch (error) {
    console.error("Token generation failed:", error);
    res.status(500).json({ error: "Token generation failed" });
  }
};

/**
 * Generate User Token for Chat
 */
const generateUserToken = (req, res) => {
  const account = req.query.account;
  let expireTime = parseInt(req.query.expireTimeInSeconds) || DEFAULT_TOKEN_EXPIRATION;

  // Validate inputs
  if (!account) {
    return res.status(400).json({ error: "Account parameter is required" });
  }

  // Cap the expiration time
  expireTime = Math.min(expireTime, MAX_TOKEN_EXPIRATION);

  try {
    const token = ChatTokenBuilder.buildUserToken(APP_ID, APP_CERTIFICATE, account, expireTime);
    res.json({ 
      status: "success", 
      token,
      expiresIn: expireTime
    });
  } catch (error) {
    console.error("User token generation failed:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate App Token for Chat
 */
const generateAppToken = (req, res) => {
  let expireTime = parseInt(req.query.expireTimeInSeconds) || DEFAULT_TOKEN_EXPIRATION;

  // Cap the expiration time
  expireTime = Math.min(expireTime, MAX_TOKEN_EXPIRATION);

  try {
    const token = ChatTokenBuilder.buildAppToken(APP_ID, APP_CERTIFICATE, expireTime);
    res.json({ 
      status: "success", 
      token,
      expiresIn: expireTime
    });
  } catch (error) {
    console.error("App token generation failed:", error);
    res.status(500).json({ error: error.message });
  }
};

// Routes
app.get('/rtcToken', generateRtcToken);
app.get('/api/token/generateChannelToken', generateRtcToken); // Alias for backwards compatibility
app.get('/api/token/generateUserToken', generateUserToken);
app.get('/api/token/generateAppToken', generateAppToken);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Agora Token Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});