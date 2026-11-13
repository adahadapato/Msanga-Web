import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

/** The tests: run in a pretend browser (jsdom), with src/test/setup.ts first. */
export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
}))
