import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-dark-bg text-white p-8">
          <div className="text-center max-w-2xl">
            <h1 className="text-2xl font-bold text-danger mb-4">Bir Hata Oluştu</h1>
            <div className="bg-dark-surface rounded-lg p-4 mb-4 text-left">
              <h3 className="text-lg font-semibold mb-2">Hata Detayları:</h3>
              <pre className="text-sm text-text-muted overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-cyber-green">Stack Trace</summary>
                  <pre className="text-xs text-text-muted mt-2 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyber-green text-dark-bg rounded-lg hover:bg-cyber-green/80 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;