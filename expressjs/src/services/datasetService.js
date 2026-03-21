import fs from "fs";
import { uuidv4, readFilesSync } from "../helpers/misc.js";
import datasetImageRepository from "../repositories/datasetImageRepository.js";
import datasetClassRepository from "../repositories/datasetClassRepository.js";

const dirname = "./src/public/dataset";

function splitPathParts(filepath) {
    return filepath.split(/[\\/]/);
}

async function listDatasetImagesDB(tenantID) {
    await datasetClassRepository.doesTableExist(tenantID);
    await datasetImageRepository.doesTableExist(tenantID);
    
    let datasetClasses = await datasetClassRepository.getDatasetClasses(tenantID);
    let datasetImages = await datasetImageRepository.getDatasetImages(tenantID);

    const groups = [];

    const findGroup = (id) => {
        for (const group of groups) {
            if (group.id === id) {
                return group;
            }
        }

        return null;
    };

    for (const cls of datasetClasses) {
        groups.push({ id: cls.id, name: cls.name, data: [] });
    }

    for (const img of datasetImages) {
        const parts = splitPathParts(img.path);
        let folder = parts[parts.length - 2] || "";
        const folderParts = folder.split("_");
        const datasetClassID = folderParts[0];
        const datasetClassName = folderParts.slice(1).join("_");
        const fullFileName = parts[parts.length - 1] || "";
        const fileParts = fullFileName.split("_");
        const fileID = fileParts[1].split(".")[0];
        const fileExt = fullFileName.split(".")[1];

        const group = findGroup(datasetClassID);
        const item = {
            id: fileID,
            name: fullFileName,
            ext: fileExt,
        };
        if (group) {
            group.data.push(item);
        }
    }

    return groups;
}

async function listDatasetImagesFiles(tenantID) {
    await datasetClassRepository.doesTableExist(tenantID);
    await datasetImageRepository.doesTableExist(tenantID);

    const files = readFilesSync(dirname);
    const groups = [];

    const findGroup = (id) => {
        for (const group of groups) {
            if (group.id === id) {
                return group;
            }
        }

        return null;
    };

    for (const file of files) {
        if (file.type === "folder") {
            const parts = splitPathParts(file.filepath);
            let folder = parts[parts.length - 1] || "";
            const folderParts = folder.split("_");
            const id = folderParts[0];
            const name = folderParts.slice(1).join("_");

            const group = findGroup(id);
            if (!group) {
                groups.push({ id, name, data: [] });
            }
        }
        else {
            const parts = splitPathParts(file.filepath);
            let folder = parts[parts.length - 2] || "";
            const folderParts = folder.split("_");
            const id = folderParts[0];
            const name = folderParts.slice(1).join("_");

            const group = findGroup(id);
            const item = {
                name: file.name,
                ext: file.ext,
            };

            if (!group) {
                groups.push({ id, name, data: [item] });
            } else {
                group.data.push(item);
            }
        }
    }

    return groups;
}

function saveDatasetImages(tenantID, images = []) {
    const saved = [];

    for (const group of images) {
        const { id, name, data } = group;
        const imageId = uuidv4();
        saved.push({ id, name, uuid: imageId });
        const dir = `${dirname}/${id}_${name}`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const dataIndex = data.indexOf(",");
        const payload = dataIndex >= 0 ? data.substring(dataIndex + 1) : data;
        const buffer = Buffer.from(payload, "base64");

        fs.writeFileSync(`${dir}/${name}_${imageId}.png`, buffer);

        datasetImageRepository.insertDatasetImage(tenantID, { id: imageId, dataset_class_id: id, path: `${dir}/${name}_${imageId}.png`, created_at: new Date(), updated_at: new Date(), deleted_at: null });
    }

    return saved;
}

function getDatasetClass(tenantID, id) {
    return datasetClassRepository.getDatasetClassById(tenantID, id);
}

function createDatasetClass(tenantID, name) {
    const trimmedName = String(name || "").trim();

    if (!trimmedName) {
        const error = new Error("Class name is required");
        error.statusCode = 400;
        throw error;
    }

    const id = uuidv4();
    const dir = `${dirname}/${id}_${trimmedName}`;

    datasetClassRepository.insertDatasetClass(tenantID, { id, name: trimmedName, created_at: new Date(), updated_at: new Date(), deleted_at: null });

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return {
        id,
        name: trimmedName,
        folder: `${id}_${trimmedName}`,
    };
}

function deleteDatasetClassFile(tenantID, folder, filename) {
    const filePath = `${dirname}/${folder}/${filename}`;
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    let id = filename.split("_")[1].replaceAll(".png", "");
    datasetImageRepository.deleteDatasetImageById(tenantID, id);
}

function deleteDatasetClassFolder(tenantID, folder) {
    const folderPath = `${dirname}/${folder}`;
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
    }

    let id = folder.split("_")[0];
    datasetClassRepository.deleteDatasetClassById(tenantID, id);
}

export default {
    listDatasetImagesDB,
    listDatasetImagesFiles,
    saveDatasetImages,
    createDatasetClass,
    deleteDatasetClassFile,
    deleteDatasetClassFolder,
    getDatasetClass,
};