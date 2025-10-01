import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  const mongoose = await import('mongoose');

  const dbState = mongoose.default.connection.readyState;
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbStatus = dbStateMap[dbState] || 'unknown';
  const isDbHealthy = dbState === 1;

  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();

  const memoryInfo = {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
  };

  const overallStatus = isDbHealthy ? 'healthy' : 'degraded';

  let dbHost = null;
  if (isDbHealthy) {
    dbHost = mongoose.default.connection.host;
  }

  const healthData = {
    success: true,
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      formatted: formatUptime(uptimeSeconds),
    },
    checks: {
      database: {
        status: dbStatus,
        healthy: isDbHealthy,
        ...(dbHost && { host: dbHost }),
      },
      server: {
        status: 'running',
        healthy: true,
        nodeVersion: process.version,
        platform: process.platform,
      },
    },
    resources: {
      memory: memoryInfo,
      pid: process.pid,
    },
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  res.status(statusCode).json(healthData);
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

router.use('/auth', authRoutes);

export default router;
