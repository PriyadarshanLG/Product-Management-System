import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getAdminAuthConfig } from '../config/admin-auth';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const config = getAdminAuthConfig();
  if (!config) {
    res.status(503).json({ success: false, message: 'Admin authentication is not configured.' });
    return;
  }

  const authorization = req.header('Authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    res.status(401).json({ success: false, message: 'Admin sign-in is required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'gupio-api',
      audience: 'gupio-admin',
    });
    if (typeof payload === 'string' || payload.role !== 'admin' || payload.sub !== config.username) {
      res.status(401).json({ success: false, message: 'Admin session is invalid.' });
      return;
    }

    res.locals.adminUsername = payload.sub;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Admin session has expired. Please sign in again.' });
  }
}