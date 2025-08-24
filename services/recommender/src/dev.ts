import { createServer } from './index.js'

const app = createServer()
const port = process.env.RECOMMENDER_PORT ? Number(process.env.RECOMMENDER_PORT) : 3100
app.listen(port, () => {
})
