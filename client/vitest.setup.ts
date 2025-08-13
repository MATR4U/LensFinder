import '@testing-library/jest-dom';

// Polyfill ResizeObserver for Radix UI components under jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = global.ResizeObserver || ResizeObserverMock;

