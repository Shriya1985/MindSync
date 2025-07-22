import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class DataContextErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DataContext error caught:', error, errorInfo);
    
    // Reset error state after a short delay to allow recovery
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 1000);
  }

  public render() {
    if (this.state.hasError) {
      // Return a minimal fallback UI
      return (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">Loading your data...</p>
        </div>
      );
    }

    return this.props.children;
  }
}
