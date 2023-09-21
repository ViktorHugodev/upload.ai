import 'dotenv/config'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { createWriteStream, promises as fsPromises, createReadStream } from 'node:fs'
import { openai } from '../lib/openai'
import path from 'node:path'
import { downloadMP3FromS3, localFilePath } from '../lib/s3'
import { Readable, pipeline } from 'stream'
import { promisify } from 'node:util'
import * as fs from 'fs'

const pipelineAsync = promisify(pipeline)
export async function createVideoTranscription(app: FastifyInstance) {
  app.post('/video/:videoId/transcription', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    reply.header('Access-Control-Allow-Headers', '*')
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    })
    const bodySchema = z.object({
      prompt: z.string(),
    })

    const { videoId } = paramsSchema.parse(req.params)
    const { prompt } = bodySchema.parse(req.body)
    console.log('🚀 ~ file: create-transcription.ts:25 ~ app.post ~ prompt-videoId:', {
      prompt,
      videoId,
    })

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })
    console.log('🚀 ~ file: create-transcription.ts:32 ~ app.post ~ video:', video)

    const s3ObjectKey = video.key as string

    await downloadMP3FromS3(s3ObjectKey)

    // Transmitir o arquivo MP3 recém-baixado como resposta
    const mp3Buffer = fs.readFileSync(localFilePath)
    const readableStream = Readable.from(mp3Buffer)

    await pipelineAsync(readableStream, reply.raw)

    const tempDirectory = path.join(__dirname, '../../tmp')
    const fileName = 'temp.mp3'

    const audioReadStream = createReadStream(localFilePath)

    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      temperature: 0,
      response_format: 'json',
      prompt,
    })

    const transcription = response.text

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription,
      },
    })
    return { transcription, videoId, prompt }
  })
}
