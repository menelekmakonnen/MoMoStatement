/**
 * UserService - Handles user profiles and user management.
 */

function getMe(data, user) {
  const userRecord = findRow_('Users', 'userId', user.userId);
  if (!userRecord) throw new Error('User not found');
  
  const profile = userRecord.data;
  delete profile.passwordHash;
  delete profile.salt;
  delete profile.pinHash;
  
  return profile;
}

function handleUpdateProfile(data, user) {
  const updates = {};
  if (data.name) updates.name = data.name;
  if (data.phone) updates.phone = data.phone;
  // Intentionally not allowing role or email updates here
  
  const userRecord = findRow_('Users', 'userId', user.userId);
  updateRow_('Users', userRecord.rowIndex, updates);
  
  return { success: true };
}

function handleGetUsers(data, user) {
  requireRole_(user, 'admin');
  
  const users = getSheetData_('Users');
  const filteredUsers = users.map(u => {
    delete u.passwordHash;
    delete u.salt;
    delete u.pinHash;
    return u;
  }).filter(u => {
    // If caller is not god_mode, hide god_mode users
    if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY['god_mode']) {
      return u.role !== 'god_mode';
    }
    return true;
  });
  
  return filteredUsers;
}

function handleUpdateUser(data, user) {
  requireRole_(user, 'admin');
  
  const targetUserRecord = findRow_('Users', 'userId', data.userId);
  if (!targetUserRecord) throw new Error('User not found');
  
  // Cannot modify god_mode users unless caller is god_mode
  if (targetUserRecord.data.role === 'god_mode' && user.role !== 'god_mode') {
    throw new Error('Cannot modify god_mode users');
  }
  
  const updates = data.updates || {};
  // Prevent escalation
  if (updates.role && ROLE_HIERARCHY[updates.role] > ROLE_HIERARCHY[user.role]) {
    throw new Error('Cannot escalate privileges beyond own role');
  }
  
  updateRow_('Users', targetUserRecord.rowIndex, updates);
  return { success: true };
}

function handleDisableUser(data, user) {
  requireRole_(user, 'super_admin');
  
  const targetUserRecord = findRow_('Users', 'userId', data.userId);
  if (!targetUserRecord) throw new Error('User not found');
  
  if (targetUserRecord.data.role === 'god_mode') {
    throw new Error('Cannot disable god_mode users');
  }
  
  updateRow_('Users', targetUserRecord.rowIndex, { status: 'disabled' });
  return { success: true };
}

function handleImpersonateUser(data, user) {
  requireRole_(user, 'god_mode');
  
  const targetUserRecord = findRow_('Users', 'userId', data.userId);
  if (!targetUserRecord) throw new Error('User not found');
  
  const targetData = targetUserRecord.data;
  delete targetData.passwordHash;
  delete targetData.salt;
  delete targetData.pinHash;
  
  // Example activity/transactions fetching could go here
  const activityLog = findRows_('Activity_Log', 'userId', data.userId);
  
  return { user: targetData, recentActivity: activityLog };
}

/**
 * Provision GodMode accounts on first run
 */
function provisionGodMode_() {
  const users = getSheetData_('Users');
  if (users.length === 0) {
    const salt1 = 'MOMOSTATEMENT_V2_Menelek';
    const salt2 = 'MOMOSTATEMENT_V2_Orbit';
    
    addRow_('Users', {
      userId: 'GM_001',
      email: 'hello@icuni.org',
      name: 'Menelek',
      passwordHash: hashPassword_('changeme123', salt1), // Should be changed
      salt: salt1,
      role: 'god_mode',
      status: 'active'
    });
    
    addRow_('Users', {
      userId: 'GM_002',
      email: 'orbit@icuni.org',
      name: 'Orbit',
      passwordHash: hashPassword_('changeme123', salt2),
      salt: salt2,
      role: 'god_mode',
      status: 'active'
    });
    
    log_('INFO', 'UserService', 'Provisioned GodMode accounts');
  }
}
