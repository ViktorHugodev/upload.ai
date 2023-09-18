import 'dotenv/config'
import { prisma } from './../lib/prisma'
import { FastifyInstance } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { s3, uploadFileS3 } from '../lib/s3'

const pump = promisify(pipeline)

export async function uploadVideo(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25mb
    },
  })
  app.post('/video', async (request, reply) => {
    const data = await request.file()
    console.log('🚀 ~ file: post-video.ts:21 ~ app.post ~ data:', data)

    if (!data) {
      return reply.status(400).send({ error: 'Missing file input' })
    }
    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return reply.status(400).send({ error: 'Invalid file extension, please  upload a MP3' })
    }

    const fileBaseName = path.basename(data.filename, extension)
    const fileUploadName = `${fileBaseName}-${Date.now()}${extension}`

    // const s3upload = await uploadFileS3()
    // console.log('🚀 ~ file: post-video.ts:39 ~ app.post ~ s3upload:', s3upload)
    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    const s3upload = await uploadFileS3(uploadDestination, fileUploadName)
    console.log('🚀 ~ file: post-video.ts:39 ~ app.post ~ s3upload:', s3upload)
    await pump(data.file, fs.createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    })

    return reply.status(201).send({
      video,
    })
  })
}
