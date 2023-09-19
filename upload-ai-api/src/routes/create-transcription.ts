import 'dotenv/config'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { createWriteStream, promises as fsPromises } from 'node:fs'
import { openai } from '../lib/openai'
import path from 'node:path'
import { getMp3S3 } from '../lib/s3'
import { pipeline } from 'node:stream/promises'

export async function createVideoTranscription(app: FastifyInstance) {
  app.post('/video/:videoId/transcription', async (req, reply) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    })
    const bodySchema = z.object({
      prompt: z.string(),
    })

    const { videoId } = paramsSchema.parse(req.params)
    const { prompt } = bodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    const s3ObjectKey = video.key
    console.log('🚀 ~ file: create-transcription.ts:30 ~ app.post ~ s3ObjectKey:', s3ObjectKey)

    const tempDirectory = path.join(__dirname, '../../tmp')
    const fileName = 'temp.mp3'
    const localFilePath = path.join(tempDirectory, fileName)

    try {
      const s3Object = await getMp3S3(s3ObjectKey)

      // Crie um arquivo local e obtenha um fluxo de gravação para ele
      const writeStream = createWriteStream(localFilePath)

      // Use pipeline para copiar o conteúdo do objeto S3 para o arquivo local e aguarde a conclusão
      await pipeline(s3Object, writeStream)

      // Aguarde até que o arquivo seja totalmente gravado no sistema de arquivos local
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })

      // Agora você pode continuar o código após a conclusão da gravação
      const audioFileStream = fsPromises.createReadStream(localFilePath)

      // Continue o restante do código para criar a transcrição usando o fluxo de áudio local
      // ...

      // Certifique-se de fechar o fluxo após a conclusão
      audioFileStream.close()

      // Restante do código para criar a transcrição com OpenAI
      // ...

      // Após o processamento, você pode optar por excluir o arquivo local
      await fsPromises.unlink(localFilePath)
    } catch (error) {
      console.error('Erro ao fazer o download do arquivo da S3:', error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })
}
