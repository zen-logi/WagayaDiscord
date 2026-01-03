import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-screen flex-col items-center justify-center bg-red-900 p-8 text-white text-left">
                    <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                    <div className="w-full max-w-4xl overflow-auto rounded bg-black/50 p-4 font-mono text-sm">
                        <p className="text-red-300 font-bold">{this.state.error?.toString()}</p>
                        <pre className="mt-2 text-gray-300 whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
