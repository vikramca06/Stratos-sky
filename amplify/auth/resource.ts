import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
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
  accountRecovery: 'EMAIL_ONLY',
  multifactor: {
    mode: 'OPTIONAL',
    sms: false,
    totp: true,
  },
  groups: ['Admin', 'Member', 'Premium'],
});
