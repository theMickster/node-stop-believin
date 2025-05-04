export interface Author {
    authorId: string;
    firstName: string;
    lastName: string;
}

export function mapToAuthor(document: any): Author {
  return {
    authorId: document.authorId,
    firstName: document.firstName,
    lastName: document.lastName
  };
}

