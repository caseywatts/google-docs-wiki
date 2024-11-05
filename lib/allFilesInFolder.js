import { getRootFolder, filesAndFoldersFetcher, populateMarkdown, writeToFiles } from "./googleDriveFilesFromFolder.js";
import * as fs from "fs";

const FOLDER_ID = fs.readFileSync("./FOLDER_ID", "utf8");

const rootFolder = await getRootFolder(FOLDER_ID);
// console.log(rootFolder);
const filesAndFolders = await filesAndFoldersFetcher(rootFolder);
// console.log(filesAndFolders);
const ffwm = await populateMarkdown(filesAndFolders);
// console.log(ffwm);
// console.log("ROOT FILES AND FOLDERS");
// console.log(ffwm);
// console.log("FIRST FOLDER DETAILS");
// console.log(ffwm.folders[0]);

writeToFiles(ffwm);
