import { Component, type ReactNode } from 'react';
import { LogoMark } from './Logo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="bg-surface border border-border rounded-2xl p-10 max-w-sm w-full shadow-card">
          <div className="flex justify-center mb-5">
            <LogoMark size={48} />
          </div>
          <h2 className="font-display font-bold text-primary text-xl mb-2">Something went wrong</h2>
          <p className="font-sans text-sm text-muted mb-6">
            We couldn't load this section — please refresh.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm py-3 px-6 rounded-xl transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
}
