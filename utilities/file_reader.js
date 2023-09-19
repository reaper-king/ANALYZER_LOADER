import fs from 'fs';
import { xls } from './xls_reader.js';
import { loadResult } from '../index.js';
import { abottFileImport } from './abott.js';
import path from 'path';

const dirPath = path.resolve('./share');

function counts(string, word) {
  return string.split(word).length - 1;
}

async function processTextFile(file) {
  try {
    const data = await fs.promises.readFile(`${dirPath}/${file}`, 'ascii');
    const king = { data: "" };
    const recCount = counts(data, "RESULT TABLE");

    if (recCount > 0) {
      await fs.promises.rename(`./share/${file}`, `./share/processing/${file}`);
      const datas = data.split("RESULT TABLE");
      const filtered = datas.filter(d => d.includes('Test Disclaimer'));

      const filtered2 = filtered.map(d => {
        return (
          '{' +
          d.substring(1, d.lastIndexOf("Test Disclaimer"))
            .replace(/"/g, '')
            .replace('Sample ID,', '"Sample ID":"')
            .replace('Patient ID,', '"Patient ID":"')
            .replace('Assay,', '"Test Name":"')
            .replace('Assay Version,', '"Assay Version":"')
            .replace('Assay Type,', '"Assay Type":"')
            .replace('Test Type,', '"Test Type":"')
            .replace('Sample Type,', '"Sample Type":"')
            .replace('Sample Type\r', '"Sample Type":"\r')
            .replace('Notes,', '"Notes":"')
            .replace('Notes\r', '"Notes":"\r')
            .replace('Test Result,', '"Test Result":"')
            .replace(/\r/g, '",')
            .slice(0, -2)
          + '}'
        );
      });

      const Jsoned = JSON.parse('[' + filtered2 + ']');
      Jsoned.forEach(async (data, i) => {
        await loadResult(data['Sample ID'], data['Test Name'], data['Test Result'], file, Jsoned.length, i + 1);
      });
    }
  } catch (error) {
    await fs.promises.rename(`./share/processing/${file}`, `./share/errored/${file}`);
    console.log(error.message + '\nFile stored under errored folder : ' + file);
  }
}

export async function listFiles() {
  try {
    const files = await fs.promises.readdir(dirPath);
    const filesList = files.filter(e =>
      ['.p01', '.xls', '.xlsx', '.txt', '.csv'].includes(path.extname(e).toLowerCase())
    );

    if (filesList.length > 0) {
      await Promise.all(filesList.map(file => {
        if (file.includes('.xls')) {
          return xls(file);
        } else if (file.includes('.P01')) {
          return abottFileImport(file);
        } else {
          return processTextFile(file);
        }
      }));
    }
  } catch (err) {
    console.error(err);
  }
}

