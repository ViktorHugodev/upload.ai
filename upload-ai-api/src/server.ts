import { fastify } from 'fastify'

import { getAllPrompt } from './routes/get-all-prompts'
import { uploadVideo } from './routes/post-video'
import { createVideoTranscription } from './routes/create-transcription'

import fastifyCors from '@fastify/cors'
import { createPrompt } from './routes/create-prompt'
import { generateAiCompilationRoute } from './routes/generate-ai-compilation'

const app = fastify({})

app.register(fastifyCors, {
  origin: '*',
  methods: 'GET,PUT,POST,DELETE,OPTIONS',
  allowedHeaders: '*',
})
app.get('/', (req, reply) => {
  reply.send({ success: true })
})

app.get('/test', (req, reply) => {
  return reply.send({
    message: 'Hello world',
  })
})
app.register(getAllPrompt)
app.register(uploadVideo)
app.register(createVideoTranscription)
app.register(generateAiCompilationRoute)
app.register(createPrompt)
const port = Number(process.env.PORT) || 3006
app
  .listen({
    host: '0.0.0.0',
    port: port,
  })
  .then(() => console.log('Listening on port !', port))
