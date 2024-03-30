const ffmpeg = require('fluent-ffmpeg');
const path = require('path')
function addGifOverlayToImage(imagePath, gifPath, outputPath) {
    ffmpeg()
        .input(imagePath)
        .loop(5) // Duration of the final video, adjust as needed
        .input(gifPath)
        .complexFilter([
            `[0:v][1:v] overlay=10:10:shortest=1` // Overlay GIF on top of the image
        ])
        .outputOptions([
            '-c:v libx264', // Video codec
            '-pix_fmt yuv420p', // Pixel format for broad compatibility
            '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => console.log('Video processing finished successfully.'))
        .on('error', (err) => console.error('Error:', err))
        .run();
}

// Example usage
const imagePath = path.join(__dirname, 'images/image1.png'); // Path to your static image
const gifPath = path.join(__dirname, 'images/logo-loader.gif'); // Path to your animated GIF
const outputPath = 'videos/output_with_gif.mp4'; // Path for the output video file

addGifOverlayToImage(imagePath, gifPath, outputPath);
