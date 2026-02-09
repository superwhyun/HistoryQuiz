import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 에러 핸들링
window.onerror = (msg, url, line, col, error) => {
  console.error('Global error:', { msg, url, line, col, error });
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h2>⚠️ 오류가 발생했습니다</h2>
        <p>${msg}</p>
        <p>Line: ${line}, Col: ${col}</p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error?.stack || ''}</pre>
      </div>
    `;
  }
};

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found!');
} else {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('App rendered successfully');
  } catch (e) {
    console.error('Failed to render app:', e);
    root.innerHTML = `<div style="padding: 20px;"><h2>렌더링 오류</h2><pre>${e}</pre></div>`;
  }
}
