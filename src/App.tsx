import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { Authenticator } from '@aws-amplify/ui-react'
import { uploadData, getUrl } from 'aws-amplify/storage'
import '@aws-amplify/ui-react/styles.css'
import type { Schema } from '../amplify/data/resource'
import './App.css'

const client = generateClient<Schema>()

function App() {
  const [files, setFiles] = useState<Array<Schema['File']['type']>>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Subscribe to file changes
    const subscription = client.models.File.observeQuery().subscribe({
      next: (data) => setFiles([...data.items]),
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Upload to S3
      const key = `uploads/${Date.now()}-${file.name}`
      const result = await uploadData({
        key,
        data: file,
        options: {
          contentType: file.type,
        }
      }).result

      // Create database record
      await client.models.File.create({
        name: file.name,
        key: result.key,
        size: file.size,
        type: file.type || 'application/octet-stream',
      })

      alert('File uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const createFolder = async () => {
    const name = window.prompt('Folder name:')
    if (name) {
      await client.models.File.create({
        name,
        key: `folders/${Date.now()}-${name}`,
        isFolder: true,
        size: 0,
      })
    }
  }

  const deleteFile = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await client.models.File.delete({ id })
    }
  }

  const downloadFile = async (file: Schema['File']['type']) => {
    try {
      const url = await getUrl({
        key: file.key,
        options: {
          expiresIn: 3600 // 1 hour
        }
      })
      
      window.open(url.url.toString(), '_blank')
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app">
          <header className="app-header">
            <h1>⛅ Stratos Cloud Storage</h1>
            <div className="user-info">
              <span>Welcome, {user?.signInDetails?.loginId || 'User'}</span>
              <button onClick={signOut} className="sign-out-btn">
                Sign Out
              </button>
            </div>
          </header>

          <main className="app-main">
            <div className="toolbar">
              <label className={`upload-btn ${uploading ? 'uploading' : ''}`}>
                {uploading ? 'Uploading...' : '📤 Upload File'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              <button onClick={createFolder} className="folder-btn">
                📁 New Folder
              </button>
            </div>

            <div className="file-grid">
              {files.length === 0 ? (
                <div className="empty-state">
                  <p>📂 No files yet</p>
                  <p>Upload your first file to get started!</p>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="file-card">
                    <div className="file-icon">
                      {file.isFolder ? '📁' : '📄'}
                    </div>
                    <div className="file-info">
                      <h3>{file.name}</h3>
                      {!file.isFolder && (
                        <p className="file-size">
                          {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                        </p>
                      )}
                    </div>
                    <div className="file-actions">
                      {!file.isFolder && (
                        <button
                          onClick={() => downloadFile(file)}
                          className="action-btn download"
                          title="Download"
                        >
                          ⬇
                        </button>
                      )}
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="action-btn delete"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      )}
    </Authenticator>
  )
}

export default App