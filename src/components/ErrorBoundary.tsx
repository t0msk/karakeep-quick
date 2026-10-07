import { Component, type ReactNode } from 'react';

interface ErrorBoundaryState {
    error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="flex flex-col items-center justify-center gap-2 h-[300px] px-6 text-center bg-[var(--bg-base)] text-[var(--text-tertiary)] text-[12.5px]">
                    <span className="text-[var(--text-primary)] font-medium">
                        Something went wrong.
                    </span>
                    <span className="font-mono text-[11px] break-all opacity-70">
                        {this.state.error.message}
                    </span>
                    <button
                        onClick={() => this.setState({ error: null })}
                        className="mt-1 px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-text-on)] rounded-[var(--radius-md)] text-[12px] font-semibold hover:opacity-85 transition-opacity duration-150 cursor-pointer"
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
