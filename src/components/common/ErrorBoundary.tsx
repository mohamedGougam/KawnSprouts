import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Kawn Sprouts error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-cozy-cream p-6 text-center">
          <div className="max-w-sm rounded-3xl bg-white p-8 shadow-lg">
            <div className="mb-4 text-4xl" aria-hidden="true">
              🌱
            </div>
            <h1 className="mb-2 text-xl font-bold text-gray-800">Something went gently wrong</h1>
            <p className="mb-6 text-sm text-gray-600">
              Your garden is safe. Try refreshing the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="focus-ring rounded-full bg-mint-400 px-6 py-3 font-semibold text-white"
            >
              Refresh garden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
