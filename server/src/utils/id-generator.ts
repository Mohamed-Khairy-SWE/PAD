import { IdType } from "../enum/IdType";

// generate an id according
export const generateId = (idType: IdType, idNumber: number) => {
  const idPrefix = idType;
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2).padStart(2, "0");
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  const idCounter = (idNumber + 1).toString().padStart(4, "0");
  const id = `${idPrefix}-${currentYear}${currentMonth}-${idCounter}`;
  return id;
};
