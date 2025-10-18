import { ICommand } from './command';
import { CommandResult } from './commandResult';

export interface ICommandHandler<TCommand extends ICommand, TResult> {
  handle(command: TCommand): Promise<CommandResult<TResult>>;
}
