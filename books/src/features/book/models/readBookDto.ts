export interface ReadBookDto {
  id: string;
  name: string;
  authors: ReadAuthorDto[]
}

interface ReadAuthorDto{
    authorId: string;
    firstName: string;
    lastName: string;
}