import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//     console.log("Time: ", Date.now());
//     next();
// };
// router.use(timeLog);

// define the home page route
router.get("/", (req, res) => {
    let files = readFilesSync("./public/dataset");
    res.send(files);
});
// define the about route
router.get("/about", (req, res) => {
    res.send("About dataset");
});

router.post("/", (req, res) => {
    // console.log(req.body);
    let dd = [];
    for (const group of req.body.images) {
        let { id, name, data } = group;
        let uuid = uuidv4();
        dd.push({ id, name, uuid });
        let dir = `./public/dataset/${id}_${name}`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let idx = data.indexOf(",");
        let buff = Buffer.from(data.substr(idx), "base64");

        fs.writeFileSync(`${dir}/${name}_${uuid}.png`, buff);
    }
    res.send(dd);
});

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
    );
}

function readFilesSync(dir) {
    const files = [];

    fs.readdirSync(dir).forEach((foldername) => {
        fs.readdirSync(path.resolve(dir, foldername)).forEach((filename) => {
            const name = path.parse(filename).name;
            const ext = path.parse(filename).ext;
            const filepath = path.resolve(path.resolve(dir, foldername), filename);
            const stat = fs.statSync(filepath);
            const isFile = stat.isFile();

            if (isFile) files.push({ filepath, name, ext, stat });
        });
    });

    files.sort((a, b) => {
        // natural sort alphanumeric strings
        // https://stackoverflow.com/a/38641281
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });

    return files;
}

export default router;
