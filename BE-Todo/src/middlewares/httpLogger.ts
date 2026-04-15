import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * HTTP Request Logger Middleware
 * Log mọi request đến server: method, url, status, response time, IP
 */
export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    logger.http(`${method} ${originalUrl} ${statusCode} ${duration}ms`, {
      method,
      url: originalUrl,
      status: statusCode,
      duration_ms: duration,
      ip,
    });
  });

  next();
}
