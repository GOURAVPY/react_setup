import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve,dirname } from 'path';
import { fileURLToPath } from "node:url";
import { createPixieHandler } from './server/brain.js'
import { createMindHandler } from './server/mind.js'

// runs Pixie's brain inside the dev server, so `npm run dev` is all you need;
// the key comes from GEMINI_API_KEY in your environment or in .env.local
const pixieBrain = (env) => ({
  name: 'pixie-brain',
  configureServer(server) {
    const options = { apiKey: env.GEMINI_API_KEY, model: env.PIXIE_MODEL || undefined }
    // the longer path first: '/api/pixie' would match it too
    server.middlewares.use('/api/pixie/mind', createMindHandler(options))
    server.middlewares.use('/api/pixie', createPixieHandler(options))
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), pixieBrain(env)],
    resolve :{
      alias:{
        '#components':resolve(dirname(fileURLToPath(import.meta.url)),'src/components'),
        '#constants':resolve(dirname(fileURLToPath(import.meta.url)),'src/constants'),
        '#store':resolve(dirname(fileURLToPath(import.meta.url)),'src/store'),
        '#hco':resolve(dirname(fileURLToPath(import.meta.url)),'src/hco'),
        '#windows':resolve(dirname(fileURLToPath(import.meta.url)),'src/windows'),

      }

    }
  }
})
