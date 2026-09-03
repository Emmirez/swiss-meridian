/**
 * Compresses an image file in the browser using canvas — resizes to a max
 * dimension and re-encodes as JPEG at a given quality. Returns a new File
 * object with the same name, ready to upload in place of the original.
 * Non-image files (e.g. PDFs) are returned unchanged.
 */
export const compressImage = (file, { maxDimension = 1600, quality = 0.8 } = {}) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file); // not an image (e.g. PDF) — leave it alone
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // compression failed — fall back to original
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file); // couldn't load as image — fall back
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};