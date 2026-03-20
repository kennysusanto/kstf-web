import db from "../persistence/mysql.js";

async function getTenants() {
    return db.query("SELECT * FROM tenant");
}

async function getTenantById(id) {
    const rows = await db.query("SELECT * FROM tenant WHERE id=?", [id]);
    return rows[0];
}

async function insertTenant(item) {
    await db.query("INSERT INTO tenant (id, name, display_name, parent_id, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        item.id,
        item.name,
        item.display_name,
        item.parent_id,
        item.created_at,
        item.updated_at,
        item.deleted_at,
    ]);
}

async function updateTenantById(id, item) {
    await db.query("UPDATE tenant SET name=?, display_name=?, parent_id=?, updated_at=? WHERE id=?", [
        item.name,
        item.display_name,
        item.parent_id,
        item.updated_at,
        id,
    ]);
}

async function deleteTenantById(id) {
    await db.query("UPDATE tenant SET deleted_at=? WHERE id = ?", [new Date(), id]);
}

export default {
    getTenants,
    getTenantById,
    insertTenant,
    updateTenantById,
    deleteTenantById,
};
