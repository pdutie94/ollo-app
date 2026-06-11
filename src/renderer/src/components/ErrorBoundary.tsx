import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  pageName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[ErrorBoundary${this.props.pageName ? `:${this.props.pageName}` : ""}]`, error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 40,
            gap: 16,
            background: "var(--background)",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div style={{ fontSize: 48, opacity: 0.3 }}>⚠</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            Có lỗi xảy ra
            {this.props.pageName ? ` tại ${this.props.pageName}` : ""}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#8892a4",
              margin: 0,
              maxWidth: 420,
              textAlign: "center",
            }}
          >
            {this.state.error?.message || "Unknown error"}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 8,
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #3A7BFF",
              background: "#3A7BFF",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Tải lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
