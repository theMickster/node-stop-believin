export interface UpdateBookDto {
  id: string;
  name: string;
  authors: UpdateBookAuthorDto[];
}

interface UpdateBookAuthorDto{
    authorId: string;
    firstName: string;
    lastName: string;
}