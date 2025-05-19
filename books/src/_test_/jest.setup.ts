jest.mock('applicationinsights', () => {
  const track = jest.fn();
  const client = {
    trackTrace: track,
    trackException: track,
    context: { tags: {} },
  };
  return {
    setup: jest.fn().mockReturnValue({
      setAutoCollectConsole: jest.fn().mockReturnThis(),
      setAutoCollectDependencies: jest.fn().mockReturnThis(),
      setAutoCollectRequests: jest.fn().mockReturnThis(),
      setAutoCollectExceptions: jest.fn().mockReturnThis(),
      start: jest.fn(),
    }),
    defaultClient: client,
  };
});
