import fs from "fs";
import path from "path";
import { readFilesSync2, uuidv4 } from "../helpers/misc.js";
import tenantRepository from "../repositories/tenantRepository.js";
import modelRepository from "../repositories/modelRepository.js";

const dirname = "./src/public/model";

async function assertTenant(tenantID) {
    const tenant = await tenantRepository.getTenantById(tenantID);
    if (!tenant) {
        const error = new Error("Tenant not found");
        error.statusCode = 404;
        throw error;
    }
    return tenant;
}

function extractUidFromFolder(folder) {
    const normalized = String(folder || "").trim();
    if (!normalized) {
        return "";
    }

    if (!normalized.includes("_")) {
        return normalized;
    }

    const parts = normalized.split("_");
    return parts[parts.length - 1];
}

function listModelFilesFromFolder(folderName) {
    const folderPath = path.resolve(dirname, folderName);
    const files = fs.existsSync(folderPath) ? readFilesSync2(folderPath) : [];

    const result = {
        model: null,
        weights: null,
    };

    for (const file of files) {
        if (file.ext === ".json") {
            result.model = {
                name: file.name,
                ext: file.ext,
            };
        } else if (file.ext === ".bin") {
            result.weights = {
                name: file.name,
                ext: file.ext,
            };
        }
    }

    return result;
}

async function listModels(tenantID) {
    await assertTenant(tenantID);
    await modelRepository.doesTableExist(tenantID);

    const models = await modelRepository.getModels(tenantID);
    // const toReturn = [];

    // for (const model of models) {
    //     // const files = listModelFilesFromFolder(model.folder);
    //     toReturn.push({
    //         uid: model.uid,
    //         modelName: model.model_name,
    //         model: files.model ? { uid: model.uid, ...files.model } : undefined,
    //         weights: files.weights ? { uid: model.uid, ...files.weights } : undefined,
    //     });
    // }

    return models;
}

async function saveModelFiles(files = []) {
    const uid = uuidv4();
    const folder = uid;
    const folderPath = path.resolve(dirname, folder);

    fs.mkdirSync(dirname, { recursive: true });
    fs.mkdirSync(folderPath, { recursive: true });

    const filesToReturn = [];
    for (const file of files) {
        const tempPath = path.resolve(dirname, file.filename);
        if (!fs.existsSync(tempPath)) {
            continue;
        }

        const newPath = path.resolve(folderPath, file.originalname);
        fs.renameSync(tempPath, newPath);

        filesToReturn.push({
            filename: file.originalname,
        });
    }

    // await modelRepository.insertModel(tenantID, {
    //     id: uid,
    //     model_name: uid,
    //     path: folder,
    //     created_at: new Date(),
    //     updated_at: new Date(),
    //     deleted_at: null,
    // });

    return {
        uuid: uid,
        files: filesToReturn,
    };
}

async function renameModel(tenantID, oldName, newName) {
    let tenant = await assertTenant(tenantID);
    await modelRepository.doesTableExist(tenantID);

    const safeOldName = String(oldName || "").trim();
    const safeNewName = String(newName || "").trim();

    if (!safeOldName || !safeNewName) {
        const error = new Error("oldName and newName are required");
        error.statusCode = 400;
        throw error;
    }

    let newTenantFolder = `${tenant.id}_${tenant.name}`;
    let newTenantFolderPath = path.resolve(dirname, newTenantFolder);
    fs.mkdirSync(newTenantFolderPath, { recursive: true });

    const targetFolder = `${newTenantFolder}/${oldName}_${safeNewName}`;
    const oldPath = path.resolve(dirname, oldName);
    const newPath = path.resolve(dirname, targetFolder);
    fs.renameSync(oldPath, newPath);

    const dir = `${dirname}/${targetFolder}`;

    await modelRepository.insertModel(tenant.id, {
        id: oldName,
        model_name: safeNewName,
        path: dir,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    });

    return {
        message: "success",
    };
}

async function deleteModel(tenantID, folderName) {
    let tenant = await assertTenant(tenantID);
    await modelRepository.doesTableExist(tenantID);

    const uid = extractUidFromFolder(folderName);
    const existing = await modelRepository.getModelById(tenantID, uid);
    if (!existing) {
        const error = new Error("Model not found");
        error.statusCode = 404;
        throw error;
    }

    const dir = path.resolve(dirname, existing.path);
    fs.rmSync(dir, { recursive: true, force: true });

    await modelRepository.deleteModelById(tenantID, uid);
}

export default {
    listModels,
    saveModelFiles,
    renameModel,
    deleteModel,
};
