import { Author } from "@data/entities/author";

export function mapToAuthor(document: any): Author {
  return {
    authorId: document.authorId,
    firstName: document.firstName,
    lastName: document.lastName,
  };
}
