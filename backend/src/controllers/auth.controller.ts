import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getAdminAuthConfig } from '../config/admin-auth';

function matchesCredential(value: unknown, expected: string, secret: string): boolean {
  if (typeof value !== 'string') return false;
  const candidateDigest = createHmac('sha256', secret).update(value).digest();
  const expectedDigest = createHmac('sha256', secret).update(expected).digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}

export class AuthController {
  login(req: Request, res: Response): void {
    const config = getAdminAuthConfig();
    if (!config) {
      res.status(503).json({ success: false, message: 'Admin authentication is not configured on the server.' });
      return;
    }

    const usernameMatches = matchesCredential(req.body?.username, config.username, config.jwtSecret);
    const passwordMatches = matchesCredential(req.body?.password, config.password, config.jwtSecret);
    if (!usernameMatches || !passwordMatches) {
      res.status(401).json({ success: false, message: 'Incorrect username or password.' });
      return;
    }

    const token = jwt.sign({ role: 'admin' }, config.jwtSecret, {
      subject: config.username,
      issuer: 'gupio-api',
      audience: 'gupio-admin',
      expiresIn: '8h',
    });

    res.status(200).json({
      success: true,
      data: { token, username: config.username, expiresIn: 8 * 60 * 60 },
    });
  }

  session(_req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      data: { authenticated: true, username: res.locals.adminUsername },
    });
  }
}