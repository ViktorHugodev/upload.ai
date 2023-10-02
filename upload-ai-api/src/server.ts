import { fastify } from 'fastify'

import { getAllPrompt } from './routes/get-all-prompts'
import { uploadVideo } from './routes/post-video'
import { createVideoTranscription } from './routes/create-transcription'

import fastifyCors from '@fastify/cors'
import { createPrompt } from './routes/create-prompt'
import { generateAiCompilationRoute } from './routes/generate-ai-compilation'

const app = fastify()

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

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('Listening on port 3333!'))
