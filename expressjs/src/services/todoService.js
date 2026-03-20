import todoRepository from "../repositories/todoRepository.js";

function toDomain(item) {
    if (!item) {
        return item;
    }

    return {
        ...item,
        completed: item.completed === 1 || item.completed === true,
    };
}

async function getItems() {
    const rows = await todoRepository.getItems();
    return rows.map(toDomain);
}

async function getItem(id) {
    const row = await todoRepository.getItemById(id);
    return toDomain(row);
}

async function storeItem(item) {
    await todoRepository.insertItem(item);
}

async function updateItem(id, item) {
    await todoRepository.updateItemById(id, item);
}

async function removeItem(id) {
    await todoRepository.deleteItemById(id);
}

export default {
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};