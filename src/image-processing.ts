import sharp from 'sharp';
const input_path = './public/assets/images';
/* The path to the output image. */
const output_path = './public/assets/images/thumbnails';
// query segments
interface sharpResizeParams {
  src: string;
  target: string;
  width: number;
  height: number;
}

/**
 * Process image via sharp.
 * @param {sharpResizeParams} params Parameters.
 * @param {string} params.src Source image path.
 * @param {string} params.target Target path.
 * @param {number} params.width Target width.
 * @param {number} params.height Target height.
 * @return {OutputInfo|string} Error message or null.
 */

const processImage = async (
  params: sharpResizeParams
): Promise<{ success: boolean; message?: string; output?: sharp.OutputInfo }> => {
  try {
    const output = await sharp(params.src)
      .resize(params.width, params.height)
      .toFile(params.target);
    return {
      success: true,
      output
    };
  } catch (error) {
    let message = 'Image could not be processed.';
    if (error instanceof Error && error.message) message = error.message;
    return {
      success: false,
      message
    };
  }
};

export { processImage, input_path, output_path };
