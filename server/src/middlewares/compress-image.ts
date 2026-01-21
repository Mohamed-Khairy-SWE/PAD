import sharp from "sharp";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";
// A Middleware to compress the images
export const compressImages = async (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  try {
    // Make it valid for handling one file or multiple files
    const allFiles: Express.Multer.File[] = [];

    if (request.file) {
      allFiles.push(request.file);
    } else if (Array.isArray(request.files)) {
      allFiles.push(...(request.files as Express.Multer.File[]));
    } else if (typeof request.files === "object" && request.files !== null) {
      Object.values(request.files).forEach((group) =>
        allFiles.push(...(group as Express.Multer.File[]))
      );
    }

    if (allFiles.length === 0) return next();

    await Promise.all(
      allFiles.map(async (file) => {
        const filePath = file.path;
        const ext = path.extname(filePath).toLowerCase();

        // check the file which will be compressed if its an image
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return;

        const compressedPath = filePath.replace(ext, "-compressed.webp");

        try {
          // Compress the image
          await sharp(filePath)
            .resize({ width: 1920 })
            .webp({ quality: 80 })
            .toFile(compressedPath);

          // delete original file
          fs.unlinkSync(filePath);

          // update file metadata in request
          file.path = compressedPath;
          file.filename = path.basename(compressedPath);
          file.mimetype = "image/webp";
        } catch (_err) {
          // Silently handle compression errors
        }
      })
    );

    next();
  } catch (_error) {
    next();
  }
};
