import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', background: '#fff', color: '#c00', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <strong>ERRO:</strong>{'\n'}{String(this.state.error)}{'\n'}{this.state.error?.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
