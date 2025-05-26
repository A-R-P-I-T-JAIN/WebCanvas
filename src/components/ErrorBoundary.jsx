import React from "react";
import { toast } from "react-toastify";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    toast.error("Something went wrong. Please try again.");
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try refreshing the page.</h2>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
