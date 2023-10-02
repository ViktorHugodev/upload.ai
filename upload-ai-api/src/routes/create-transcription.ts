import 'dotenv/config'
import { FastifyInstance } from 'fastify'
import * as fs from 'fs'
import { createReadStream } from 'node:fs'
import { promisify } from 'node:util'
import { Readable, pipeline } from 'stream'
import { z } from 'zod'
import { openai } from '../lib/openai'
import { prisma } from '../lib/prisma'
import { downloadMP3FromS3, localFilePath } from '../lib/s3'

const pipelineAsync = promisify(pipeline)
export async function createVideoTranscription(app: FastifyInstance) {
  app.post(
    '/video/:videoId/transcription',

    async (req, reply) => {
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

      const s3ObjectKey = video.key as string

      await downloadMP3FromS3(s3ObjectKey)

      const mp3Buffer = fs.readFileSync(localFilePath)
      const readableStream = Readable.from(mp3Buffer)

      // await pipelineAsync(readableStream, reply.raw)

      const audioReadStream = createReadStream(localFilePath)
      console.log('Iniciando chamada à API da OpenAI...')
      try {
        const response = await openai.audio.transcriptions.create({
          file: audioReadStream,
          model: 'whisper-1',
          language: 'pt',
          temperature: 0,
          response_format: 'json',
          prompt,
        })
        const transcription = response.text

        const statusUpdate = await prisma.video.update({
          where: {
            id: videoId,
          },
          data: {
            transcription,
          },
        })

        return { transcription, videoId, prompt }
      } catch (error) {
        console.log('Erro ao chamar a API da OpenAI:', error)
        return reply.status(500).send({ error: error })
      }
    },
  )
}
