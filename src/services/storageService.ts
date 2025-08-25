import { uploadData, downloadData, remove, getUrl, list, copy } from 'aws-amplify/storage';

export const storageService = {
  async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void,
    metadata?: Record<string, string>
  ) {
    try {
      const result = await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type,
          metadata,
          onProgress: (event) => {
            if (onProgress) {
              const percentage = (event.transferredBytes / event.totalBytes!) * 100;
              onProgress(percentage);
            }
          },
        },
      }).result;
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  async downloadFile(path: string, onProgress?: (progress: number) => void) {
    try {
      const result = await downloadData({ 
        path,
        options: {
          onProgress: (event) => {
            if (onProgress) {
              const percentage = (event.transferredBytes / event.totalBytes!) * 100;
              onProgress(percentage);
            }
          },
        },
      }).result;
      return result;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  async deleteFile(path: string) {
    try {
      await remove({ path });
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },

  async getFileUrl(path: string, expiresIn: number = 3600) {
    try {
      const url = await getUrl({
        path,
        options: {
          expiresIn,
        },
      });
      return url;
    } catch (error) {
      console.error('Get URL error:', error);
      throw error;
    }
  },

  async listFiles(path: string, pageSize?: number, nextToken?: string) {
    try {
      const result = await list({
        path,
        options: {
          pageSize,
          nextToken,
        },
      });
      return result;
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  },

  async copyFile(source: string, destination: string) {
    try {
      const result = await copy({
        source: { path: source },
        destination: { path: destination },
      });
      return result;
    } catch (error) {
      console.error('Copy error:', error);
      throw error;
    }
  },

  async uploadMultiple(
    files: File[], 
    basePath: string,
    onProgress?: (fileName: string, progress: number) => void
  ) {
    const results = [];
    for (const file of files) {
      const path = `${basePath}/${Date.now()}-${file.name}`;
      const result = await this.uploadFile(
        file, 
        path,
        (progress) => onProgress?.(file.name, progress)
      );
      results.push(result);
    }
    return results;
  },

  generateThumbnailPath(originalPath: string) {
    return originalPath.replace(/^uploads\//, 'thumbnails/');
  },

  getFileExtension(fileName: string) {
    return fileName.split('.').pop()?.toLowerCase() || '';
  },

  isImageFile(fileName: string) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(this.getFileExtension(fileName));
  },

  isVideoFile(fileName: string) {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    return videoExtensions.includes(this.getFileExtension(fileName));
  },

  formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },
};