import 'dotenv/config'
import fs from 'node:fs'
import { S3 } from 'aws-sdk'
import path from 'node:path'

const bucketName = process.env.AWS_BUCKET_NAME as string
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

export const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
})

export async function uploadFileS3(binaryData: Buffer, key: string) {
  const uploadParams = {
    Bucket: bucketName,
    Body: binaryData,
    Key: key,
    ACL: 'public-read',
    ContentType: 'audio/mpeg',
  }
  return await s3.upload(uploadParams).promise()
}

const tempDirectory = path.join(__dirname, '../../tmp')
const fileName = 'temp.mp3'
export const localFilePath = path.join(tempDirectory, fileName)
export async function getMp3S3(key: string) {
  try {
    const downloadParams = {
      Bucket: bucketName,
      Key: key,
    }
    console.log('🚀 ~ file: s3.ts:32 ~ getMp3S3 ~ downloadParams.key:', downloadParams.Key)
    const result = await s3.getObject(downloadParams).createReadStream()
    console.log('🚀 ~ file: s3.ts:33 ~ getMp3S3 ~ result:', result)

    return result
  } catch (error) {
    console.error('Erro ao fazer o download do arquivo da S3:', error)
    throw error
  }
}
export async function downloadMP3FromS3(objectKey: string): Promise<void> {
  const params = {
    Bucket: bucketName, // Substitua pelo nome do seu bucket S3
    Key: objectKey,
  }

  try {
    const s3Object = await s3.getObject(params).promise()
    const mp3Data = s3Object.Body as Buffer

    // Salvar o arquivo MP3 localmente
    fs.writeFileSync(localFilePath, mp3Data)

    console.log(`Arquivo MP3 baixado e salvo em: ${localFilePath}`)
  } catch (error) {
    console.error(`Erro ao baixar o arquivo MP3: ${error}`)
    throw error
  }
}
