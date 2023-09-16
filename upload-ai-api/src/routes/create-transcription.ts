import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { createReadStream } from 'node:fs'
import { openai } from '../lib/openai'
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

    const videoPath = video.path
    const audioReadStream = createReadStream(videoPath)

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
    return { transcription }
  })
}
