import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function createPrompt(app: FastifyInstance) {
  app.post('/create-prompt', async (req, reply) => {
    console.log('🚀 ~ file: generate-ai-compilation.ts:8 ~ app.post ~ req:', req.body)
    const bodySchema = z.object({
      title: z.string(),
      string: z.string(),
    })

    const { title, string } = bodySchema.parse(req.body)
    const template = `${string}

    Transcrição:
    '''
    {transcription}
    '''`.trim()

    const res = await prisma.prompt.create({
      data: {
        title,
        template,
      },
    })

    return reply.status(201).send({
      res,
    })
  })
}
