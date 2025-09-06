// Suppress dotenv verbose logging during tests
// dotenv v17+ outputs promotional "tips" that clutter test output
const originalConsoleLog = console.log;
console.log = (...args: unknown[]) => {
  // Filter out dotenv promotional messages
  const firstArg = args[0];
  if (typeof firstArg === 'string' && firstArg.includes('[dotenv@')) {
    return;
  }
  originalConsoleLog(...args);
};

// Mock uuid module to avoid ESM issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-42d3-a456-426614174000'),
}));
