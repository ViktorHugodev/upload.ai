"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadMP3FromS3 = exports.localFilePath = exports.uploadFileS3 = exports.s3 = void 0;
const aws_sdk_1 = require("aws-sdk");
require("dotenv/config");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
exports.s3 = new aws_sdk_1.S3({
    region,
    accessKeyId,
    secretAccessKey,
});
async function uploadFileS3(binaryData, key) {
    const uploadParams = {
        Bucket: bucketName,
        Body: binaryData,
        Key: key,
        ACL: 'public-read',
        ContentType: 'audio/mpeg',
    };
    return await exports.s3.upload(uploadParams).promise();
}
exports.uploadFileS3 = uploadFileS3;
const tempDirectory = node_path_1.default.join(__dirname, '../../tmp');
const fileName = 'temp.mp3';
exports.localFilePath = node_path_1.default.join(tempDirectory, fileName);
async function downloadMP3FromS3(objectKey) {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
    };
    try {
        const s3Object = await exports.s3.getObject(params).promise();
        const mp3Data = s3Object.Body;
        // Salvar o arquivo MP3 localmente
        node_fs_1.default.writeFileSync(exports.localFilePath, mp3Data);
        console.log('música baixada', { localFilePath: exports.localFilePath });
    }
    catch (error) {
        console.error(`Erro ao baixar o arquivo MP3: ${error}`);
        throw error;
    }
}
exports.downloadMP3FromS3 = downloadMP3FromS3;
