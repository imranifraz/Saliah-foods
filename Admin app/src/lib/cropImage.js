function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image for cropping.")));
    // blob:/data: URLs break when crossOrigin is set; only use CORS for remote URLs
    if (typeof url === "string" && !url.startsWith("blob:") && !url.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }
    image.src = url;
  });
}

const DEFAULT_OUTPUT_SIZE = 1200;

/**
 * Crop to the selected region, then scale to a square JPEG.
 * @param {string} imageSrc
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop
 * @param {string} [fileName]
 * @param {{ outputSize?: number }} [options]
 */
export async function getCroppedImageFile(
  imageSrc,
  pixelCrop,
  fileName = "category-image.jpg",
  options = {}
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not crop image.");
  }

  const outputSize = Math.max(1, Math.round(options.outputSize ?? DEFAULT_OUTPUT_SIZE));
  const srcW = Math.max(1, Math.round(pixelCrop.width));
  const srcH = Math.max(1, Math.round(pixelCrop.height));
  canvas.width = outputSize;
  canvas.height = outputSize;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputSize, outputSize);
  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    srcW,
    srcH,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not crop image."));
          return;
        }
        const safeName = String(fileName || "product-image.jpg").replace(/\.\w+$/, ".jpg");
        resolve(new File([blob], safeName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  });
}
