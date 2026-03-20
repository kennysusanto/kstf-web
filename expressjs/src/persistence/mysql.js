import waitPort from "wait-port";
import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});

let pool;

function queryPool(poolInstance, sql, values = []) {
    return new Promise((resolve, reject) => {
        poolInstance.query(sql, values, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

async function init() {
    const host = process.env.MYSQL_HOST;
    const port = Number(process.env.MYSQL_PORT || 3306);
    const user = process.env.MYSQL_USER;
    const password = process.env.MYSQL_PASSWORD;
    const database = process.env.MYSQL_DB;

    await waitPort({
        host,
        port,
        timeout: 10000,
        waitForDns: true,
    });

    const setupPool = mysql.createPool({
        connectionLimit: 1,
        host,
        port,
        user,
        password,
        charset: "utf8mb4",
    });

    await queryPool(setupPool, "CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", [database]);

    await new Promise((resolve, reject) => {
        setupPool.end((err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        port,
        user,
        password,
        database,
        charset: "utf8mb4",
    });

    await queryPool(pool, "CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean) DEFAULT CHARSET utf8mb4");
    await queryPool(pool, "CREATE TABLE IF NOT EXISTS dataset_class (id varchar(36) not null, name varchar(255) not null, created_at datetime not null, updated_at datetime, deleted_at datetime) DEFAULT CHARSET utf8mb4");

    console.log(`Connected to mysql db at host ${host}`);
}

async function teardown() {
    if (!pool) {
        return;
    }

    return new Promise((acc, rej) => {
        pool.end((err) => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function query(sql, values = []) {
    if (!pool) {
        throw new Error("MySQL pool is not initialized. Call init() first.");
    }

    return queryPool(pool, sql, values);
}

export default {
    init,
    teardown,
    query,
};
