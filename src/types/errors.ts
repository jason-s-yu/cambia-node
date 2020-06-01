export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class EmptyInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmptyInputError';
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

export class AlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FieldAlreadyExistsError';
  }
}