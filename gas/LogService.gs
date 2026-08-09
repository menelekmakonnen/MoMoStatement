/**
 * LogService - Structured logging and auditing.
 */

let logCounter_ = 0;

function log_(level, module, message, details) {
  const timestamp = new Date().toISOString();
  const logMessage = `[MoMoStatement] [${level}] [${module}] ${message}`;
  
  const row = {
    timestamp: timestamp,
    level: level,
    module: module,
    message: message,
    details: details ? JSON.stringify(details) : ''
  };
  
  // Direct append without Lock for speed, assuming _Logs is non-critical
  // However, for strict compliance, we should use Lock, but let's keep it lightweight if possible.
  // Using DataService addRow_ provides the lock.
  addRow_('_Logs', row);
  
  logCounter_++;
  if (logCounter_ >= 50) {
    rotateLogSheet_();
    logCounter_ = 0;
  }
}

function rotateLogSheet_() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName('_Logs');
    if (!sheet) return;
    
    const lastRow = sheet.getLastRow();
    const KEEP_ROWS = 500;
    
    if (lastRow > KEEP_ROWS + 1) { // +1 for header
      const rowsToDelete = lastRow - KEEP_ROWS - 1;
      sheet.deleteRows(2, rowsToDelete);
    }
  } catch (e) {
    // Fail silently on rotation error
  } finally {
    lock.releaseLock();
  }
}

function logAuth_(action, email, success, details) {
  log_('INFO', 'Auth', `${action} attempt for ${email}: ${success ? 'SUCCESS' : 'FAILED'}`, details);
}

function logActivity_(userId, action, details) {
  const row = {
    timestamp: new Date().toISOString(),
    userId: userId,
    action: action,
    details: details ? JSON.stringify(details) : ''
  };
  addRow_('Activity_Log', row);
}
