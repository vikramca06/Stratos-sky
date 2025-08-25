# AWS Amplify Gen 2 Complete Migration Plan

## Following Official AWS Amplify Documentation

### 1. Backend Resources (Per AWS Docs)

#### Authentication (Cognito)
```typescript
// amplify/auth/resource.ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    phone: false,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    name: {
      required: false,
      mutable: true,
    },
    picture: {
      required: false,
      mutable: true,
    },
  },
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    requireUppercase: true,
  },
  accountRecovery: 'EMAIL_ONLY',
  multifactor: {
    mode: 'OPTIONAL',
    sms: false,
    totp: true,
  },
  groups: ['Admin', 'Member', 'Premium'],
});
```

#### Data (GraphQL + DynamoDB)
```typescript
// amplify/data/resource.ts
const schema = a.schema({
  User: a.model({
    id: a.id().required(),
    email: a.email().required(),
    name: a.string(),
    avatar: a.url(),
    tier: a.enum(['FREE', 'PREMIUM', 'BUSINESS', 'ENTERPRISE']),
    storageUsed: a.integer().default(0),
    storageQuota: a.integer().default(5368709120),
    settings: a.json(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
    files: a.hasMany('File', 'ownerId'),
    sharedFiles: a.hasMany('Share', 'ownerId'),
    activities: a.hasMany('Activity', 'userId'),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(['Admin']),
  ]),

  File: a.model({
    id: a.id().required(),
    name: a.string().required(),
    originalName: a.string(),
    key: a.string().required(),
    size: a.integer().default(0),
    type: a.string(),
    mimeType: a.string(),
    parentId: a.id(),
    ownerId: a.id().required(),
    owner: a.belongsTo('User', 'ownerId'),
    isFolder: a.boolean().default(false),
    isStarred: a.boolean().default(false),
    isArchived: a.boolean().default(false),
    isEncrypted: a.boolean().default(false),
    thumbnail: a.url(),
    description: a.string(),
    tags: a.string().array(),
    metadata: a.json(),
    shares: a.hasMany('Share', 'fileId'),
    versions: a.hasMany('FileVersion', 'fileId'),
    activities: a.hasMany('Activity', 'fileId'),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
    deletedAt: a.datetime(),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(['Admin']),
    allow.authenticated().to(['read']),
  ])
  .secondaryIndexes((index) => [
    index('ownerId').sortKeys(['createdAt']).queryField('filesByOwner'),
    index('parentId').sortKeys(['name']).queryField('filesByFolder'),
  ]),

  Share: a.model({
    id: a.id().required(),
    fileId: a.id().required(),
    file: a.belongsTo('File', 'fileId'),
    ownerId: a.id().required(),
    owner: a.belongsTo('User', 'ownerId'),
    sharedWithEmail: a.email(),
    sharedWithUserId: a.id(),
    permissions: a.enum(['VIEW', 'EDIT', 'DELETE']),
    password: a.string(),
    expiresAt: a.datetime(),
    shareUrl: a.url(),
    accessCount: a.integer().default(0),
    lastAccessedAt: a.datetime(),
    createdAt: a.datetime(),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.authenticated().to(['read']),
  ]),

  Activity: a.model({
    id: a.id().required(),
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    fileId: a.id(),
    file: a.belongsTo('File', 'fileId'),
    action: a.enum(['UPLOAD', 'DOWNLOAD', 'DELETE', 'SHARE', 'VIEW', 'EDIT', 'RESTORE']),
    details: a.json(),
    ipAddress: a.string(),
    userAgent: a.string(),
    createdAt: a.datetime(),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(['Admin']),
  ]),

  FileVersion: a.model({
    id: a.id().required(),
    fileId: a.id().required(),
    file: a.belongsTo('File', 'fileId'),
    versionNumber: a.integer().required(),
    key: a.string().required(),
    size: a.integer(),
    uploadedBy: a.string(),
    comment: a.string(),
    createdAt: a.datetime(),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(['Admin']),
  ]),

  SecureRoom: a.model({
    id: a.id().required(),
    name: a.string().required(),
    description: a.string(),
    ownerId: a.id().required(),
    watermarkEnabled: a.boolean().default(false),
    downloadDisabled: a.boolean().default(false),
    expiresAt: a.datetime(),
    accessCode: a.string(),
    members: a.string().array(),
    files: a.string().array(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [
    allow.owner(),
    allow.groups(['Admin', 'Premium']),
  ]),
});
```

#### Storage (S3)
```typescript
// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'stratosStorage',
  access: (allow) => ({
    'uploads/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'protected/{entity_id}/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['write', 'delete']),
    ],
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'thumbnails/*': [
      allow.authenticated.to(['read']),
      allow.guest.to(['read']),
    ],
    'secure-rooms/{room_id}/*': [
      allow.groups(['Admin', 'Premium']).to(['read', 'write', 'delete']),
    ],
  }),
  triggers: {
    onUpload: defineFunction({
      entry: './on-upload-handler.ts',
    }),
    onDelete: defineFunction({
      entry: './on-delete-handler.ts',
    }),
  },
});
```

