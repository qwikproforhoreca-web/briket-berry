import { Response } from 'express'

export function successResponse<T>(res: Response, data: T, status = 200, meta?: object) {
  return res.status(status).json({ success: true, data, ...(meta && { meta }) })
}

export function errorResponse(res: Response, status: number, code: string, message: string, details?: object[]) {
  return res.status(status).json({
    success: false,
    error: { code, message, ...(details && { details }) },
  })
}
