import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

import { ALLOWED_IMAGE_MIME_TYPES } from './upload.constants';

export type UploadedImageFile = {
  filename: string;
  mimetype: string;
  originalname: string;
};

function ensureDirectoryExists(directoryPath: string) {
  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }
}

function buildSafeFilename(originalName: string) {
  const extension = extname(originalName).toLowerCase();
  const baseName = originalName
    .replace(extension, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName || 'image'}${extension}`;
}

export function createImageStorage(folderName: string) {
  return diskStorage({
    destination: (_request, _file, callback) => {
      const directoryPath = join(process.cwd(), 'uploads', folderName);
      ensureDirectoryExists(directoryPath);
      callback(null, directoryPath);
    },
    filename: (_request, file, callback) => {
      callback(null, buildSafeFilename(file.originalname));
    },
  });
}

export function imageFileFilter(
  _request: Express.Request,
  file: UploadedImageFile,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    callback(
      new BadRequestException(
        'Only JPG, PNG and WEBP image files are allowed',
      ) as unknown as Error,
      false,
    );
    return;
  }

  callback(null, true);
}

export function buildRelativeUploadPath(
  folderName: string,
  filename: string,
) {
  return `/uploads/${folderName}/${filename}`;
}

export function removeStoredFile(filePath?: string | null) {
  if (!filePath) {
    return;
  }

  const normalizedPath = filePath.replace(/^\/+/, '');
  const absolutePath = join(process.cwd(), normalizedPath);

  if (existsSync(absolutePath)) {
    unlinkSync(absolutePath);
  }
}
