import db from "../persistence/mysql.js";

async function doesTableExist(tenantID) {
    const rows = await db.query("SHOW TABLES LIKE ?", [getTableName(tenantID)]);

    if (rows.length <= 0) {
        await createTenantTable(tenantID);
    }

    return rows.length > 0;
}

function getTableName(tenantID) {
    return `tenant_${tenantID}_model`;
}

async function createTenantTable(tenantID) {
    await db.query(`CREATE TABLE IF NOT EXISTS \`${getTableName(tenantID)}\` (id varchar(36) not null, model_name varchar(255) not null, path varchar(255) not null, created_at datetime not null, updated_at datetime, deleted_at datetime, primary key (id)) DEFAULT CHARSET utf8mb4`);
}

async function getModels(tenantID) {
    return db.query(`SELECT * FROM \`${getTableName(tenantID)}\` ORDER BY created_at DESC`);
}

async function getModelById(tenantID, id) {
    const rows = await db.query(`SELECT * FROM \`${getTableName(tenantID)}\` WHERE id=?`, [id]);
    return rows[0];
}

async function insertModel(tenantID, item) {
    await db.query(`INSERT INTO \`${getTableName(tenantID)}\` (id, model_name, path, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)`, [item.id, item.model_name, item.path, item.created_at, item.updated_at, item.deleted_at]);
}

async function updateModelById(tenantID, id, item) {
    await db.query(`UPDATE \`${getTableName(tenantID)}\` SET model_name=?, path=?, updated_at=? WHERE id=?`, [item.model_name, item.path, item.updated_at, id]);
}

async function deleteModelById(tenantID, id) {
    await db.query(`DELETE FROM \`${getTableName(tenantID)}\` WHERE id = ?`, [id]);
}

export default {
    doesTableExist,
    getTableName,
    getModels,
    getModelById,
    insertModel,
    updateModelById,
    deleteModelById,
};
