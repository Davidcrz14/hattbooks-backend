import { apiReference } from '@scalar/express-api-reference';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database.js';
import { config } from './config/index.js';
import { openApiSpec } from './config/openapi.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';

const app = express();

connectDB();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);


app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api', generalLimiter);
app.use(
  '/api/docs',
  apiReference({
    theme: 'purple',
    layout: 'modern',
    spec: {
      content: openApiSpec,
    },
    defaultHttpClient: {
      targetKey: 'javascript',
      clientKey: 'fetch',
    },
  })
);

// OpenAPI specification endpoint (para herramientas externas)
app.get('/api/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HattBooks API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      openapi: '/api/openapi.json',
    },
  });
});

app.use('/api', routes);

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  if (config.env === 'development') {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   HattBooks API Server                     ║
║                                            ║
║   Port: ${PORT.toString().padEnd(36)} ║
║   Environment: ${config.env.padEnd(27)} ║
║   API Docs: http://localhost:${PORT}/api/docs  ║
║                                            ║
╚════════════════════════════════════════════╝
    `);
  } else {
    console.log(
      `HattBooks API Server running on port ${PORT} [${config.env}]`
    );
  }
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
