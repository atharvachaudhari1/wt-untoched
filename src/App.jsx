import { Component } from 'react';
import Lanyard from './components/Lanyard';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) {
    return { error: e };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Lanyard failed to load</h2>
          <p>Add <strong>card.glb</strong> and <strong>lanyard.png</strong> to <code>src/assets/lanyard/</code></p>
          <p style={{ color: '#666', fontSize: 14 }}>{String(this.state.error?.message ?? this.state.error)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ErrorBoundary>
        <Lanyard position={[0, 0, 24]} gravity={[0, -40, 0]} />
      </ErrorBoundary>
    </div>
  );
}
