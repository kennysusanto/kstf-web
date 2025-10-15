import path from "path";
import fs from "fs";
import util from "util";

export function readFilesSync(dir) {
    const files = [];

    try {
        fs.readdirSync(dir).forEach((foldername) => {
            try {
                fs.readdirSync(path.resolve(dir, foldername)).forEach((filename) => {
                    const name = path.parse(filename).name;
                    const ext = path.parse(filename).ext;
                    const filepath = path.resolve(path.resolve(dir, foldername), filename);
                    const stat = fs.statSync(filepath);
                    const isFile = stat.isFile();

                    if (isFile) files.push({ filepath, name, ext, stat });
                });
            } catch (err) {}
        });

        files.sort((a, b) => {
            // natural sort alphanumeric strings
            // https://stackoverflow.com/a/38641281
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
        });
    } catch (err) {
        console.error(err);
    }

    return files;
}

export function readFilesSync2(dir) {
    const files = [];

    fs.readdirSync(dir).forEach((filename) => {
        const name = path.parse(filename).name;
        const ext = path.parse(filename).ext;
        const filepath = path.resolve(dir, filename);
        const stat = fs.statSync(filepath);
        const isFile = stat.isFile();

        if (isFile) files.push({ filepath, name, ext, stat });
    });

    files.sort((a, b) => {
        // natural sort alphanumeric strings
        // https://stackoverflow.com/a/38641281
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });

    return files;
}

export function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
    );
}

export function readFileBytes(path) {
    let bytes = null;
    if (fs.existsSync(path)) {
        let a = fs.readFileSync(path);
        const base64Image = Buffer.from(a).toString("base64");

        // Optionally, add the data URI prefix for direct use in HTML/CSS
        // Determine the image type from the file extension
        const ext = path.split(".").pop();
        const dataUri = `data:image/${ext};base64,${base64Image}`;
        bytes = dataUri;
    }
    return bytes;
}
