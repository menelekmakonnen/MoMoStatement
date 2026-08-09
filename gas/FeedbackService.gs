/**
 * FeedbackService - Handles public feedback submissions.
 */

function handleSubmitFeedback(data) {
  // Honeypot check
  if (data.website) {
    // Silently discard
    return { success: true, message: 'Feedback submitted successfully' };
  }
  
  const email = data.email || 'anonymous';
  
  // Rate limiting (max 3 per hour per email)
  const recentFeedback = findRows_('Feedback', 'email', email).filter(row => {
    const timeDiff = new Date() - new Date(row.data.timestamp);
    return timeDiff < 60 * 60 * 1000;
  });
  
  if (recentFeedback.length >= 3) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  const feedbackRecord = {
    timestamp: new Date().toISOString(),
    email: email,
    type: data.type || 'feedback',
    title: data.title || '',
    description: data.description || '',
    severity: data.severity || 'low',
    browserInfo: data.browserInfo || ''
  };
  
  addRow_('Feedback', feedbackRecord);
  
  if (QuotaGuard.canSendEmail_()) {
    MailApp.sendEmail({
      to: 'tech.issue@icuni.org',
      subject: `[MoMoStatement ${feedbackRecord.type.toUpperCase()}] ${feedbackRecord.title}`,
      body: `New feedback received:\n\nType: ${feedbackRecord.type}\nSeverity: ${feedbackRecord.severity}\nFrom: ${email}\n\nDescription:\n${feedbackRecord.description}\n\nBrowser: ${feedbackRecord.browserInfo}`
    });
    QuotaGuard.recordEmailSent_();
  }
  
  return { success: true, message: 'Feedback submitted successfully' };
}
