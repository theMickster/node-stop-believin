import { Request, Response } from 'express';
import { BookRepository } from "../data/bookRepository";

export class BookController {
    private repo: BookRepository;
  
    constructor(repo: BookRepository) {
      this.repo = repo;
    }
  
    async getBooks(req: Request, res: Response): Promise<void> {
        try {
          const books = await this.repo.getAll();
          res.json(books);
        } catch (err) {
          console.error('Error listing books:', err);
          res.status(500).json({ message: 'Failed to list books' });
        }
      }
  
      async getBookById(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        try {
          const book = await this.repo.getById(id);
          if (!book) {
            res.status(404).json({ error: 'Book not found' });
            return;
          }
          res.json(book);
        } catch (err: any) {
          console.error(`Error fetching book ${id}:`, err);
          res.status(500).json({ error: 'Failed to fetch book' });
        }
      }
  }