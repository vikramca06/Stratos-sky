import { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FileExplorer } from './components/FileExplorer';
import { TrashView } from './components/TrashView';
import { SharedView } from './components/SharedView';
import { SecureRoomView } from './components/SecureRoomView';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationProvider } from './contexts/NotificationContext';
import { FileProvider } from './contexts/FileContext';
import { UploadQueueProvider } from './contexts/UploadQueueContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { authService } from './services/authService';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <ThemeProvider>
          <NotificationProvider>
            <FileProvider>
              <UploadQueueProvider>
                <Router>
                  <Layout user={user} signOut={signOut}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/files" replace />} />
                      <Route path="/files" element={<FileExplorer />} />
                      <Route path="/files/:folderId" element={<FileExplorer />} />
                      <Route path="/trash" element={<TrashView />} />
                      <Route path="/shared" element={<SharedView />} />
                      <Route path="/secure-rooms" element={<SecureRoomView />} />
                      <Route path="/secure-rooms/:roomId" element={<SecureRoomView />} />
                      <Route path="/settings" element={<ProfileSettings />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                  </Layout>
                </Router>
              </UploadQueueProvider>
            </FileProvider>
          </NotificationProvider>
        </ThemeProvider>
      )}
    </Authenticator>
  );
}

export default App;