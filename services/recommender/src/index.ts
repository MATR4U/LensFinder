import express from 'express'
import type { RecommendationRequest } from '@lensfinder/domain'
import { getRecommendations } from './scoring.js'

const app = express()
app.use(express.json())

app.post('/recommendations', async (req, res) => {
  const body = req.body as RecommendationRequest
  if (!body || !body.lensMount || !body.budget || !Array.isArray(body.useCases) || !body.priorities) {
    res.status(400).json({ error: 'invalid request' })
    return
  }
  try {
    const items = await getRecommendations(body)
    res.json(items)
  } catch (e) {
    res.status(500).json({ error: 'failed to compute recommendations' })
  }
})

export function createServer() {
  return app
}
