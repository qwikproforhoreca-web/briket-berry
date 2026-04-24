import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  admin?: { id: string; email: string; role: string }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is not configured or too short')
  }
  return secret
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Необходима авторизация' } })
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as any
    req.admin = { id: payload.id, email: payload.email, role: payload.role }
    next()
  } catch {
    res.clearCookie('admin_token')
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Токен недействителен' } })
  }
}
