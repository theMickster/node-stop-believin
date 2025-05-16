import { errorHandler, AppError } from "./errorHandler";
import { Request, Response, NextFunction } from "express";

describe("errorHandler middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(), 
      json: jest.fn()
    };
    next = jest.fn();

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should respond with error details using provided error status in non-development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "QA"; 

    const error: AppError = new Error("Test error");
    error.status = 400;
    error.stack = "dummy stack trace";

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: "Test error"
    });
    expect(console.error).toHaveBeenCalled();
    process.env.NODE_ENV = originalEnv;
  });

  it("should default to status 500 when error.status is undefined", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "QA"; 

    const error: AppError = new Error("No status error");
    
    error.stack = "dummy stack";

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: "No status error"
    });
    process.env.NODE_ENV = originalEnv;
  });

  it("should include stack trace in response in development environment", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const error: AppError = new Error("Dev error");
    error.status = 403;
    error.stack = "dev stack trace";

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      message: "Dev error",
      stack: "dev stack trace"
    });
    process.env.NODE_ENV = originalEnv;
  });

  it("should set an empty stack string when error.stack is undefined in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const error: AppError = new Error("Error with no stack");
    error.status = 404;
    
    error.stack = undefined as any; 

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: "Error with no stack",
      stack: ""
    });
    process.env.NODE_ENV = originalEnv;
  });

  it("should fall back to the default error message when error.message is empty", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "Prod"; 

    const error: AppError = new Error("");
    
    error.stack = "some stack";

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: "Internal Server Error"
    });
    process.env.NODE_ENV = originalEnv;
  });

  it("should not call next()", () => {
    const error: AppError = new Error("No next call");
    errorHandler(error, req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
  });
});
