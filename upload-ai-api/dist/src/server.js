"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const get_all_prompts_1 = require("./routes/get-all-prompts");
const post_video_1 = require("./routes/post-video");
const create_transcription_1 = require("./routes/create-transcription");
const cors_1 = __importDefault(require("@fastify/cors"));
const create_prompt_1 = require("./routes/create-prompt");
const generate_ai_compilation_1 = require("./routes/generate-ai-compilation");
const app = (0, fastify_1.fastify)({});
app.register(cors_1.default, {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
});
app.get('/', (req, reply) => {
    reply.send({ success: true });
});
app.get('/test', (req, reply) => {
    return reply.send({
        message: 'Hello world',
    });
});
app.register(get_all_prompts_1.getAllPrompt);
app.register(post_video_1.uploadVideo);
app.register(create_transcription_1.createVideoTranscription);
app.register(generate_ai_compilation_1.generateAiCompilationRoute);
app.register(create_prompt_1.createPrompt);
const port = Number(process.env.PORT) || 3006;
app
    .listen({
    host: '0.0.0.0',
    port: port,
})
    .then(() => console.log('Listening on port !', port));
