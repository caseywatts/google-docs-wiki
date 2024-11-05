// Tips
// https://stackoverflow.com/questions/24720075/how-to-get-list-of-files-by-folder-on-google-drive-api
// https://stackoverflow.com/questions/18116152/how-do-i-get-a-file-list-for-a-google-drive-public-hosted-folder
//
// API Docs
// https://developers.google.com/drive/api/guides/search-files

import fs from "fs";
import path from "path";
const API_KEY = fs.readFileSync("./API_KEY", "utf8");

export async function getRootFolder(folderId) {
  const fetchURL = `https://www.googleapis.com/drive/v3/files/${folderId}?key=${API_KEY}`;
  return await (await fetch(fetchURL)).json();
}

export async function filesAndFoldersFetcher(folder) {
  const q = `'${folder.id}'+in+parents+and+trashed+=+false`;
  const fetchURL = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${API_KEY}`;
  const resultFiles = (await (await fetch(fetchURL)).json()).files;
  const files = resultFiles.filter((r) => r.mimeType === "application/vnd.google-apps.document");
  const folders = resultFiles.filter((r) => r.mimeType === "application/vnd.google-apps.folder");
  const foldersWithFiles = await Promise.all(
    folders.map(async (folder) => {
      return await filesAndFoldersFetcher(folder);
    })
  );
  return {
    ...folder,
    folders: foldersWithFiles,
    files: files,
  };
}

async function fetchMarkdown(fileId) {
  const mdUrl = `https://docs.google.com/document/d/${fileId}/export?format=md`;
  const markdown = await (await fetch(mdUrl)).text();
  return markdown;
}

function editUrl(fileId) {
  return `https://docs.google.com/document/d/${fileId}/edit`;
}

export async function populateMarkdown(filesAndFolders) {
  const filesWithMarkdown = await Promise.all(
    filesAndFolders.files.map(async (file) => {
      const markdown = await fetchMarkdown(file.id);
      return {
        ...file,
        markdown: markdown,
        editUrl: editUrl(file.id),
      };
    })
  );
  const populatedFolders = await Promise.all(
    filesAndFolders.folders.map(async (filesAndFolders) => {
      return populateMarkdown(filesAndFolders);
    })
  );
  return {
    ...filesAndFolders,
    files: filesWithMarkdown,
    folders: populatedFolders,
  };
}

export async function getAllMarkdown(folderId) {
  let filesAndFolders = await filesAndFoldersFetcher(folderId);
  const filesAndFoldersWithMarkdown = populateMarkdown(filesAndFolders);
  return filesAndFoldersWithMarkdown;
}

export async function writeToFiles(filesAndFolders, destinationFolder) {
  filesAndFolders.files.forEach((file) => {
    const filePath = `${destinationFolder}/${file.name}.md`;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, file.markdown);
  });
  filesAndFolders.folders.forEach((folder) => {
    writeToFiles(folder, `${destinationFolder}/${folder.name}/`);
  });
}

export async function fetchAllMarkdown(folderId, destinationFolder) {
  const rootFolder = await getRootFolder(folderId);
  const filesAndFolders = await filesAndFoldersFetcher(rootFolder);
  const filesAndFoldersWithMarkdown = await populateMarkdown(filesAndFolders);
  writeToFiles(filesAndFoldersWithMarkdown, destinationFolder);
}
