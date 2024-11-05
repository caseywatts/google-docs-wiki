import { fetchAllMarkdown } from "./googleDriveFilesFromFolder.js";
import * as fs from "fs";

const FOLDER_ID = fs.readFileSync("./FOLDER_ID", "utf8");

fetchAllMarkdown(FOLDER_ID, "src/content/docs");
