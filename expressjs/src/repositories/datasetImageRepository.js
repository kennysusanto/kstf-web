import db from "../persistence/mysql.js";
import datasetClassRepository from "./datasetClassRepository.js";

async function doesTableExist(tenantID) {
    const rows = await db.query("SHOW TABLES LIKE ?", [getTableName(tenantID)]);

    if (rows.length <= 0) {
        await createTenantTable(tenantID);
    }

    return rows.length > 0;
}

function getTableName(tenantID) {
    return `tenant_${tenantID}_dataset_image`;
}

async function createTenantTable(tenantID) {
    let datasetClassTableName = datasetClassRepository.getTableName(tenantID);
    await db.query(`CREATE TABLE IF NOT EXISTS \`${getTableName(tenantID)}\` (id varchar(36) not null, dataset_class_id varchar(36) not null, path varchar(255) not null, created_at datetime not null, updated_at datetime, deleted_at datetime, primary key (id), index dataset_class_index (dataset_class_id), constraint \`fk_${datasetClassTableName}_id\` foreign key (dataset_class_id) references \`${datasetClassTableName}\`(id) on delete cascade) DEFAULT CHARSET utf8mb4`);
}

async function getDatasetImages(tenantID) {
    return db.query(`SELECT * FROM \`${getTableName(tenantID)}\``);
}

async function getDatasetImageById(tenantID, id) {
    const rows = await db.query(`SELECT * FROM \`${getTableName(tenantID)}\` WHERE id=?`, [id]);
    return rows[0];
}

async function insertDatasetImage(tenantID, item) {
    await db.query(`INSERT INTO \`${getTableName(tenantID)}\` (id, path, dataset_class_id, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)`, [item.id, item.path, item.dataset_class_id, item.created_at, item.updated_at, item.deleted_at]);
}

async function updateDatasetImageById(tenantID, id, item) {
    await db.query(`UPDATE \`${getTableName(tenantID)}\` SET path=?, dataset_class_id=?, updated_at=? WHERE id=?`, [item.path, item.dataset_class_id, item.updated_at, id]);
}

async function deleteDatasetImageById(tenantID, id) {
    await db.query(`DELETE FROM \`${getTableName(tenantID)}\` WHERE id = ?`, [id]);
}

export default {
    doesTableExist,
    getTableName,
    getDatasetImages,
    getDatasetImageById,
    insertDatasetImage,
    updateDatasetImageById,
    deleteDatasetImageById,
};