const ffmpeg = require('fluent-ffmpeg');
const path = require('path')
function addAnimatedTextToImage(imagePath, outputPath) {
    ffmpeg()
        .input(imagePath)
        .inputOptions('-loop 1') // Loop the single image
        .complexFilter([
            {
                filter: 'drawtext',
                options: {
                    fontfile: 'Calibri-Regular.ttf',
                    text: 'Hello, World!',
                    x: '(t*100)', // Move text from left to right; adjust '100' to control speed
                    y: '50', // Position text 50 pixels from the top
                    fontsize: '24',
                    fontcolor: 'white'
                }
            }
        ])
        .outputOptions([
            '-t 5', // Duration of the output video
            '-c:v libx264', // Video codec
            '-pix_fmt yuv420p', // Pixel format
            '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => console.log('Processing finished successfully'))
        .on('error', (err) => console.error('Error:', err))
        .run();
}

// Example usage
const imagePath = path.join(__dirname, 'images/image1.png'); // Path to your static image
const outputPath = 'videos/animated-output.mp4'; // Path for the output video file

addAnimatedTextToImage(imagePath, outputPath);
