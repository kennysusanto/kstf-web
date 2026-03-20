import db from "../persistence/mysql.js";

async function doesTableExist(tenantID) {
    const rows = await db.query("SHOW TABLES LIKE ?", [getTableName(tenantID)]);

    if (rows.length <= 0) {
        await createTenantTable(tenantID);
    }

    return rows.length > 0;
}

function getTableName(tenantID) {
    return `tenant_${tenantID}_dataset_class`;
}

async function createTenantTable(tenantID) {
    await db.query(`CREATE TABLE IF NOT EXISTS \`${getTableName(tenantID)}\` (id varchar(36) not null, name varchar(255) not null, created_at datetime not null, updated_at datetime, deleted_at datetime, primary key (id)) DEFAULT CHARSET utf8mb4`);
}

async function getDatasetClasses(tenantID) {
    return db.query(`SELECT * FROM \`${getTableName(tenantID)}\``);
}

async function getDatasetClassById(tenantID, id) {
    const rows = await db.query(`SELECT * FROM \`${getTableName(tenantID)}\` WHERE id=?`, [id]);
    return rows[0];
}

async function insertDatasetClass(tenantID, item) {
    await db.query(`INSERT INTO \`${getTableName(tenantID)}\` (id, name, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?)`, [item.id, item.name, item.created_at, item.updated_at, item.deleted_at]);
}

async function updateDatasetClassById(tenantID, id, item) {
    await db.query(`UPDATE \`${getTableName(tenantID)}\` SET name=?, updated_at=? WHERE id=?`, [item.name, item.updated_at, id]);
}

async function deleteDatasetClassById(tenantID, id) {
    await db.query(`DELETE FROM \`${getTableName(tenantID)}\` WHERE id = ?`, [id]);
}

export default {
    doesTableExist,
    getTableName,
    getDatasetClasses,
    getDatasetClassById,
    insertDatasetClass,
    updateDatasetClassById,
    deleteDatasetClassById,
};