import path from "path";
import config from "../config/config";
import { ROOT_DIR } from "../app";

export const getFilePath = (filename: string): string =>
  path.join(
    ROOT_DIR,
    `${config.env === "development" ? "src" : "dist"}`,
    "uploads",
    filename
  );

