import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToProcess = [
    path.join(__dirname, '../public/products'),
    path.join(__dirname, '../src/assets')
];

const processDirectory = async (directory) => {
    if (!fs.existsSync(directory)) {
        console.log(`Directory not found: ${directory}`);
        return;
    }

    const files = fs.readdirSync(directory);

    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const filePath = path.join(directory, file);
            const fileExt = path.extname(file);
            const fileName = path.basename(file, fileExt);
            const webpPath = path.join(directory, `${fileName}.webp`);

            // Skip if webp already exists and is newer
            if (fs.existsSync(webpPath)) {
                const originalStats = fs.statSync(filePath);
                const webpStats = fs.statSync(webpPath);
                if (webpStats.mtime > originalStats.mtime) {
                    // console.log(`Skipping ${file}, WebP exists and is newer.`);
                    continue;
                }
            }

            try {
                await sharp(filePath)
                    .webp({ quality: 80 })
                    .toFile(webpPath);

                console.log(`Converted: ${file} -> ${fileName}.webp`);

                // Optional: Delete original file if needed, but let's keep them for safety for now
                // fs.unlinkSync(filePath); 

            } catch (error) {
                console.error(`Error converting ${file}:`, error);
            }
        }
    }
};

const run = async () => {
    console.log('Starting image optimization...');
    for (const dir of dirsToProcess) {
        await processDirectory(dir);
    }
    console.log('Image optimization complete!');
};

run();
