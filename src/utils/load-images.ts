const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(src));
    image.src = src;
  });

export const loadImages = (sources: string[] = []) =>
  Promise.all(sources.map(loadImage));
