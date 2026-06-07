function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export async function getCroppedImageFile(imageSrc, pixelCrop, fileName = "category-image.jpg") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not crop image.");
  }

  canvas.width = Math.round(pixelCrop.width);
  canvas.height = Math.round(pixelCrop.height);

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not crop image."));
          return;
        }
        resolve(new File([blob], fileName, { type: blob.type || "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}
