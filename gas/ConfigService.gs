/**
 * ConfigService - Handles system and public configuration reading/writing.
 */

function getPublicConfig() {
  const cache = CacheService.getScriptCache();
  const cachedConfig = cache.get('public_config');
  if (cachedConfig) return JSON.parse(cachedConfig);
  
  const configRecords = getSheetData_('CONFIG');
  const publicConfig = {};
  
  configRecords.forEach(record => {
    if (record.isPublic === true || record.isPublic === 'TRUE') {
      try {
        publicConfig[record.key] = JSON.parse(record.value);
      } catch (e) {
        publicConfig[record.key] = record.value; // Store as string if not JSON
      }
    }
  });
  
  cache.put('public_config', JSON.stringify(publicConfig), 300); // 5 mins
  return publicConfig;
}

function handleGetSystemConfig(data, user) {
  requireRole_(user, 'god_mode');
  
  const configRecords = getSheetData_('CONFIG');
  const sysConfig = {};
  
  configRecords.forEach(record => {
    try {
      sysConfig[record.key] = JSON.parse(record.value);
    } catch (e) {
      sysConfig[record.key] = record.value;
    }
  });
  
  return sysConfig;
}

function handleUpdateSystemConfig(data, user) {
  requireRole_(user, 'god_mode');
  
  const key = data.key;
  const value = typeof data.value === 'object' ? JSON.stringify(data.value) : data.value;
  
  const configRow = findRow_('CONFIG', 'key', key);
  if (configRow) {
    updateRow_('CONFIG', configRow.rowIndex, { value: value });
  } else {
    addRow_('CONFIG', { key: key, value: value, isPublic: data.isPublic || false });
  }
  
  // Invalidate cache
  CacheService.getScriptCache().remove('public_config');
  
  return { success: true };
}
