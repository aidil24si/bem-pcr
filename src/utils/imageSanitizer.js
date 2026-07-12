/**
 * Validates file signatures (Magic Bytes) to ensure the uploaded file
 * is actually a valid image (JPEG, PNG, GIF, or WEBP) and not a renamed malicious payload.
 * 
 * @param {File|Blob} file - The file to validate.
 * @returns {Promise<boolean>} A promise resolving to true if valid, false otherwise.
 */
export function validateImageMagicBytes(file) {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      resolve(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (e.target.readyState !== FileReader.DONE) {
        resolve(false);
        return;
      }

      const arr = new Uint8Array(e.target.result);
      if (arr.length < 12) {
        resolve(false);
        return;
      }

      // Convert first 4 bytes to hex string
      let hexFirst4 = '';
      for (let i = 0; i < 4; i++) {
        hexFirst4 += arr[i].toString(16).toUpperCase().padStart(2, '0');
      }

      const isPng = hexFirst4 === '89504E47';
      const isGif = hexFirst4 === '47494638';
      const isJpeg = hexFirst4.startsWith('FFD8FF');

      // WEBP: "RIFF" (52 49 46 46) at offset 0, "WEBP" (57 45 42 50) at offset 8-11
      let isWebp = false;
      if (hexFirst4 === '52494646') {
        let hexOffset8_11 = '';
        for (let i = 8; i < 12; i++) {
          hexOffset8_11 += arr[i].toString(16).toUpperCase().padStart(2, '0');
        }
        isWebp = hexOffset8_11 === '57454250';
      }

      resolve(isPng || isGif || isJpeg || isWebp);
    };

    const blob = file.slice(0, 12);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Sanitizes an image by redrawing it onto a canvas to strip EXIF metadata,
 * compresses it to JPEG format with a quality factor, and returns a new File object
 * named with a random UUID.
 * 
 * @param {File} file - The original image File object.
 * @param {number} [quality=0.7] - Compression quality (0.0 to 1.0).
 * @returns {Promise<File>} A Promise that resolves to the sanitized and compressed File.
 */
export function sanitizeAndCompressImage(file, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set maximum dimension to avoid excessive memory usage (e.g. 1600px max width/height)
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image onto canvas (this strips all EXIF metadata)
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG format with specified compression quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression failed.'));
            }

            // Generate random UUID for filename
            const uniqueId = crypto.randomUUID();
            const fileName = `${uniqueId}.jpg`;

            // Create a new file wrapper for the blob
            const sanitizedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(sanitizedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file.'));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file data.'));
    };

    reader.readAsDataURL(file);
  });
}
