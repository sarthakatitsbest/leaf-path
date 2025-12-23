import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
};

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Keep logs small but useful
    console.error("ErrorBoundary caught", { name: this.props.name, error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Something went wrong while loading {this.props.name ?? "this section"}.
          </div>
        )
      );
    }

    return this.props.children;
  }
}
