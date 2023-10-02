"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrompt = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
async function createPrompt(app) {
    app.post('/create-prompt', async (req, reply) => {
        console.log('🚀 ~ file: generate-ai-compilation.ts:8 ~ app.post ~ req:', req.body);
        const bodySchema = zod_1.z.object({
            title: zod_1.z.string(),
            string: zod_1.z.string(),
        });
        const { title, string } = bodySchema.parse(req.body);
        const template = `${string}

    Transcrição:
    '''
    {transcription}
    '''`.trim();
        const res = await prisma_1.prisma.prompt.create({
            data: {
                title,
                template,
            },
        });
        return reply.status(201).send({
            res,
        });
    });
}
exports.createPrompt = createPrompt;
