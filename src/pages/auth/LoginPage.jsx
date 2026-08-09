import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithPin, requestOtp, verifyOtp } = useAuth();
  
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'pin'
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/import');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestOtp(email);
      setStep('otp');
      setCountdown(300); // 5 minutes
    } catch {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = async (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    if (value && index < 3) {
      pinRefs[index + 1].current.focus();
    }
    
    if (newPin.every(d => d !== '')) {
      setLoading(true);
      setError('');
      try {
        await loginWithPin(newPin.join(''));
        navigate('/app/import');
      } catch {
        setError('Invalid PIN');
        setPin(['', '', '', '']);
        pinRefs[0].current.focus();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpChange = async (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
    
    if (newOtp.every(d => d !== '')) {
      setLoading(true);
      setError('');
      try {
        await verifyOtp(email, newOtp.join(''));
        navigate('/app/import');
      } catch {
        setError('Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current.focus();
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-layout">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <div className="auth-logo">M</div>
          <h1 className="auth-title">MoMo Statement</h1>
          <p className="auth-subtitle">Welcome back</p>
        </div>

        {step === 'login' ? (
          <>
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
                type="button"
              >
                Email
              </button>
              <button 
                className={`auth-tab ${activeTab === 'pin' ? 'active' : ''}`}
                onClick={() => setActiveTab('pin')}
                type="button"
              >
                Quick PIN
              </button>
            </div>

            {error && <div className="field-error-text" style={{textAlign: 'center'}}>{error}</div>}

            {activeTab === 'email' ? (
              <form className="auth-form" onSubmit={handleEmailLogin}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                      <polyline points="3 7 12 13 21 7"></polyline>
                    </svg>
                    <input 
                      type="email" 
                      className="input" 
                      placeholder="Email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="auth-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    Remember me
                  </label>
                  <button type="button" className="auth-link">Forgot password?</button>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{width: '100%'}}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="auth-separator">or</div>

                <button 
                  type="button" 
                  className="btn btn-secondary btn-lg" 
                  onClick={handleRequestOtp}
                  disabled={loading}
                  style={{width: '100%'}}
                >
                  Request OTP
                </button>
              </form>
            ) : (
              <div className="auth-form">
                <p style={{textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem'}}>
                  Enter your 4-digit quick access PIN
                </p>
                <div className="otp-group">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={pinRefs[index]}
                      type="password"
                      maxLength="1"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      disabled={loading}
                    />
                  ))}
                </div>
                <div style={{textAlign: 'center', marginTop: '1rem'}}>
                  <button type="button" className="auth-link" onClick={() => setActiveTab('email')}>
                    Switch to email
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="auth-form">
            <p style={{textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>
              Enter the 6-digit code sent to<br/>
              <strong style={{color: 'var(--color-text)'}}>{email}</strong>
            </p>
            
            {error && <div className="field-error-text" style={{textAlign: 'center'}}>{error}</div>}

            <div className="otp-group" style={{marginTop: '1rem'}}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength="1"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={loading}
                  style={{width: '2.5rem', height: '3rem'}}
                />
              ))}
            </div>

            <div style={{textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {countdown > 0 ? (
                <span style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>
                  Resend code in {formatTime(countdown)}
                </span>
              ) : (
                <button type="button" className="auth-link" onClick={handleRequestOtp}>
                  Resend OTP
                </button>
              )}
              
              <button 
                type="button" 
                className="auth-link" 
                onClick={() => {
                  setStep('login');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
