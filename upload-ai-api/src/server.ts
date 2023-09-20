import * as fs from 'fs'
import { fastify } from 'fastify'
import { getAllPrompt } from './routes/get-all-prompts'
import { uploadVideo } from './routes/post-video'
import { createVideoTranscription } from './routes/create-transcription'
import { generateAiCompilationRoute } from './routes/generate-ai-compilation'
import fastifyCors from '@fastify/cors'
import { downloadMP3FromS3, localFilePath, s3 } from './lib/s3'
import { Readable, pipeline } from 'stream'
import { promisify } from 'util'
const app = fastify()
app.register(fastifyCors, {
  origin: '*',
})
app.register(getAllPrompt)
app.register(uploadVideo)
app.register(createVideoTranscription)
app.register(generateAiCompilationRoute)

const pipelineAsync = promisify(pipeline)
app.get('/test', async (req, reply) => {
  try {
    const s3ObjectKey = 'audio-1695229169656.mp3' // Coloque sua chave S3 aqui

    // Use a função downloadMP3FromS3 para baixar o arquivo MP3
    await downloadMP3FromS3(s3ObjectKey)

    // Configurar o cabeçalho Content-Type para "audio/mpeg"
    reply.header('Content-Type', 'audio/mpeg')

    // Transmitir o arquivo MP3 recém-baixado como resposta
    const mp3Buffer = fs.readFileSync(localFilePath)
    const readableStream = Readable.from(mp3Buffer)
    await pipelineAsync(readableStream, reply.raw)

    // Excluir o arquivo local após a transmissão, se necessário
    // fs.unlinkSync(localFilePath)
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
