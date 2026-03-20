import userRepository from "../repositories/userRepository.js";

async function getUsers() {
    return userRepository.getUsers();
}

async function getUser(id) {
    return userRepository.getUserById(id);
}

async function storeUser(item) {
    await userRepository.insertUser(item);
}

async function updateUser(id, item) {
    await userRepository.updateUserById(id, item);
}

async function removeUser(id) {
    await userRepository.deleteUserById(id);
}

export default {
    getUsers,
    getUser,
    storeUser,
    updateUser,
    removeUser,
};
