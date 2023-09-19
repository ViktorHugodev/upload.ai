import { fastify } from 'fastify'
import { getAllPrompt } from './routes/get-all-prompts'
import { uploadVideo } from './routes/post-video'
import { createVideoTranscription } from './routes/create-transcription'
import { generateAiCompilationRoute } from './routes/generate-ai-compilation'
import fastifyCors from '@fastify/cors'
import { getMp3S3 } from './lib/s3'

const app = fastify()
app.register(fastifyCors, {
  origin: '*',
})
app.register(getAllPrompt)
app.register(uploadVideo)
app.register(createVideoTranscription)
app.register(generateAiCompilationRoute)
app.get('/test', async (req, reply) => {
  try {
    const s3ObjectKey = 'HeJ-obrigado-1695058524145.mp3' // Coloque sua chave S3 aqui

    // Use a função getMp3S3 para obter o objeto S3
    const s3Object = await getMp3S3(s3ObjectKey)

    // Configure o cabeçalho Content-Type para "audio/mpeg"
    reply.type('audio/mpeg')

    // Envie o conteúdo do objeto S3 como resposta
    reply.send(s3Object.Body)
  } catch (error) {
    console.error('Erro ao buscar e enviar o arquivo da S3:', error)
    reply.status(500).send({ error: 'Internal Server Error' })
  }
})

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('Listening on port 3333!'))
