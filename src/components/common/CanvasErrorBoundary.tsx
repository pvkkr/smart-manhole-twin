import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[3D Canvas Error Caught]', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-graphite-950 text-slate-300 font-mono text-xs border border-slate-800 rounded-xl">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 mb-3">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">
            {this.props.fallbackTitle || '3D WebGL Viewport Suspended'}
          </h3>
          <p className="text-slate-400 text-[11px] max-w-md text-center mb-4 leading-relaxed">
            Your browser (e.g. Brave Shields or hardware acceleration settings) restricted WebGL canvas context creation.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-scada-cyan/20 hover:bg-scada-cyan/30 text-scada-cyan border border-scada-cyan/50 rounded-lg flex items-center gap-2 font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry 3D Initializer</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
