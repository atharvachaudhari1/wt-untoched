import { defineConfig } from 'jsrepo';

export default defineConfig({
  registries: ['https://reactbits.dev/r'],
  paths: {
    '*': './src/components',
    component: './src/components',
    components: './src/components',
  },
});
