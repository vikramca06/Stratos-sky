import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

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

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});