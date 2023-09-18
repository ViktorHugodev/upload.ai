import 'dotenv/config'
import { S3 } from 'aws-sdk'

const bucketName = process.env.AWS_BUCKET_NAME as string
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

export const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
})

export async function uploadFileS3(file: string, key: string) {
  const uploadParams = {
    Bucket: bucketName,
    Body: file,
    Key: key,
    // ACL: 'public-read',
  }
  return await s3.upload(uploadParams).promise()
}
