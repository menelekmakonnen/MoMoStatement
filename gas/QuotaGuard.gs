/**
 * QuotaGuard - Prevents exceeding Apps Script quotas.
 */

const QuotaGuard = (function() {
  const EMAIL_LIMIT = 100;
  const FETCH_LIMIT = 20000;
  
  function getTodayKey_() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  }

  function getCount_(type) {
    const key = `quota_${type}_${getTodayKey_()}`;
    const props = PropertiesService.getScriptProperties();
    const count = props.getProperty(key);
    return count ? parseInt(count, 10) : 0;
  }

  function incrementCount_(type) {
    const key = `quota_${type}_${getTodayKey_()}`;
    const lock = LockService.getScriptLock();
    try {
      // Fail-open for lock
      if (!lock.tryLock(5000)) return; 
      
      const props = PropertiesService.getScriptProperties();
      let count = parseInt(props.getProperty(key) || '0', 10);
      count++;
      props.setProperty(key, count.toString());
      
      const limit = type === 'email' ? EMAIL_LIMIT : FETCH_LIMIT;
      if (count === Math.floor(limit * 0.8)) {
        log_('WARN', 'QuotaGuard', `${type} quota reached 80% usage`, { count: count });
      }
    } finally {
      lock.releaseLock();
    }
  }

  return {
    canSendEmail_: function() {
      return getCount_('email') < EMAIL_LIMIT;
    },
    
    recordEmailSent_: function() {
      incrementCount_('email');
    },
    
    canFetch_: function() {
      return getCount_('fetch') < FETCH_LIMIT;
    },
    
    recordFetch_: function() {
      incrementCount_('fetch');
    }
  };
})();
