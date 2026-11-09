// css-loader runs with exportType 'string': a stylesheet imports as its CSS text
declare module '*.css' {
  const css: string;
  export default css;
}

// webpack 5: import.meta.webpackContext bundles every file of a folder that matches regExp
interface WebpackContext {
  keys(): string[];
  (key: string): unknown;
}

interface ImportMeta {
  webpackContext(request: string, options: { recursive?: boolean; regExp?: RegExp }): WebpackContext;
}
