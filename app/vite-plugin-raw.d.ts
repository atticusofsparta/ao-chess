declare module 'vite-plugin-raw' {
  import { Plugin } from 'vite';

  interface RawPluginOptions {
    match: RegExp;
  }

  export default function rawPlugin(options: RawPluginOptions): Plugin;
}
