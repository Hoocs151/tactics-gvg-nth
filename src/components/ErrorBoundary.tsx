"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 rounded-xl max-w-md" style={{ background: "var(--surface)", border: "1px solid var(--border-active)" }}>
            <div className="text-3xl mb-4">⚠️</div>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--red)" }}>Đã xảy ra lỗi</h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              {this.state.error?.message || "Lỗi không xác định"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))", color: "var(--background)" }}
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
