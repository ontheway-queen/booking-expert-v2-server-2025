import {} from '';
declare global {
  namespace Express {
    interface Request {
      upFiles: string[];
    }
  }
}
