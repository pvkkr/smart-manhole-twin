import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Fatal initialization error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ backgroundColor: '#0a0d12', color: '#f43f5e', padding: '32px', fontFamily: 'monospace', minHeight: '100vh', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#00f0ff', fontSize: '18px', marginBottom: '8px' }}>
            SMART MANHOLE // DIAGNOSTIC CATCH
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
            The application encountered an uncaught runtime exception:
          </p>
          <pre style={{ backgroundColor: '#11161d', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', color: '#fb7185', fontSize: '12px', overflowX: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#00f0ff', color: '#0a0d12', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
)
