import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { GithubProvider } from './context/GithubContext';
import Layout from './components/Layout';
import FileList from './components/FileList';
import FileViewer from './components/FileViewer';
import FileUploader from './components/FileUploader';
import Settings from './components/Settings';

// Use HashRouter for GitHub Pages compatibility
const App: React.FC = () => {
  return (
    <GithubProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<FileList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="view/:path" element={<FileViewer />} />
            <Route path="upload" element={<FileUploader />} />
          </Route>
        </Routes>
      </HashRouter>
    </GithubProvider>
  );
};

export default App;
