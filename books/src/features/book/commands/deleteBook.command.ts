import { ICommand } from "libs/cqrs/command";

export class DeleteBookCommand implements ICommand {
  constructor(public readonly id: string) {}
}
