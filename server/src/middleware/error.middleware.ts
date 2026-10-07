import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({ error: { code: 'NOT_FOUND', message: `${request.method} ${request.path} was not found` } })
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.issues } })
    return
  }
  const message = error instanceof Error ? error.message : 'Unexpected server error'
  response.status(500).json({ error: { code: 'SERVER_ERROR', message: process.env.NODE_ENV === 'production' ? 'Unexpected server error' : message } })
}
