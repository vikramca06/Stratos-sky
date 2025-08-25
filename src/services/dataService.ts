import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export const dataService = {
  // User operations
  async createUser(user: Omit<Schema['User']['type'], 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await client.models.User.create(user);
      return result.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  async getUser(id: string) {
    try {
      const result = await client.models.User.get({ id });
      return result.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: Partial<Schema['User']['type']>) {
    try {
      const result = await client.models.User.update({ id, ...updates });
      return result.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // File operations
  async createFile(file: Omit<Schema['File']['type'], 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await client.models.File.create(file);
      return result.data;
    } catch (error) {
      console.error('Create file error:', error);
      throw error;
    }
  },

  async listFiles(ownerId: string) {
    try {
      const result = await client.models.File.filesByOwner({ ownerId });
      return result.data;
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  },

  async listFilesByFolder(parentId: string) {
    try {
      const result = await client.models.File.filesByFolder({ parentId });
      return result.data;
    } catch (error) {
      console.error('List folder files error:', error);
      throw error;
    }
  },

  async updateFile(id: string, updates: Partial<Schema['File']['type']>) {
    try {
      const result = await client.models.File.update({ id, ...updates });
      return result.data;
    } catch (error) {
      console.error('Update file error:', error);
      throw error;
    }
  },

  async deleteFile(id: string) {
    try {
      await client.models.File.delete({ id });
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  },

  async starFile(id: string) {
    return this.updateFile(id, { isStarred: true });
  },

  async unstarFile(id: string) {
    return this.updateFile(id, { isStarred: false });
  },

  async archiveFile(id: string) {
    return this.updateFile(id, { isArchived: true });
  },

  async restoreFile(id: string) {
    return this.updateFile(id, { isArchived: false });
  },

  // Real-time subscriptions
  subscribeToFiles(ownerId: string, callback: (files: Schema['File']['type'][]) => void) {
    const subscription = client.models.File.observeQuery({
      filter: { ownerId: { eq: ownerId } },
    }).subscribe({
      next: ({ items }) => callback(items),
      error: (error) => console.error('Subscription error:', error),
    });
    return subscription;
  },

  subscribeToFileChanges(fileId: string, callback: (file: Schema['File']['type']) => void) {
    const subscription = client.models.File.observe({ id: fileId }).subscribe({
      next: ({ element }) => callback(element),
      error: (error) => console.error('File subscription error:', error),
    });
    return subscription;
  },

  // Activity operations
  async logActivity(activity: Omit<Schema['Activity']['type'], 'id' | 'createdAt'>) {
    try {
      await client.models.Activity.create(activity);
    } catch (error) {
      console.error('Log activity error:', error);
    }
  },

  async getUserActivities(userId: string, limit: number = 50) {
    try {
      const result = await client.models.Activity.list({
        filter: { userId: { eq: userId } },
        limit,
      });
      return result.data;
    } catch (error) {
      console.error('Get activities error:', error);
      throw error;
    }
  },

  // Share operations
  async createShare(share: Omit<Schema['Share']['type'], 'id' | 'createdAt'>) {
    try {
      const result = await client.models.Share.create(share);
      return result.data;
    } catch (error) {
      console.error('Create share error:', error);
      throw error;
    }
  },

  async getShare(id: string) {
    try {
      const result = await client.models.Share.get({ id });
      return result.data;
    } catch (error) {
      console.error('Get share error:', error);
      throw error;
    }
  },

  async updateShare(id: string, updates: Partial<Schema['Share']['type']>) {
    try {
      const result = await client.models.Share.update({ id, ...updates });
      return result.data;
    } catch (error) {
      console.error('Update share error:', error);
      throw error;
    }
  },

  async revokeShare(id: string) {
    try {
      await client.models.Share.delete({ id });
      return true;
    } catch (error) {
      console.error('Revoke share error:', error);
      throw error;
    }
  },

  async getFileShares(fileId: string) {
    try {
      const result = await client.models.Share.list({
        filter: { fileId: { eq: fileId } },
      });
      return result.data;
    } catch (error) {
      console.error('Get file shares error:', error);
      throw error;
    }
  },

  // File version operations
  async createFileVersion(version: Omit<Schema['FileVersion']['type'], 'id' | 'createdAt'>) {
    try {
      const result = await client.models.FileVersion.create(version);
      return result.data;
    } catch (error) {
      console.error('Create version error:', error);
      throw error;
    }
  },

  async getFileVersions(fileId: string) {
    try {
      const result = await client.models.FileVersion.list({
        filter: { fileId: { eq: fileId } },
      });
      return result.data;
    } catch (error) {
      console.error('Get versions error:', error);
      throw error;
    }
  },

  // Secure room operations
  async createSecureRoom(room: Omit<Schema['SecureRoom']['type'], 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await client.models.SecureRoom.create(room);
      return result.data;
    } catch (error) {
      console.error('Create secure room error:', error);
      throw error;
    }
  },

  async getSecureRoom(id: string) {
    try {
      const result = await client.models.SecureRoom.get({ id });
      return result.data;
    } catch (error) {
      console.error('Get secure room error:', error);
      throw error;
    }
  },

  async updateSecureRoom(id: string, updates: Partial<Schema['SecureRoom']['type']>) {
    try {
      const result = await client.models.SecureRoom.update({ id, ...updates });
      return result.data;
    } catch (error) {
      console.error('Update secure room error:', error);
      throw error;
    }
  },

  async deleteSecureRoom(id: string) {
    try {
      await client.models.SecureRoom.delete({ id });
      return true;
    } catch (error) {
      console.error('Delete secure room error:', error);
      throw error;
    }
  },

  async listSecureRooms(ownerId: string) {
    try {
      const result = await client.models.SecureRoom.list({
        filter: { ownerId: { eq: ownerId } },
      });
      return result.data;
    } catch (error) {
      console.error('List secure rooms error:', error);
      throw error;
    }
  },

  // Batch operations
  async deleteMultipleFiles(fileIds: string[]) {
    const results = await Promise.allSettled(
      fileIds.map(id => this.deleteFile(id))
    );
    return results.filter(r => r.status === 'fulfilled').length;
  },

  async moveFiles(fileIds: string[], newParentId: string | null) {
    const results = await Promise.allSettled(
      fileIds.map(id => this.updateFile(id, { parentId: newParentId }))
    );
    return results.filter(r => r.status === 'fulfilled').length;
  },

  // Search operations
  async searchFiles(ownerId: string, query: string) {
    try {
      const result = await client.models.File.list({
        filter: {
          and: [
            { ownerId: { eq: ownerId } },
            { or: [
              { name: { contains: query } },
              { description: { contains: query } },
            ]},
          ],
        },
      });
      return result.data;
    } catch (error) {
      console.error('Search files error:', error);
      throw error;
    }
  },
};