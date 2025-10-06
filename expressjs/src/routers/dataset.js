import express from "express";
import fs from "fs";
import { uuidv4, readFilesSync, readFileBytes } from "../helpers/misc.js";

const router = express.Router();
const dirname = "./src/public/dataset";
// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//     console.log("Time: ", Date.now());
//     next();
// };
// router.use(timeLog);

// define the home page route
router.get("/", (req, res) => {
    let files = readFilesSync(dirname);
    let toReturn = [];
    const findGroup = (id) => {
        let found = null;
        for (const g of toReturn) {
            if (g.id === id) {
                found = g;
                break;
            }
        }
        return found;
    };
    for (const file of files) {
        let s = file.filepath.split("/");
        console.log(s, file.filepath);
        let id = s[s.length - 2];
        let ss = id.split("_");
        id = ss[0];
        let name = ss[1];
        let g = findGroup(id);
        if (!g) {
            let newGroup = {
                id,
                name,
                data: [
                    {
                        name: file.name,
                        ext: file.ext,
                    },
                ],
            };
            toReturn.push(newGroup);
        } else {
            g.data.push({
                name: file.name,
                ext: file.ext,
            });
        }
    }
    res.json({ data: toReturn });
    // let files = readFilesSync("./public/dataset");
    // res.json({ data: files });
});
// define the about route
router.get("/about", (req, res) => {
    res.json({ message: "About dataset" });
});

// router.get("/:class/:filename", (req, res) => {
//     let bytes = readFileBytes(`./public/dataset/${req.params.class}/${req.params.filename}`);
//     res.json({
//         data: bytes,
//     });
// });

router.post("/", (req, res) => {
    // console.log(req.body);
    let dd = [];
    for (const group of req.body.images) {
        let { id, name, data } = group;
        let uuid = uuidv4();
        dd.push({ id, name, uuid });
        let dir = `./src/public/dataset/${id}_${name}`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let idx = data.indexOf(",");
        let buff = Buffer.from(data.substr(idx), "base64");

        fs.writeFileSync(`${dir}/${name}_${uuid}.png`, buff);
    }
    res.json({ data: dd });
});

export default router;
