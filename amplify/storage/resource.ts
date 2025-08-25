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
});