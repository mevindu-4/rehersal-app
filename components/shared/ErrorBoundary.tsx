"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <h2 className="font-display text-h2 text-foreground-primary">
              Something went wrong
            </h2>
            <p className="text-body text-foreground-secondary">
              Try refreshing the page.
            </p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Retry
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
