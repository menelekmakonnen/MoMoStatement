/**
 * AuthService - Handles authentication, OTPs, PINs, and Session management.
 */

function handleRegister(data) {
  const email = data.email;
  const password = data.password;
  
  if (!email || !password) throw new Error('Email and password required');
  
  const existingUser = findRow_('Users', 'email', email);
  if (existingUser) throw new Error('Email already registered');
  
  const userId = getNextId_('USR');
  const salt = 'MOMOSTATEMENT_V2_' + userId;
  const hashedPassword = hashPassword_(password, salt);
  
  const newUser = {
    userId: userId,
    email: email,
    passwordHash: hashedPassword,
    salt: salt,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  addRow_('Users', newUser);
  
  // Optionally generate and send OTP for verification here
  logAuth_('REGISTER', email, true, { userId: userId });
  return { message: 'Registration successful' };
}

function handleLogin(data) {
  const email = data.email;
  const password = data.password;
  
  if (!email || !password) throw new Error('Email and password required');
  
  const userRecord = findRow_('Users', 'email', email);
  
  // Anti-enumeration delay
  if (!userRecord) {
    Utilities.sleep(1200);
    throw new Error('Invalid email or password');
  }
  
  const user = userRecord.data;
  if (user.status !== 'active') {
    throw new Error('Account disabled');
  }
  
  const expectedHash = hashPassword_(password, user.salt);
  if (expectedHash !== user.passwordHash) {
    Utilities.sleep(1200);
    throw new Error('Invalid email or password');
  }
  
  const token = createSession_(user.userId, data.deviceInfo);
  logAuth_('LOGIN', email, true, { userId: user.userId });
  
  delete user.passwordHash;
  delete user.salt;
  delete user.pinHash;
  
  return { token: token, user: user };
}

function handleLoginOtp(data) {
  const email = data.email;
  if (!canSendEmail_()) throw new Error('Email quota exceeded');
  
  const otp = generateOtp_();
  // Store OTP in sessions sheet or cache with 5-min TTL
  addRow_('Sessions', {
    token: `otp_${email}`,
    userId: email,
    otp: otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  });
  
  if (QuotaGuard.canSendEmail_()) {
    MailApp.sendEmail(email, 'MoMo Statement OTP', `Your OTP is ${otp}. Valid for 5 minutes.`);
    QuotaGuard.recordEmailSent_();
  }
  
  return { message: 'OTP sent' };
}

function handleVerifyOtp(data) {
  const email = data.email;
  const otp = data.otp;
  
  const sessionRecord = findRow_('Sessions', 'token', `otp_${email}`);
  if (!sessionRecord || sessionRecord.data.otp !== otp || new Date(sessionRecord.data.expiresAt) < new Date()) {
    throw new Error('Invalid or expired OTP');
  }
  
  const userRecord = findRow_('Users', 'email', email);
  if (!userRecord) throw new Error('User not found');
  
  const token = createSession_(userRecord.data.userId, data.deviceInfo);
  deleteRow_('Sessions', sessionRecord.rowIndex); // consume OTP
  
  const user = userRecord.data;
  delete user.passwordHash;
  delete user.salt;
  
  return { token: token, user: user };
}

function handleLoginPin(data) {
  const userId = data.userId;
  const pin = data.pin;
  
  const userRecord = findRow_('Users', 'userId', userId);
  if (!userRecord) {
    Utilities.sleep(1200);
    throw new Error('Invalid PIN');
  }
  
  const user = userRecord.data;
  const expectedHash = hashPassword_(pin, user.salt);
  
  if (expectedHash !== user.pinHash) {
    Utilities.sleep(1200); // Should add progressive delay here
    throw new Error('Invalid PIN');
  }
  
  const token = createSession_(user.userId, data.deviceInfo);
  return { token: token };
}

function handleLogout(data, user) {
  // Invalidate session
  const token = data.token;
  const sessionRecord = findRow_('Sessions', 'token', token);
  if (sessionRecord) {
    updateRow_('Sessions', sessionRecord.rowIndex, { status: 'revoked' });
  }
  return { success: true };
}

function handleChangePassword(data, user) {
  const userRecord = findRow_('Users', 'userId', user.userId);
  if (!userRecord) throw new Error('User not found');
  
  const oldHash = hashPassword_(data.oldPassword, userRecord.data.salt);
  if (oldHash !== userRecord.data.passwordHash) throw new Error('Invalid old password');
  
  const newHash = hashPassword_(data.newPassword, userRecord.data.salt);
  updateRow_('Users', userRecord.rowIndex, { passwordHash: newHash });
  
  return { success: true };
}

function handleSetPin(data, user) {
  const userRecord = findRow_('Users', 'userId', user.userId);
  if (!userRecord) throw new Error('User not found');
  
  const pinHash = hashPassword_(data.pin, userRecord.data.salt);
  updateRow_('Users', userRecord.rowIndex, { pinHash: pinHash });
  
  return { success: true };
}

// --- Helpers ---

function hashPassword_(password, salt) {
  const signature = Utilities.computeHmacSha256Signature(password, salt);
  return signature.map(function(e) {
    const v = (e < 0 ? e + 256 : e).toString(16);
    return v.length == 1 ? "0" + v : v;
  }).join("");
}

function generateOtp_() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateUuid_() {
  return Utilities.getUuid();
}

function createSession_(userId, deviceInfo) {
  const token = generateUuid_();
  const sessionInfo = {
    token: token,
    userId: userId,
    deviceInfo: deviceInfo || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  addRow_('Sessions', sessionInfo);
  return token;
}

function validateSession_(token) {
  const cache = CacheService.getScriptCache();
  const cachedUser = cache.get(`session_${token}`);
  if (cachedUser) return JSON.parse(cachedUser);
  
  const sessionRecord = findRow_('Sessions', 'token', token);
  if (!sessionRecord || sessionRecord.data.status !== 'active' || new Date(sessionRecord.data.expiresAt) < new Date()) {
    return null;
  }
  
  const userRecord = findRow_('Users', 'userId', sessionRecord.data.userId);
  if (!userRecord || userRecord.data.status !== 'active') return null;
  
  const user = userRecord.data;
  cache.put(`session_${token}`, JSON.stringify(user), 21600); // 6 hours
  return user;
}

function requireRole_(user, minRole) {
  if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error('Insufficient permissions');
  }
}
