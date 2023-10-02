import 'dotenv/config'
import { fastifyMultipart } from '@fastify/multipart'
import { FastifyInstance } from 'fastify'
import path from 'node:path'
import { uploadFileS3 } from '../lib/s3'
import { prisma } from './../lib/prisma'

export async function uploadVideo(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25mb
    },
  })

  app.post('/video', async (request, reply) => {
    try {
      const data = await request.file()

      if (!data) {
        return reply.status(400).send({ error: 'Missing file input' })
      }

      const extension = path.extname(data.filename)

      if (extension !== '.mp3') {
        return reply.status(400).send({ error: 'Invalid file extension, please upload an MP3' })
      }

      const fileBaseName = path.basename(data.filename, extension)
      const fileUploadName = `${fileBaseName}-${Date.now()}${extension}`

      // Faça o upload do fluxo de dados diretamente para o Amazon S3 usando a função uploadFileS3
      const s3upload = await uploadFileS3(data.file, fileUploadName)

      const video = await prisma.video.create({
        data: {
          name: data.filename,
          path: s3upload.Location,
          key: s3upload.key,
        },
      })

      return reply.status(201).send({
        video,
      })
    } catch (error) {
      console.error('Erro ao fazer o upload para o S3:', error)
      return reply.status(500).send({ error: 'Internal Server Error' })
    }
  })
}
