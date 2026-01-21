export const generateTicketId = (sequence: number) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const yearPart = String(year).slice(-2).padStart(2, "0");
  const monthPart = String(month + 1)
    .slice(-2)
    .padStart(2, "0");
  const lengthPart = String(sequence).padStart(4, "0");
  return `TK-${yearPart}${monthPart}-${lengthPart}`;
};
