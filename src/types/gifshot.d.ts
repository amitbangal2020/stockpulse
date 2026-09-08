declare module "gifshot" {
  interface GifOptions {
    images: string[];
    gifWidth: number;
    gifHeight: number;
    interval: number;
    numFrames: number;
    frameDuration: number;
  }
  interface GifResult {
    error: string | null;
    image: string;
  }
  function createGIF(options: GifOptions, callback: (result: GifResult) => void): void;
  export default { createGIF };
}
