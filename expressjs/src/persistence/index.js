import mysqlPersistence from "./mysql.js";
import todoService from "../services/todoService.js";

export default {
	init: mysqlPersistence.init,
	teardown: mysqlPersistence.teardown,
	getItems: todoService.getItems,
	getItem: todoService.getItem,
	storeItem: todoService.storeItem,
	updateItem: todoService.updateItem,
	removeItem: todoService.removeItem,
};
