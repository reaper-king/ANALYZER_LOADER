import { loadResult } from '../index.js';
import fs from 'fs';

function tsvJSON(tsv) {
  const lines = tsv.split("\n");
  const headers = lines[0].split("\t");

  return lines.slice(1).map(line => {
    const currentline = line.split("\t");
    return headers.reduce((obj, header, index) => {
      obj[header] = currentline[index];
      return obj;
    }, {});
  });
}

export const abottFileImport = (file) => {
  fs.readFile(`./share/${file}`, 'utf16le', (err, data) => {
    if (err) console.log(err.message);

    const convertedData = tsvJSON(data)
      .map(dets => ({
        sample_id: dets['SID'],
        test: dets['ASSAY'],
        result: dets['RESULT'],
        completed: dets['DATE/TIME COMPLETED']
      }))
      .filter(v => v.sample_id !== undefined);

    fs.rename(`./share/${file}`, `./share/processing/${file}`, (err) => {
      if (err) console.log(err.message);
    });

    convertedData.forEach((d, indx) => {
      loadResult(d.sample_id, d.test, d.result, file, convertedData.length, indx + 1);
    });
  });
};
