/**
 * Embeddable Lanyard – mount the 3D card into the profile modal.
 * Uses static import so the component is ready when the script loads.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import Lanyard from './components/Lanyard';

let root = null;

function EmbedFallback() {
  return (
    <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
      <p>3D card failed to render.</p>
      <p><a href="/lanyard.html" target="_blank" rel="noopener" style={{ color: '#60a5fa' }}>Open in new tab</a></p>
    </div>
  );
}

class EmbedErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <EmbedFallback />;
    return this.props.children;
  }
}

window.mountLanyard = function (container) {
  if (!container) return;
  if (root) {
    try { root.unmount(); } catch (_) {}
  }
  root = createRoot(container);
  root.render(
    <EmbedErrorBoundary>
      <Lanyard
        position={[2, 4, 7]}
        gravity={[0, -40, 0]}
        fov={36}
        transparent={false}
        embedded={true}
        backgroundColor="#f1f5f9"
      />
    </EmbedErrorBoundary>
  );
};

window.unmountLanyard = function () {
  if (root) {
    try { root.unmount(); } catch (_) {}
    root = null;
  }
};

window.dispatchEvent(new Event('lanyard-embed-ready'));
