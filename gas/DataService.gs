/**
 * DataService - Generic CRUD using named columns and LockService.
 */

function getSheetData_(sheetName) {
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty
  
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  
  return rows;
}

function findRow_(sheetName, column, value) {
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName(sheetName);
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  
  const headers = data[0];
  const colIndex = headers.indexOf(column);
  if (colIndex === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] === value) {
      const rowObj = {};
      for (let j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      return { data: rowObj, rowIndex: i + 1 }; // 1-indexed
    }
  }
  
  return null;
}

function findRows_(sheetName, column, value) {
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const colIndex = headers.indexOf(column);
  if (colIndex === -1) return [];
  
  const results = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex] === value) {
      const rowObj = {};
      for (let j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      results.push({ data: rowObj, rowIndex: i + 1 });
    }
  }
  
  return results;
}

function addRow_(sheetName, rowObj) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = SpreadsheetApp.openById(SS_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    // Intercept with ShardManager if appropriate
    if (typeof ShardManager !== 'undefined' && ShardManager.getActiveSheet_) {
      sheet = ShardManager.getActiveSheet_(sheetName);
    }
    
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => rowObj[header] !== undefined ? rowObj[header] : '');
    
    sheet.appendRow(newRow);
  } finally {
    lock.releaseLock();
  }
}

function updateRow_(sheetName, rowIndex, updates) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const currentRow = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const updatedRow = headers.map((header, index) => {
      return updates[header] !== undefined ? updates[header] : currentRow[index];
    });
    
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
  } finally {
    lock.releaseLock();
  }
}

function deleteRow_(sheetName, rowIndex) {
  updateRow_(sheetName, rowIndex, { status: 'deleted' });
}

function getNextId_(prefix) {
  const lock = LockService.getScriptLock();
  let nextId = 1;
  try {
    lock.waitLock(30000);
    const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName('Counters');
    if (!sheet) return `${prefix}_1`;
    
    let counterRow = findRow_('Counters', 'prefix', prefix);
    if (counterRow) {
      nextId = Number(counterRow.data.currentValue) + 1;
      updateRow_('Counters', counterRow.rowIndex, { currentValue: nextId });
    } else {
      addRow_('Counters', { prefix: prefix, currentValue: 1 });
    }
  } finally {
    lock.releaseLock();
  }
  return `${prefix}_${nextId}`;
}

function bulkAddRows_(sheetName, rowObjs) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const values = rowObjs.map(rowObj => {
      return headers.map(header => rowObj[header] !== undefined ? rowObj[header] : '');
    });
    
    if (values.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
    }
  } finally {
    lock.releaseLock();
  }
}
