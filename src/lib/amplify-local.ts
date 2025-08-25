/**
 * Local AWS Amplify Configuration for Development
 * This uses mock/local services instead of real AWS resources
 */

import { Amplify } from 'aws-amplify';

// Local development configuration
const localConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'local-user-pool-id',
      userPoolClientId: 'local-client-id',
      identityPoolId: 'local-identity-pool',
      region: 'us-east-1',
      // Use local storage for auth tokens in dev
      localStorage: true,
      // Mock authentication endpoints
      endpoint: 'http://localhost:3001/auth'
    }
  },
  Storage: {
    S3: {
      bucket: 'local-storage-bucket',
      region: 'us-east-1',
      // Use LocalStack or local S3 mock
      endpoint: 'http://localhost:4566',
      forcePathStyle: true
    }
  },
  API: {
    GraphQL: {
      endpoint: 'http://localhost:20002/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'apiKey',
      apiKey: 'local-development-key'
    },
    REST: {
      StratosAPI: {
        endpoint: 'http://localhost:3001',
        region: 'us-east-1'
      }
    }
  }
};

// Production configuration (will be replaced by amplify_outputs.json in production)
const productionConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'not-configured',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'not-configured',
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || 'not-configured',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
    }
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET || 'not-configured',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
    }
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'not-configured',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool'
    },
    REST: {
      StratosAPI: {
        endpoint: import.meta.env.VITE_API_ENDPOINT || 'not-configured',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
      }
    }
  }
};

// Initialize Amplify with appropriate configuration
export function initializeAmplify() {
  const isDevelopment = import.meta.env.DEV;
  const config = isDevelopment ? localConfig : productionConfig;
  
  console.log('🔧 Initializing Amplify in', isDevelopment ? 'development' : 'production', 'mode');
  
  try {
    Amplify.configure(config);
    console.log('✅ Amplify initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Amplify:', error);
    // Continue without Amplify for local development
    return false;
  }
}

// Export configured Amplify instance
export { Amplify };

// Helper function to check if Amplify is properly configured
export function isAmplifyConfigured(): boolean {
  try {
    // Try to access Amplify configuration
    const config = Amplify.getConfig();
    return !!(config.Auth && config.Storage && config.API);
  } catch {
    return false;
  }
}

// Mock authentication for local development
export const mockAuth = {
  signIn: async (username: string, password: string) => {
    console.log('🔐 Mock sign in:', username);
    return {
      userId: 'local-user-123',
      username,
      email: `${username}@local.dev`,
      token: 'mock-jwt-token'
    };
  },
  signOut: async () => {
    console.log('👋 Mock sign out');
    return true;
  },
  getCurrentUser: async () => {
    return {
      userId: 'local-user-123',
      username: 'testuser',
      email: 'testuser@local.dev'
    };
  }
};

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeAmplify();
}