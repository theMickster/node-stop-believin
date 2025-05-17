export type CommandResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
};

export function commandOk<T>(data?: T): CommandResult<T> {
  return data === undefined ? { success: true } : { success: true, data };
}

export function commandFail<T = undefined>(error: string, code?: string): CommandResult<T> {
  return { success: false, error, ...(code ? { code } : {}) };
}

export function isCommandOk<T>(result: CommandResult<T>): result is { success: true; data?: T } {
  return result.success === true;
}

export function isCommandFail<T>(result: CommandResult<T>): result is { success: false; error: string } {
  return result.success === false;
}
