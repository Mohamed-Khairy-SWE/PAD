// Convert Date from normal input field form to ISO string
export const convertToIsoString = (date: string): string =>
  new Date(date).toISOString();
