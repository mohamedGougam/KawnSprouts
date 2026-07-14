import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRouter } from './app/router/AppRouter';
import './styles/index.css';

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('dev') && window.location.pathname === '/') {
      // Dev simulator accessible via /dev/simulator?dev
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
