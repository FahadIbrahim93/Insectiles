import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Bootstrap React App
const container = document.getElementById('ui-root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
  console.log('[BOOTSTRAP] Insectiles App Initialized');
} else {
  console.error('[BOOTSTRAP] No ui-root container found!');
}