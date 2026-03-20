import db from "../persistence/mysql.js";

async function getDatasetImages() {
    return db.query("SELECT * FROM dataset_image");
}

async function getDatasetImageById(id) {
    const rows = await db.query("SELECT * FROM dataset_image WHERE id=?", [id]);
    return rows[0];
}

async function insertDatasetImage(item) {
    await db.query("INSERT INTO dataset_image (id, path, dataset_class_id, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)", [item.id, item.path, item.dataset_class_id, item.created_at, item.updated_at, item.deleted_at]);
}

async function updateDatasetImageById(id, item) {
    await db.query("UPDATE dataset_image SET path=?, dataset_class_id=?, updated_at=? WHERE id=?", [item.path, item.dataset_class_id, item.updated_at, id]);
}

async function deleteDatasetImageById(id) {
    await db.query("DELETE FROM dataset_image WHERE id = ?", [id]);
}

export default {
    getDatasetImages,
    getDatasetImageById,
    insertDatasetImage,
    updateDatasetImageById,
    deleteDatasetImageById,
};