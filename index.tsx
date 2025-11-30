import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Render a fallback
  root.render(
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Application Error</h1>
      <p>Failed to initialize the application. Please refresh the page.</p>
      <pre style={{ textAlign: 'left', overflow: 'auto', maxHeight: '300px' }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );
}
