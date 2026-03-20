import waitPort from "wait-port";
import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { uuidv4 } from "../helpers/misc.js";

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

    await queryPool(pool, "CREATE TABLE IF NOT EXISTS tenant (id varchar(36), name varchar(255) unique, display_name varchar(255), parent_id varchar(36), created_at datetime not null, updated_at datetime, deleted_at datetime, primary key (id), index parent_index (parent_id), constraint fk_parent_id foreign key (parent_id) references tenant(id) on delete cascade) DEFAULT CHARSET utf8mb4");
    await queryPool(pool, "CREATE TABLE IF NOT EXISTS user (id varchar(36), name varchar(255), email varchar(255) unique, password varchar(255), tenant_id varchar(36), refresh_token varchar(255), access_token varchar(255), created_at datetime not null, updated_at datetime, deleted_at datetime, primary key (id), index tenant_index (tenant_id), constraint fk_tenant_id foreign key (tenant_id) references tenant(id) on delete cascade) DEFAULT CHARSET utf8mb4");
    // await queryPool(pool, "CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, primary key (id)) DEFAULT CHARSET utf8mb4");
    // await queryPool(pool, "CREATE TABLE IF NOT EXISTS dataset_class (id varchar(36) not null, name varchar(255) not null, created_at datetime not null, updated_at datetime, deleted_at datetime, primary key (id)) DEFAULT CHARSET utf8mb4");
    // await queryPool(pool, "CREATE TABLE IF NOT EXISTS dataset_image (id varchar(36) not null, dataset_class_id varchar(36) not null, path varchar(255) not null, created_at datetime not null, updated_at datetime, deleted_at datetime, primary key (id), index dataset_class_index (dataset_class_id), constraint fk_dataset_class_id foreign key (dataset_class_id) references dataset_class(id) on delete cascade) DEFAULT CHARSET utf8mb4");
    await seed();
    console.log(`Connected to mysql db at host ${host}`);
}

async function seed() {
    await queryPool(
        pool,
        "INSERT INTO tenant (id, name, display_name, parent_id, created_at) SELECT ?, 'master-tenant', 'Master Tenant', NULL, NOW() WHERE NOT EXISTS (SELECT 1 FROM tenant WHERE name = 'master-tenant')",
        [uuidv4()]
    );
    await queryPool(
        pool,
        "INSERT INTO user (id, name, email, password, tenant_id, created_at) SELECT ?, 'Admin', 'admin@mastertenant.com', ?, t.id, NOW() FROM tenant t WHERE t.name = 'master-tenant' AND NOT EXISTS (SELECT 1 FROM user WHERE email = 'admin@mastertenant.com')",
        [uuidv4(), "admin"]
    );
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
