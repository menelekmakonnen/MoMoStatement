/**
 * ShardManager - Auto-shards sheets exceeding 4000 rows.
 */

const ShardManager = (function() {
  const MAX_ROWS = 4000;
  
  function getActiveSheet_(dataType) {
    const ss = SpreadsheetApp.openById(SS_ID);
    const metaSheet = ss.getSheetByName('_Meta');
    
    let currentShard = dataType;
    let nextShardNum = 2;
    
    if (metaSheet) {
      const metaRow = findRow_('_Meta', 'dataType', dataType);
      if (metaRow) {
        currentShard = metaRow.data.activeShard;
        nextShardNum = parseInt(currentShard.split('_').pop(), 10) + 1;
        if (isNaN(nextShardNum)) nextShardNum = 2; // Default if base sheet
      }
    }
    
    let sheet = ss.getSheetByName(currentShard);
    if (!sheet) {
      // Fallback
      return ss.getSheetByName(dataType);
    }
    
    if (sheet.getLastRow() >= MAX_ROWS) {
      const newShardName = `${dataType}_${nextShardNum}`;
      log_('INFO', 'ShardManager', `Creating new shard: ${newShardName}`);
      
      // Copy headers from original sheet to new shard
      const templateSheet = ss.getSheetByName(dataType);
      sheet = ss.insertSheet(newShardName);
      const headers = templateSheet.getRange(1, 1, 1, templateSheet.getLastColumn()).getValues();
      sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
      
      // Update meta
      if (metaSheet) {
        const metaRow = findRow_('_Meta', 'dataType', dataType);
        if (metaRow) {
          updateRow_('_Meta', metaRow.rowIndex, { activeShard: newShardName });
        } else {
          addRow_('_Meta', { dataType: dataType, activeShard: newShardName });
        }
      }
    }
    
    return sheet;
  }
  
  function queryAllShards_(dataType, filterFn) {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheets = ss.getSheets();
    let results = [];
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      if (name === dataType || name.startsWith(`${dataType}_`)) {
        const data = getSheetData_(name);
        results = results.concat(data.filter(filterFn));
      }
    });
    
    return results;
  }
  
  function getShardHealth_() {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheets = ss.getSheets();
    const health = [];
    
    sheets.forEach(sheet => {
      const name = sheet.getName();
      if (!name.startsWith('_')) {
        const rows = sheet.getLastRow();
        health.push({
          shardName: name,
          rowCount: rows,
          percentFull: ((rows / MAX_ROWS) * 100).toFixed(2) + '%',
          estimatedDaysToFull: 'N/A' // Requires historical rate tracking
        });
      }
    });
    
    return health;
  }
  
  return {
    getActiveSheet_: getActiveSheet_,
    queryAllShards_: queryAllShards_,
    getShardHealth_: getShardHealth_
  };
})();
