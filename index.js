const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// Function to create a video clip from a single image
function createClipFromImage(imagePath, duration, outputClipPath, callback) {
    ffmpeg(imagePath)
        .inputOptions('-loop 1')
        .inputOptions(`-t ${duration}`)
        .inputOptions('-framerate 25')
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


// Main function to create the video from screenshots
function createVideo(screenshots, durations, outputPath) {
    let clips = [];

    const processScreenshot = (index) => {
        if (index < screenshots.length) {
            const screenshot = screenshots[index];
            const duration = durations[index];
            const clipPath = `clip${index}.mp4`; // Temporary clip path

            createClipFromImage(screenshot, duration, clipPath, (err, clip) => {
                if (err) {
                    console.error(`Failed to create clip for ${screenshot}: ${err}`);
                    return;
                }

                clips.push(clip);
                processScreenshot(index + 1); // Process the next screenshot
            });
        } else {
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
    };

    // Start processing from the first screenshot
    processScreenshot(0);
}

// Example usage
const screenshots = [
    path.join(__dirname, 'images/image1.png'),
    path.join(__dirname, 'images/image2.png')
];
const durations = [5, 10]; // Durations in seconds for each screenshot
const outputPath = path.join(__dirname, 'videos/output.mp4');

createVideo(screenshots, durations, outputPath);
