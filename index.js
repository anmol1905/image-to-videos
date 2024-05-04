const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// Function to create a video clip from a single image
function createClipFromImage(imagePath, duration, outputClipPath, callback) {
    ffmpeg(imagePath)
        .inputOptions('-loop 1')
        .inputOptions(`-t ${duration}`)
        .inputOptions('-framerate 1')
        .outputOptions([
            '-c:v libx264',  // Use H.264 codec
            '-pix_fmt yuv420p',  // Pixel format compatible with most devices
            '-crf 23',  // Constant Rate Factor that balances quality and file size
            '-preset veryfast'  // Faster encoding with reasonable file size
        ])
        .output(outputClipPath)
        .on('end', () => {
            console.log(`Clip created: ${outputClipPath}`);
            callback(null, outputClipPath); // Pass the clip path on success
        })
        .on('error', (err) => {
            console.error(`Error: ${err.message}`);
            callback(err);
        })
        .run();
}

// Function to concatenate video clips into a single video
function concatenateClips(clips, outputPath, callback) {
    // Generate a file listing all clips
    const fileList = 'filelist.txt';
    const fileContent = clips.map(clip => `file '${clip}'`).join('\n');
    fs.writeFileSync(fileList, fileContent);
    console.log("created")
    ffmpeg()
        .input(fileList)
        .inputOptions(['-f concat', '-safe 0']) // Corrected input options
        .outputOptions('-c copy')
        .output(outputPath)
        .on('end', () => {
            console.log('Final video created successfully');
            callback(null);
            // Cleanup temporary files
            fs.unlinkSync(fileList);
            clips.forEach(clip => fs.unlinkSync(clip));
        })
        .on('error', (err) => {
            console.error(`Error: ${err.message}`);
            callback(err);
        })
        .run();
}

function createVideo(screenshots, durations, outputPath) {
    let clips = [];

    for (let index = 0; index < screenshots.length; index++) {
        const screenshot = screenshots[index];
        const duration = durations[index];
        const clipPath = `clip${index}.mp4`; // Temporary clip path

        createClipFromImage(screenshot, duration, clipPath, (err, clip) => {
            if (err) {
                console.error(`Failed to create clip for ${screenshot}: ${err}`);
                return;
            }

            clips.push(clip);

            if (index === screenshots.length - 1) {
                // All screenshots processed, concatenate clips
                concatenateClips(clips, outputPath, (err) => {
                    if (err) {
                        console.error(`Failed to concatenate clips: ${err}`);
                        return;
                    }
                    console.log('All done');

                    // Cleanup: Delete temporary clip files
                    // clips.forEach(clip => fs.unlinkSync(clip));
                    // fs.unlinkSync('filelist.txt'); // Delete the temporary file list
                });
            }
        });
    }
}


// Example usage
const screenshots = [
    path.join(__dirname, 'images/image1.png'),
    path.join(__dirname, 'images/image2.png')
];
const durations = [5, 10]; // Durations in seconds for each screenshot
const outputPath = path.join(__dirname, 'videos/output.mp4');

createVideo(screenshots, durations, outputPath);
