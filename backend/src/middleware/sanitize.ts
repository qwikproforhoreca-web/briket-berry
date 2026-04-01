import { Request, Response, NextFunction } from 'express'
import sanitizeHtml from 'sanitize-html'

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim()
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }
  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val)
    }
    return sanitized
  }
  return value
}

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeValue(req.body)
  }
  next()
}
