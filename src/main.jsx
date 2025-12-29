import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import '@/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Testar conexão com Supabase
import '@/utils/testSupabaseConnection';

// Adicionar handler global para erros não capturados
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
  console.error('Stack:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada não tratada:', event.reason);
  console.error('Stack:', event.reason?.stack);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);