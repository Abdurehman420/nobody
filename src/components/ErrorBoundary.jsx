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
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: '#220022', // Dark purple to match user report?
                    color: '#FFF',
                    padding: '20px',
                    fontFamily: 'monospace',
                    zIndex: 10000,
                    overflow: 'auto'
                }}>
                    <h1>⚠️ CRITICAL SYSTEM FAILURE ⚠️</h1>
                    <h2 style={{ color: '#FF0055' }}>{this.state.error?.toString()}</h2>
                    <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
                        {this.state.errorInfo?.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            background: '#00FF00',
                            color: 'black',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        REBOOT SYSTEM
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
