import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Ensure deterministic UI for automated e2e: clear persisted store when driven by WebDriver
if (typeof window !== 'undefined') {
  try {
    // Playwright sets navigator.webdriver = true
    if ((navigator as any).webdriver) {
      localStorage.removeItem('camera-filter-storage');
    }
  } catch { }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

async function bootstrap() {
  // Dynamically import App after potential store cleanup to avoid early hydration
  const { default: App } = await import('./pages/App');
  const { UIProvider } = await import('./components/ui/UIProvider');
  root.render(
    <React.StrictMode>
      <UIProvider>
        <App />
      </UIProvider>
    </React.StrictMode>
  );
}

bootstrap();


