import express from "express";
import fs from "fs";
import { uuidv4, readFilesSync, readFilesSync2 } from "../helpers/misc.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/model/"); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        // You can customize the filename here
        // For example, use the original filename with a timestamp
        // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop());
        const uniquePrefix = uuidv4();
        cb(null, uniquePrefix + "_" + file.originalname);
    },
});

const upload = multer({ storage: storage });
const router = express.Router();
const dirname = "./public/model";

// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//     console.log("Time: ", Date.now());
//     next();
// };
// router.use(timeLog);

// define the home page route
router.get("/", (req, res, next) => {
    let files = readFilesSync(dirname);
    let toReturn = [];
    const findGroup = (uid) => {
        let found = null;
        for (const g of toReturn) {
            if (g.uid === uid) {
                found = g;
                break;
            }
        }
        return found;
    };
    for (const file of files) {
        let s = file.filepath.split("\\");
        let uid = s[s.length - 2];
        let g = findGroup(uid);
        if (!g) {
            let newGroup = {
                uid,
            };
            if (file.ext === ".json") {
                newGroup.model = {
                    uid,
                    name: file.name,
                    ext: file.ext,
                };
            } else if (file.ext === ".bin") {
                newGroup.weights = {
                    uid,
                    name: file.name,
                    ext: file.ext,
                };
            }
            toReturn.push(newGroup);
        } else {
            if (file.ext === ".json") {
                g.model = {
                    uid,
                    name: file.name,
                    ext: file.ext,
                };
            } else if (file.ext === ".bin") {
                g.weights = {
                    uid,
                    name: file.name,
                    ext: file.ext,
                };
            }
        }
    }
    res.json({ data: toReturn });
});
// define the about route
router.get("/about", (req, res) => {
    res.json({ message: "About train" });
});

router.get("/:modelname", (req, res) => {
    let bytes = readFileBytes(`${dirname}/${req.params.class}/${req.params.filename}`);
    res.json({
        data: bytes,
    });
});

router.post("/", upload.any(), (req, res) => {
    // console.log(req.body);
    // let a = req.body;
    // console.log(a);
    // console.log(req.files);
    /*
    [
  {
    fieldname: 'model.json',
    originalname: 'model.json',
    encoding: '7bit',
    mimetype: 'application/json',
    destination: './public/model/',
    filename: '7194a24b0ac5bb6de6bc1ca8e8428bcc',
    path: 'public\\model\\7194a24b0ac5bb6de6bc1ca8e8428bcc',
    size: 91943
  },
  {
    fieldname: 'model.weights.bin',
    originalname: 'model.weights.bin',
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    destination: './public/model/',
    filename: '6e86570c6d2c9973e5f4dc87b2e262d3',
    path: 'public\\model\\6e86570c6d2c9973e5f4dc87b2e262d3',
    size: 9360392
  }
]
  */
    // let model = req.body.model;
    let uuid = uuidv4();
    // let dir = `./public/model/${model.name}_${uuid}`;

    // console.log(model);
    let filesToReturn = [];
    for (const file of req.files) {
        let fn = file.filename;
        let p = path.resolve(dirname, fn);

        if (fs.existsSync(p)) {
            let newFolderPath = path.resolve(dirname, uuid);
            fs.mkdirSync(newFolderPath, { recursive: true });
            let newPath = path.resolve(newFolderPath, file.originalname);
            fs.renameSync(p, newPath);
            filesToReturn.push({
                //path: newPath,
                filename: file.originalname,
            });
        }
    }

    // if (!fs.existsSync(dir)) {
    // fs.mkdirSync(dir, { recursive: true });
    // }

    // let buff = Buffer.from(model, "base64");

    // fs.writeFileSync(`${dir}/${name}_${uuid}.png`, buff);
    res.json({
        data: {
            uuid,
            files: filesToReturn,
        },
    });
});

export default router;
