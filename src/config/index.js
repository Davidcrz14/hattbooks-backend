import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hattbooks',
  },

  // Auth0
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
    issuer: process.env.AUTH0_ISSUER,
  },

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // External APIs
  externalAPIs: {
    openLibrary: process.env.OPEN_LIBRARY_API_URL || 'https://openlibrary.org',
    googleBooks: process.env.GOOGLE_BOOKS_API_KEY,
  },
};
