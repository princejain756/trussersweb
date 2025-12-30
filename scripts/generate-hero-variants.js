import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = path.resolve(process.cwd());
const sourcePath = path.join(projectRoot, 'public', 'heroimage.webp');

const variants = [
    { width: 640, formats: ['webp', 'avif'] },
    { width: 960, formats: ['webp', 'avif'] },
    { width: 1280, formats: ['webp', 'avif'] },
];

async function fileMtimeMs(filePath) {
    try {
        const stat = await fs.stat(filePath);
        return stat.mtimeMs;
    } catch {
        return null;
    }
}

async function main() {
    const sourceMtime = await fileMtimeMs(sourcePath);
    if (!sourceMtime) {
        console.warn(`Hero source image not found: ${sourcePath}`);
        return;
    }

    const metadata = await sharp(sourcePath).metadata();
    if (!metadata.width || !metadata.height) {
        console.warn('Unable to read hero image dimensions; skipping responsive variants.');
        return;
    }

    await Promise.all(
        variants.flatMap((variant) =>
            variant.formats.map(async (format) => {
                const outName = `heroimage-${variant.width}.${format}`;
                const outPath = path.join(projectRoot, 'public', outName);
                const outMtime = await fileMtimeMs(outPath);
                if (outMtime && outMtime >= sourceMtime) return;

                const pipeline = sharp(sourcePath).resize({
                    width: variant.width,
                    withoutEnlargement: true,
                });

                if (format === 'avif') {
                    await pipeline
                        .avif({ quality: 50, effort: 4 })
                        .toFile(outPath);
                    return;
                }

                await pipeline
                    .webp({ quality: 72 })
                    .toFile(outPath);
            })
        )
    );
}

main().catch((error) => {
    console.error('Failed to generate hero variants:', error);
    process.exitCode = 1;
});

