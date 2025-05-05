export interface CreateBookDto {
  name: string;
  authors: CreateBookAuthorDto[]
}

interface CreateBookAuthorDto{
    authorId: string;
    firstName: string;
    lastName: string;
}