import { signIn, signOut, signUp, confirmSignUp, getCurrentUser, fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

export const authService = {
  async login(email: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      return { isSignedIn, nextStep };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(email: string, password: string, name?: string) {
    try {
      const { userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: name || '',
          },
        },
      });
      return { userId, nextStep };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async confirmRegistration(email: string, code: string) {
    try {
      const { isSignUpComplete } = await confirmSignUp({ 
        username: email, 
        confirmationCode: code 
      });
      return isSignUpComplete;
    } catch (error) {
      console.error('Confirmation error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      return { ...user, attributes };
    } catch {
      return null;
    }
  },

  async updateProfile(updates: { name?: string; picture?: string }) {
    try {
      await updateUserAttributes({
        userAttributes: updates,
      });
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
};