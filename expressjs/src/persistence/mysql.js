import waitPort from "wait-port";
import fs from "fs";
import mysql from "mysql2";

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

var pool;

async function init() {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

    await waitPort({
        host,
        port: 3306,
        timeout: 10000,
        waitForDns: true,
    });

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: "utf8mb4",
    });

    return Promise.all([
        new Promise((acc, rej) => {
            pool.query(
                "CREATE TABLE IF NOT EXISTS organization (id int not null auto_increment, orgname varchar(255), active boolean, createdat datetime, updatedat datetime, deletedat datetime, PRIMARY KEY(id), CONSTRAINT uc_user_2nd UNIQUE (orgname)) DEFAULT CHARSET utf8mb4",
                (err) => {
                    if (err) return rej(err);

                    // console.log(`Connected to mysql db at host ${HOST}`);
                    acc();
                }
            );
        }),
        new Promise((acc, rej) => {
            pool.query(
                "CREATE TABLE IF NOT EXISTS user (id int not null auto_increment, username varchar(255), password varchar(255), orgid varchar(36), active boolean, createdat datetime, updatedat datetime, deletedat datetime, PRIMARY KEY(id), CONSTRAINT uc_user_2nd UNIQUE (username)) DEFAULT CHARSET utf8mb4",
                (err) => {
                    if (err) return rej(err);

                    // console.log(`Connected to mysql db at host ${HOST}`);
                    acc();
                }
            );
        }),
        new Promise((acc, rej) => {
            pool.query(
                "CREATE TABLE IF NOT EXISTS prediction (id int not null auto_increment, classname varchar(255), confidence float, createdat datetime, updatedat datetime, deletedat datetime, PRIMARY KEY(id)) DEFAULT CHARSET utf8mb4",
                (err) => {
                    if (err) return rej(err);

                    // console.log(`Connected to mysql db at host ${HOST}`);
                    acc();
                }
            );
        }),
        new Promise((acc, rej) => {
            pool.query(
                `INSERT INTO organization (orgname, active, createdat)
                SELECT 'master', 1, NOW()
                WHERE NOT EXISTS (SELECT 1 FROM organization WHERE orgname = 'master');`,
                (err) => {
                    if (err) return rej(err);

                    // console.log(`Connected to mysql db at host ${HOST}`);
                    acc();
                }
            );
        }),
        new Promise((acc, rej) => {
            pool.query(
                `INSERT INTO user (username, password, orgid, active, createdat)
                SELECT 'sa', 'abc', (SELECT id FROM organization WHERE orgname = 'master'), 1, NOW()
                WHERE NOT EXISTS (SELECT 1 FROM user WHERE username = 'sa');`,
                (err) => {
                    if (err) return rej(err);

                    // console.log(`Connected to mysql db at host ${HOST}`);
                    acc();
                }
            );
        }),
    ]);

    // return new Promise((acc, rej) => {
    //     pool.query(
    //         "CREATE TABLE IF NOT EXISTS user (id varchar(36), username varchar(255), active boolean, createdat datetime, updatedat datetime, deletedat datetime) DEFAULT CHARSET utf8mb4",
    //         (err) => {
    //             if (err) return rej(err);

    //             console.log(`Connected to mysql db at host ${HOST}`);
    //             acc();
    //         }
    //     );
    // });
}

async function teardown() {
    return new Promise((acc, rej) => {
        pool.end((err) => {
            if (err) rej(err);
            else acc();
        });
    });
}

// organization

async function getOrganizations() {
    return new Promise((acc, rej) => {
        pool.query("SELECT * FROM organization", (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        active: item.active === 1,
                    })
                )
            );
        });
    });
}

async function getOrganization(id) {
    return new Promise((acc, rej) => {
        pool.query("SELECT * FROM organization WHERE id=?", [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        active: item.active === 1,
                    })
                )[0]
            );
        });
    });
}

async function storeOrganization(item) {
    return new Promise((acc, rej) => {
        pool.query(
            "INSERT INTO organization (id, orgname, active, createdat) VALUES (?, ?, ?, now())",
            [item.id, item.orgname, item.active ? 1 : 0],
            (err) => {
                if (err) return rej(err);
                acc();
            }
        );
    });
}

async function updateOrganization(id, item) {
    return new Promise((acc, rej) => {
        pool.query("UPDATE organization SET orgname=?, active=? WHERE id=?", [item.orgname, item.active ? 1 : 0, id], (err) => {
            if (err) return rej(err);
            acc();
        });
    });
}

async function removeOrganization(id) {
    return new Promise((acc, rej) => {
        pool.query("DELETE FROM organization WHERE id = ?", [id], (err) => {
            if (err) return rej(err);
            acc();
        });
    });
}

// user

async function getUsers() {
    return new Promise((acc, rej) => {
        pool.query("SELECT * FROM user", (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        active: item.active === 1,
                    })
                )
            );
        });
    });
}

async function getUser(id) {
    return new Promise((acc, rej) => {
        pool.query("SELECT * FROM user WHERE id=?", [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        active: item.active === 1,
                    })
                )[0]
            );
        });
    });
}

async function storeUser(item) {
    return new Promise((acc, rej) => {
        pool.query(
            "INSERT INTO user (id, username, password, orgid, active, createdat) VALUES (?, ?, ?, ?, ?, now())",
            [item.id, item.username, item.password, item.orgid, item.active ? 1 : 0],
            (err) => {
                if (err) return rej(err);
                acc();
            }
        );
    });
}

async function updateUser(id, item) {
    return new Promise((acc, rej) => {
        pool.query("UPDATE user SET username=?, password=?, active=? WHERE id=?", [item.username, item.password, item.active ? 1 : 0, id], (err) => {
            if (err) return rej(err);
            acc();
        });
    });
}

async function removeUser(id) {
    return new Promise((acc, rej) => {
        pool.query("DELETE FROM user WHERE id = ?", [id], (err) => {
            if (err) return rej(err);
            acc();
        });
    });
}

// prediction

async function getPredictions() {
    return new Promise((acc, rej) => {
        pool.query("SELECT * FROM prediction order by createdat desc", (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        active: item.active === 1,
                    })
                )
            );
        });
    });
}

async function getPrediction(id) {
    return new Promise((acc, rej) => {
        pool.query("SELECT * FROM prediction WHERE id=?", [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        active: item.active === 1,
                    })
                )[0]
            );
        });
    });
}

async function storePrediction(item) {
    return new Promise((acc, rej) => {
        pool.query(
            "INSERT INTO prediction (id, classname, confidence, createdat) VALUES (?, ?, ?, now())",
            [item.id, item.classname, item.confidence],
            (err) => {
                if (err) return rej(err);
                acc();
            }
        );
    });
}

async function updatePrediction(id, item) {
    return new Promise((acc, rej) => {
        pool.query("UPDATE prediction SET classname=?, WHERE id=?", [item.classname, id], (err) => {
            if (err) return rej(err);
            acc();
        });
    });
}

async function removePrediction(id) {
    return new Promise((acc, rej) => {
        pool.query("DELETE FROM prediction WHERE id = ?", [id], (err) => {
            if (err) return rej(err);
            acc();
        });
    });
}

export default {
    init,
    teardown,
    getOrganizations,
    getOrganization,
    storeOrganization,
    updateOrganization,
    removeOrganization,
    getUsers,
    getUser,
    storeUser,
    updateUser,
    removeUser,
    getPredictions,
    getPrediction,
    storePrediction,
    updatePrediction,
    removePrediction,
};
