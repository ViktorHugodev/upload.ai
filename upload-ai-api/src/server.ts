import { fastify } from 'fastify'

import { getAllPrompt } from './routes/get-all-prompts'
import { uploadVideo } from './routes/post-video'
import { createVideoTranscription } from './routes/create-transcription'
import { generateAiCompilationRoute } from './routes/generate-ai-compilation'
import fastifyCors from '@fastify/cors'

const app = fastify()

app.register(fastifyCors, {
  origin: '*',
  methods: 'GET,PUT,POST,DELETE,OPTIONS',
  allowedHeaders: '*',
})
app.get('/test-cors', async (req, reply) => {
  reply.send({ message: 'CORS should work' })
})
app.register(getAllPrompt)
app.register(uploadVideo)
app.register(createVideoTranscription)
app.register(generateAiCompilationRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('Listening on port 3333!'))
