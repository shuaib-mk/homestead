/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import vercel from './vercel.json'

// `vite preview` serves the same security headers Vercel applies from vercel.json, so the QA scripts exercise the real CSP.
const headers = Object.fromEntries(vercel.headers.flatMap((h) => h.headers.map(({ key, value }) => [key, value])))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { headers },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
