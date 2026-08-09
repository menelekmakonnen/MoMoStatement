/**
 * MoMo Statement Backend - Main Router
 * Uses event-sourcing-lite and action router pattern.
 */

const SS_ID = ''; // To be filled with the actual Spreadsheet ID
const ROLE_HIERARCHY = { user: 0, admin: 1, super_admin: 2, god_mode: 3 };

const PUBLIC_ACTIONS = {
  'register': handleRegister,
  'login': handleLogin,
  'loginOtp': handleLoginOtp,
  'verifyOtp': handleVerifyOtp,
  'loginPin': handleLoginPin,
  'getPublicConfig': getPublicConfig,
  'submitFeedback': handleSubmitFeedback
};

const PROTECTED_ACTIONS = {
  'getMe': getMe,
  'updateProfile': handleUpdateProfile,
  'changePassword': handleChangePassword,
  'setPin': handleSetPin,
  'logout': handleLogout,
  'getUsers': handleGetUsers,
  'updateUser': handleUpdateUser,
  'disableUser': handleDisableUser,
  'getAnalytics': handleGetAnalytics, // Not fully implemented, placeholder
  'getActivityLog': handleGetActivityLog, // Not fully implemented, placeholder
  'getSystemConfig': handleGetSystemConfig,
  'updateSystemConfig': handleUpdateSystemConfig,
  'impersonateUser': handleImpersonateUser,
  'getSiteUsage': handleGetSiteUsage // Not fully implemented, placeholder
};

/**
 * Handle CORS Preflight requests.
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT); // empty 200 text/plain to bypass CORS
}

/**
 * Handle GET requests (status page).
 */
function doGet(e) {
  return HtmlService.createHtmlOutput('<html><body><h1>MoMo Statement API is running</h1></body></html>');
}

/**
 * Handle POST requests (Action Router).
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return buildResponse(false, null, 'Invalid request payload', 400);
    }
    
    // Check for Google login redirect HTML (error detection)
    if (e.postData.contents.indexOf('<html') !== -1) {
      return buildResponse(false, null, 'Authentication required by Google', 401);
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return buildResponse(false, null, 'Invalid JSON payload', 400);
    }

    const action = payload.action || e.parameter.action;
    if (!action) {
      return buildResponse(false, null, 'Action not specified', 400);
    }

    // Route to Public Action
    if (PUBLIC_ACTIONS[action]) {
      return buildResponse(true, PUBLIC_ACTIONS[action](payload.data || payload), null, 200);
    }

    // Route to Protected Action
    if (PROTECTED_ACTIONS[action]) {
      const token = e.parameter.token || payload.token;
      if (!token) {
        return buildResponse(false, null, 'Unauthorized: Missing session token', 401);
      }
      
      const user = validateSession_(token);
      if (!user) {
        return buildResponse(false, null, 'Unauthorized: Invalid or expired session', 401);
      }

      return buildResponse(true, PROTECTED_ACTIONS[action](payload.data || payload, user), null, 200);
    }

    return buildResponse(false, null, `Unknown action: ${action}`, 404);

  } catch (error) {
    log_('ERROR', 'Code.doPost', error.toString(), { trace: error.stack });
    return buildResponse(false, null, error.message || 'Internal Server Error', 500);
  }
}

/**
 * Builds standard uniform response envelope.
 */
function buildResponse(success, data, error, code) {
  const result = {
    success: success,
    code: code
  };
  if (success) {
    result.data = data;
  } else {
    result.error = error;
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.TEXT); // text/plain to bypass CORS
}

// Stubs for actions not explicitly defined in requirements
function handleGetAnalytics(data, user) {
  requireRole_(user, 'admin');
  return { status: 'Not Implemented' };
}
function handleGetActivityLog(data, user) {
  requireRole_(user, 'god_mode');
  return { status: 'Not Implemented' };
}
function handleGetSiteUsage(data, user) {
  requireRole_(user, 'god_mode');
  return { status: 'Not Implemented' };
}
