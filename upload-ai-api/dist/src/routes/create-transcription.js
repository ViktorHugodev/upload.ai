"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoTranscription = void 0;
require("dotenv/config");
const fs = __importStar(require("fs"));
const node_fs_1 = require("node:fs");
const node_util_1 = require("node:util");
const stream_1 = require("stream");
const zod_1 = require("zod");
const openai_1 = require("../lib/openai");
const prisma_1 = require("../lib/prisma");
const s3_1 = require("../lib/s3");
const pipelineAsync = (0, node_util_1.promisify)(stream_1.pipeline);
async function createVideoTranscription(app) {
    app.post('/video/:videoId/transcription', async (req, reply) => {
        const paramsSchema = zod_1.z.object({
            videoId: zod_1.z.string().uuid(),
        });
        const bodySchema = zod_1.z.object({
            prompt: zod_1.z.string(),
        });
        const { videoId } = paramsSchema.parse(req.params);
        const { prompt } = bodySchema.parse(req.body);
        const video = await prisma_1.prisma.video.findUniqueOrThrow({
            where: {
                id: videoId,
            },
        });
        const s3ObjectKey = video.key;
        await (0, s3_1.downloadMP3FromS3)(s3ObjectKey);
        if (fs.existsSync(s3_1.localFilePath)) {
            const mp3Buffer = fs.readFileSync(s3_1.localFilePath);
            // Seu código aqui
            const readableStream = stream_1.Readable.from(mp3Buffer);
        }
        else {
            console.log(`Arquivo não encontrado: ${s3_1.localFilePath}`);
            // Tratamento de erro adicional aqui
        }
        // await pipelineAsync(readableStream, reply.raw)
        const audioReadStream = (0, node_fs_1.createReadStream)(s3_1.localFilePath);
        console.log('Iniciando chamada à API da OpenAI...');
        try {
            const response = await openai_1.openai.audio.transcriptions.create({
                file: audioReadStream,
                model: 'whisper-1',
                language: 'pt',
                temperature: 0,
                response_format: 'json',
                prompt,
            });
            const transcription = response.text;
            const statusUpdate = await prisma_1.prisma.video.update({
                where: {
                    id: videoId,
                },
                data: {
                    transcription,
                },
            });
            return { transcription, videoId, prompt };
        }
        catch (error) {
            console.log('Erro ao chamar a API da OpenAI:', error);
            return reply.status(500).send({ error: error });
        }
    });
}
exports.createVideoTranscription = createVideoTranscription;
