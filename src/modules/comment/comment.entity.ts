export class Comment {
  constructor(
    private id: string,
    private writerId: string,
    private content: string,
    private createdAt: Date,
    private updatedAt: Date
  ) {}
}
