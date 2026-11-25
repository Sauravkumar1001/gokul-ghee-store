import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

window.scrollTo = () => {};
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

beforeEach(() => {
  window.localStorage.clear();
});
