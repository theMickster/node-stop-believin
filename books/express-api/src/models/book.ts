import { Author } from "./author";

export interface Book {
    id: string;
    BookId: string;
    Type: string;
    Name: string;
    Authors: Author[];
  }