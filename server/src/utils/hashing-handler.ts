import bcrypt from 'bcrypt';

// hash any text
export const hash = (plainText: string) => bcrypt.hash(plainText, 10);

// compare the plain text is the origin of hashed text
export const compare = (plainText: string, hashedText: string) =>
  bcrypt.compare(plainText, hashedText);