### 2. Frontend Integration (Per AWS Docs)

#### Configure Amplify
```typescript
// src/main.tsx
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
```

#### Authentication Service
```typescript
// src/services/authService.ts
import { signIn, signOut, signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';

export const authService = {
  async login(email: string, password: string) {
    const { isSignedIn, nextStep } = await signIn({ username: email, password });
    return { isSignedIn, nextStep };
  },

  async register(email: string, password: string, name: string) {
    const { userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
        },
      },
    });
    return { userId, nextStep };
  },

  async confirmRegistration(email: string, code: string) {
    const { isSignUpComplete } = await confirmSignUp({ username: email, confirmationCode: code });
    return isSignUpComplete;
  },

  async logout() {
    await signOut();
  },

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return user;
    } catch {
      return null;
    }
  },
};
```

#### Storage Service
```typescript
// src/services/storageService.ts
import { uploadData, downloadData, remove, getUrl, list } from 'aws-amplify/storage';

export const storageService = {
  async uploadFile(file: File, path: string, onProgress?: (progress: number) => void) {
    const result = await uploadData({
      path,
      data: file,
      options: {
        contentType: file.type,
        onProgress: (event) => {
          if (onProgress) {
            onProgress((event.transferredBytes / event.totalBytes) * 100);
          }
        },
      },
    }).result;
    return result;
  },

  async downloadFile(path: string) {
    const result = await downloadData({ path }).result;
    return result;
  },

  async deleteFile(path: string) {
    await remove({ path });
  },

  async getFileUrl(path: string, expiresIn: number = 3600) {
    const url = await getUrl({
      path,
      options: {
        expiresIn,
      },
    });
    return url;
  },

  async listFiles(path: string) {
    const result = await list({
      path,
      options: {
        listAll: true,
      },
    });
    return result;
  },
};
```

#### Data Service
```typescript
// src/services/dataService.ts
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export const dataService = {
  // Files
  async createFile(file: Omit<Schema['File']['type'], 'id'>) {
    const result = await client.models.File.create(file);
    return result.data;
  },

  async listFiles(ownerId: string) {
    const result = await client.models.File.filesByOwner({ ownerId });
    return result.data;
  },

  async updateFile(id: string, updates: Partial<Schema['File']['type']>) {
    const result = await client.models.File.update({ id, ...updates });
    return result.data;
  },

  async deleteFile(id: string) {
    await client.models.File.delete({ id });
  },

  // Real-time subscriptions
  subscribeToFiles(ownerId: string, callback: (files: Schema['File']['type'][]) => void) {
    const subscription = client.models.File.observeQuery({
      filter: { ownerId: { eq: ownerId } },
    }).subscribe({
      next: ({ items }) => callback(items),
    });
    return subscription;
  },

  // Activities
  async logActivity(activity: Omit<Schema['Activity']['type'], 'id'>) {
    await client.models.Activity.create(activity);
  },

  // Shares
  async createShare(share: Omit<Schema['Share']['type'], 'id'>) {
    const result = await client.models.Share.create(share);
    return result.data;
  },

  async revokeShare(id: string) {
    await client.models.Share.delete({ id });
  },
};
```

### 3. Component Architecture

#### Main App Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── files/
│   │   ├── FileList.tsx
│   │   ├── FileUpload.tsx
│   │   ├── FilePreview.tsx
│   │   └── FileActions.tsx
│   ├── sharing/
│   │   ├── ShareModal.tsx
│   │   └── SharedLinks.tsx
│   ├── secure-rooms/
│   │   ├── SecureRoomList.tsx
│   │   └── SecureRoomCreate.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── StorageContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useFiles.ts
│   └── useStorage.ts
├── services/
│   ├── authService.ts
│   ├── storageService.ts
│   └── dataService.ts
├── utils/
│   ├── formatters.ts
│   └── validators.ts
└── App.tsx
```

### 4. Implementation Steps

1. **Setup Backend Resources**
   - Configure authentication with all user attributes
   - Define complete data schema with relationships
   - Setup storage with proper access patterns
   - Add Lambda triggers for file processing

2. **Implement Services**
   - Create authentication service with Amplify Auth
   - Implement storage service with progress tracking
   - Build data service with GraphQL client
   - Add real-time subscriptions

3. **Build Components**
   - Authentication components with MFA support
   - File management with upload queue
   - Sharing system with permissions
   - Secure rooms for sensitive documents
   - Settings and user profile management

4. **Add Advanced Features**
   - File versioning
   - Activity logging
   - Search and filtering
   - Batch operations
   - Offline support

### 5. Testing & Deployment

1. **Local Testing**
   ```bash
   npx ampx sandbox
   ```

2. **Build & Deploy**
   ```bash
   npm run build
   git push origin amplify-v2-complete-migration
   ```

3. **AWS Amplify Console**
   - Automatic CI/CD pipeline
   - Environment variables configuration
   - Custom domain setup

This plan follows AWS Amplify Gen 2 best practices and official documentation for a production-ready cloud storage application.