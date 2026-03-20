import db from "../persistence/mysql.js";

async function getUsers() {
    return db.query("SELECT * FROM user");
}

async function getUserById(id) {
    const rows = await db.query("SELECT * FROM user WHERE id=?", [id]);
    return rows[0];
}

async function getUserByEmail(email) {
    const rows = await db.query("SELECT * FROM user WHERE email=? AND deleted_at IS NULL", [email]);
    return rows[0];
}

async function getUserByAccessToken(accessToken) {
    const rows = await db.query("SELECT * FROM user WHERE access_token=? AND deleted_at IS NULL", [accessToken]);
    return rows[0];
}

async function insertUser(item) {
    await db.query("INSERT INTO user (id, name, email, password, tenant_id, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
        item.id,
        item.name,
        item.email,
        item.password,
        item.tenant_id,
        item.created_at,
        item.updated_at,
        item.deleted_at,
    ]);
}

async function updateUserById(id, item) {
    await db.query("UPDATE user SET name=?, email=?, password=?, tenant_id=?, updated_at=? WHERE id=?", [
        item.name,
        item.email,
        item.password,
        item.tenant_id,
        item.updated_at,
        id,
    ]);
}

async function updateUserAccessTokenById(id, accessToken) {
    await db.query("UPDATE user SET access_token=?, updated_at=? WHERE id=?", [accessToken, new Date(), id]);
}

async function deleteUserById(id) {
    await db.query("UPDATE user SET deleted_at=? WHERE id = ?", [new Date(), id]);
}

export default {
    getUsers,
    getUserById,
    getUserByEmail,
    getUserByAccessToken,
    insertUser,
    updateUserById,
    updateUserAccessTokenById,
    deleteUserById,
};
