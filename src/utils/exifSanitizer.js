/**
 * Removes EXIF metadata from an image file using HTML5 Canvas,
 * resizes the image to a maximum width of 600px, and returns a Base64 string
 * with JPEG compression. This prevents QuotaExceededError in LocalStorage
 * and ensures the image persists across sessions.
 * 
 * @param {File|Blob} file - The original image file
 * @returns {Promise<{ file: File, previewUrl: string }>} - Resolves to the Base64 previewUrl and a dummy File object
 */
export const sanitizeImageEXIF = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Input must be an image file'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Set maximum width for resizing
      const MAX_WIDTH = 600;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas directly to a Base64 Data URL (0.5 JPEG Quality)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);

      // We still return a File object just to keep existing signature intact if needed,
      // though the core fix relies on the Base64 dataUrl string.
      const extension = 'jpg';
      const newFileName = `${crypto.randomUUID()}.${extension}`;
      
      // Convert DataURL to Blob for the dummy File object
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      
      const sanitizedFile = new File([blob], newFileName, {
        type: mime,
        lastModified: Date.now(),
      });

      // Cleanup object URL
      URL.revokeObjectURL(objectUrl);

      // resolve with the Base64 string as the previewUrl
      resolve({ file: sanitizedFile, previewUrl: dataUrl });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for sanitization'));
    };

    img.src = objectUrl;
  });
};
