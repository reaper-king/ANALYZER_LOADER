import XLSX from 'xlsx';
import { loadResult } from '../index.js';
import fs from 'fs';

export const xls = (file) => {
  const workbook = XLSX.readFile(`./share/${file}`);
  const sheetName = workbook.SheetNames[0];
  let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (xlData[0]['System Name'].includes('Alinity')) {
    fs.rename(`./share/${file}`, `./share/processing/${file}`, (err) => {
      if (err) console.log(err.message);
    });

    xlData = xlData.map((dt) => ({
      labno: dt['Sample ID'],
      test: dt['Assay Name'],
      test_id: dt['Assay Number'],
      result: dt['Result'],
      result_value: Number(dt['Result'].split(' ')[0]),
      uom: dt['Result'].split(' ')[1],
      date_completed: dt['Date of Completion'].replaceAll('.', '/'),
    }));

    xlData.forEach((d, indx) => {
      loadResult(d.labno, d.test, d.result_value, file, xlData.length, indx + 1);
    });
  }
};
