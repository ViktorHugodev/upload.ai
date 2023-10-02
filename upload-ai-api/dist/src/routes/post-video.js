"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = void 0;
require("dotenv/config");
const multipart_1 = require("@fastify/multipart");
const node_path_1 = __importDefault(require("node:path"));
const s3_1 = require("../lib/s3");
const prisma_1 = require("./../lib/prisma");
async function uploadVideo(app) {
    app.register(multipart_1.fastifyMultipart, {
        limits: {
            fileSize: 1048576 * 25, // 25mb
        },
    });
    app.post('/video', async (request, reply) => {
        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'Missing file input' });
            }
            const extension = node_path_1.default.extname(data.filename);
            if (extension !== '.mp3') {
                return reply.status(400).send({ error: 'Invalid file extension, please upload an MP3' });
            }
            const fileBaseName = node_path_1.default.basename(data.filename, extension);
            const fileUploadName = `${fileBaseName}-${Date.now()}${extension}`;
            // Faça o upload do fluxo de dados diretamente para o Amazon S3 usando a função uploadFileS3
            const s3upload = await (0, s3_1.uploadFileS3)(data.file, fileUploadName);
            const video = await prisma_1.prisma.video.create({
                data: {
                    name: data.filename,
                    path: s3upload.Location,
                    key: s3upload.Key,
                },
            });
            return reply.status(201).send({
                video,
            });
        }
        catch (error) {
            console.error('Erro ao fazer o upload para o S3:', error);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
exports.uploadVideo = uploadVideo;
