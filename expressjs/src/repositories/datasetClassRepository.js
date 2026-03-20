import db from "../persistence/mysql.js";

async function getDatasetClasses() {
    return db.query("SELECT * FROM dataset_class");
}

async function getDatasetClassById(id) {
    const rows = await db.query("SELECT * FROM dataset_class WHERE id=?", [id]);
    return rows[0];
}

async function insertDatasetClass(item) {
    await db.query("INSERT INTO dataset_class (id, name, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?)", [item.id, item.name, item.created_at, item.updated_at, item.deleted_at]);
}

async function updateDatasetClassById(id, item) {
    await db.query("UPDATE dataset_class SET name=?, updated_at=? WHERE id=?", [item.name, item.updated_at, id]);
}

async function deleteDatasetClassById(id) {
    await db.query("DELETE FROM dataset_class WHERE id = ?", [id]);
}

export default {
    getDatasetClasses,
    getDatasetClassById,
    insertDatasetClass,
    updateDatasetClassById,
    deleteDatasetClassById,
};