/**
 * Removes EXIF metadata from an image file using HTML5 Canvas.
 * Draws the image onto a canvas and converts it back to a Blob,
 * which intrinsically drops all EXIF metadata.
 * 
 * @param {File|Blob} file - The original image file
 * @returns {Promise<{ file: File, previewUrl: string }>} - A promise that resolves to the sanitized File and a preview URL
 */
export const sanitizeImageEXIF = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Input must be an image file'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Convert canvas to blob (this drops EXIF)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas to Blob conversion failed'));
          return;
        }

        // Generate random UUID for the filename
        const extension = file.name.split('.').pop() || 'jpg';
        const newFileName = `${crypto.randomUUID()}.${extension}`;

        // Create the new sanitized File object
        const sanitizedFile = new File([blob], newFileName, {
          type: blob.type,
          lastModified: Date.now(),
        });

        // Cleanup object URL
        URL.revokeObjectURL(objectUrl);

        // Create a new preview URL for the sanitized file
        const previewUrl = URL.createObjectURL(sanitizedFile);

        resolve({ file: sanitizedFile, previewUrl });
      }, file.type, 0.9); // 0.9 quality if JPEG
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for sanitization'));
    };

    img.src = objectUrl;
  });
};
