import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-error">!</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-3">Something went wrong</h1>
            <p className="text-surface-500 mb-8">
              An unexpected error occurred. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Reload Page
              </button>
              <Link
                to="/"
                className="btn-secondary"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
