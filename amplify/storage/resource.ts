import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'stratosStorage',
  access: (allow) => ({
    'uploads/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'folders/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});