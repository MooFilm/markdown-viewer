import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { GithubProvider } from './context/GithubContext';
import { LocaleProvider } from './context/LocaleContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import FileList from './components/FileList';
import FileViewer from './components/FileViewer';
import FileUploader from './components/FileUploader';
import Settings from './components/Settings';
import ToastContainer from './components/Toast';

const App: React.FC = () => {
  return (
    <LocaleProvider>
      <GithubProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<FileList />} />
                <Route path="settings" element={<Settings />} />
                <Route path="view/:path" element={<FileViewer />} />
                <Route path="upload" element={<FileUploader />} />
              </Route>
            </Routes>
            <ToastContainer />
          </HashRouter>
        </ToastProvider>
      </GithubProvider>
    </LocaleProvider>
  );
};

export default App;
