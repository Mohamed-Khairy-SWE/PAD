// Create a custom Error Handler to have detailed information about the error
class AppError extends Error {
  name = 'Error';
  statusCode = 500;
  status = 'Error';
  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
