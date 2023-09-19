import fs from 'fs';
import pool from "./db/pool.js";
import { listFiles } from "./utilities/file_reader.js";

const analyzer = process.env.ANALYZER;
const loadStatus = {};

const archiveFiles = (filename, success) => {
    const sourceDir = success ? 'processing' : 'issue';
    const destinationDir = success ? 'archive' : 'issue';

    fs.rename(`./share/${sourceDir}/${filename}`, `./share/${destinationDir}/${filename}`, (err) => {
        if (err) console.log(err.message);
        console.log(`File stored under ${destinationDir} folder: ${filename}`);
        delete loadStatus[filename];
    });
};

const convertExpo = (val) => val.split(' ').map((d) => (Number(d) > 0 ? Number(d) : d)).join(' ');

export const loadResult = async (sample_id, test, result, filename, recCount, indexx) => {
    if (String(result).includes('(log')) {
        result = convertExpo(String(result)).split('IU')[0].trim();
    }
    sample_id = sample_id.substring(0, 20);

    const pushData = await pool.query(`select  clinlims.data_import('${analyzer}', '${sample_id}', '${test}', '${result}')`);
    const dataStatus = pushData.rows[0].data_import;

    if (dataStatus === 'ok') {
        loadStatus[filename] = loadStatus[filename] || [];
        loadStatus[filename].push('good');
        archiveFiles(filename, true);
    } else {
        loadStatus[filename] = loadStatus[filename] || [];
        loadStatus[filename].push('bad');
        console.log(`Error: ${dataStatus} : ${filename}`);
        archiveFiles(filename, false);
    }
};

setInterval(() => {
    listFiles();
}, 20000);

listFiles();
