import db from "../persistence/mysql.js";

async function getItems() {
    return db.query("SELECT * FROM todo_items");
}

async function getItemById(id) {
    const rows = await db.query("SELECT * FROM todo_items WHERE id=?", [id]);
    return rows[0];
}

async function insertItem(item) {
    await db.query("INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)", [item.id, item.name, item.completed ? 1 : 0]);
}

async function updateItemById(id, item) {
    await db.query("UPDATE todo_items SET name=?, completed=? WHERE id=?", [item.name, item.completed ? 1 : 0, id]);
}

async function deleteItemById(id) {
    await db.query("DELETE FROM todo_items WHERE id = ?", [id]);
}

export default {
    getItems,
    getItemById,
    insertItem,
    updateItemById,
    deleteItemById,
};