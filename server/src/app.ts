import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { supabaseConfigured } from './config/supabase.js'
import { errorHandler, notFound } from './middleware/error.middleware.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { providerRoutes } from './modules/providers/provider.routes.js'
import { adminRoutes } from './modules/admin/admin.routes.js'

export const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: [env.WEB_ORIGIN, 'http://localhost', 'https://localhost', 'capacitor://localhost'] }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: supabaseConfigured ? 'configured' : 'unavailable' })
})

app.use('/api/auth', authRoutes)
app.use('/api/providers', providerRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)
