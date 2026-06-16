import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Briefcase, Lock, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// ─── API Base URL ─────────────────────────────────────────────────────────────
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'internx.cc' || hostname === 'www.internx.cc') return 'https://api.internx.cc/api';
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) return 'https://api.internx.cc/api';
    return 'http://localhost:5006/api';
  }
  return 'http://localhost:5006/api';
};
const API_BASE_URL = getApiBaseUrl();

// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_EXPIRY_SECONDS   = 300;  // 5 min OTP validity
const RESEND_COOLDOWN_SECS = 120;  // 2 min between resends
const MAX_RESENDS          = 2;    // First send + 2 resends = 3 total → then blocked

// localStorage keys — persist across refresh
const LS_EMAIL          = 'fp_email';
const LS_STEP           = 'fp_step';
const LS_OTP_SENT_AT    = 'fp_otp_sent_at';    // epoch ms when last OTP was sent
const LS_RESEND_AT      = 'fp_resend_at';       // epoch ms when last resend happened
const LS_BLOCKED_UNTIL  = 'fp_blocked_until';   // epoch ms when block expires (from server)
const LS_RESEND_COUNT   = 'fp_resend_count';    // number of resends used (0‥MAX_RESENDS)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const now = () => Date.now();

/** Seconds remaining until a future epoch timestamp, floored to 0. */
const secsUntil = (epochMs: number | null) =>
  epochMs ? Math.max(0, Math.ceil((epochMs - now()) / 1000)) : 0;

// ─── Password Rules ───────────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',         test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'At least one lowercase letter',  test: (p: string) => /[a-z]/.test(p) },
  { id: 'digit',     label: 'At least one digit (0–9)',       test: (p: string) => /[0-9]/.test(p) },
  { id: 'special',   label: 'At least one special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];
const isPasswordStrong = (p: string) => PASSWORD_RULES.every(r => r.test(p));

// ─── Sub-components ───────────────────────────────────────────────────────────

const OtpTimer = ({ seconds, total }: { seconds: number; total: number }) => {
  const radius       = 20;
  const circumference = 2 * Math.PI * radius;
  const progress     = (seconds / total) * circumference;
  const isUrgent     = seconds <= 60;
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={radius} fill="none"
          stroke={isUrgent ? '#EF4444' : '#16A34A'}
          strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
        <foreignObject x="16" y="16" width="24" height="24">
          <Clock
            // @ts-ignore
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 24, height: 24, color: isUrgent ? '#EF4444' : '#16A34A' }}
          />
        </foreignObject>
      </svg>
      <span className={`text-xs font-semibold tabular-nums ${isUrgent ? 'text-red-500' : 'text-green-600'}`}>
        {mm}:{ss}
      </span>
      <span className="text-xs text-gray-500">remaining</span>
    </div>
  );
};

const PasswordStrengthChecker = ({ password }: { password: string }) => {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map(rule => {
        const passed = rule.test(password);
        return (
          <li key={rule.id} className={`flex items-center gap-2 text-xs ${passed ? 'text-green-600' : 'text-red-500'}`}>
            {passed ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <XCircle className="h-3.5 w-3.5 flex-shrink-0" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
};

const PasswordInput = ({
  id, name, value, onChange, placeholder,
}: {
  id: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} name={name} type={show ? 'text' : 'password'} required
        value={value} onChange={onChange}
        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl
                   focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
        placeholder={placeholder} autoComplete="new-password"
      />
      <button
        type="button" onClick={() => setShow(s => !s)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const navigate = useNavigate();

  // ── Persisted state (restored from localStorage on mount) ─────────────────
  // step: 1 = email entry, 2 = OTP verify, 3 = set new password
  const [step, setStep]       = useState<number>(() => Number(localStorage.getItem(LS_STEP) || '1'));
  const [email, setEmail]     = useState<string>(() => localStorage.getItem(LS_EMAIL) || '');

  // Epoch-ms timestamps — the source of truth for timers.
  // Storing timestamps (not countdowns) means refresh can always compute "how much left".
  const [otpSentAt,    setOtpSentAt]    = useState<number | null>(() => Number(localStorage.getItem(LS_OTP_SENT_AT))   || null);
  const [resendAt,     setResendAt]     = useState<number | null>(() => Number(localStorage.getItem(LS_RESEND_AT))     || null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(() => Number(localStorage.getItem(LS_BLOCKED_UNTIL)) || null);
  const [resendCount,  setResendCount]  = useState<number>(() => Number(localStorage.getItem(LS_RESEND_COUNT) || '0'));

  // ── Derived tick state (re-computed every second) ─────────────────────────
  const [otpSecsLeft,    setOtpSecsLeft]    = useState(() => secsUntil(otpSentAt ? otpSentAt + OTP_EXPIRY_SECONDS * 1000 : null));
  const [resendSecsLeft, setResendSecsLeft] = useState(() => secsUntil(resendAt  ? resendAt  + RESEND_COOLDOWN_SECS * 1000 : null));
  const [blockSecsLeft,  setBlockSecsLeft]  = useState(() => secsUntil(blockedUntil));

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ otp: '', newPassword: '', confirmPassword: '' });

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Single interval that drives all derived countdown values ──────────────
  // Because we store epoch timestamps, the tick simply recomputes from wall clock.
  // This means refresh doesn't "lose" time — the ms count is always Date.now()-based.
  const startTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setOtpSecsLeft(prev => {
        const next = secsUntil(
          otpSentAtRef.current ? otpSentAtRef.current + OTP_EXPIRY_SECONDS * 1000 : null
        );
        if (prev > 0 && next === 0) toast.error('OTP has expired. Please request a new one.');
        return next;
      });
      setResendSecsLeft(secsUntil(resendAtRef.current ? resendAtRef.current + RESEND_COOLDOWN_SECS * 1000 : null));
      setBlockSecsLeft(secsUntil(blockedUntilRef.current));
    }, 1000);
  }, []);

  // Refs so the interval closure always sees current values without re-creating the interval
  const otpSentAtRef     = useRef(otpSentAt);
  const resendAtRef      = useRef(resendAt);
  const blockedUntilRef  = useRef(blockedUntil);

  useEffect(() => { otpSentAtRef.current    = otpSentAt;    }, [otpSentAt]);
  useEffect(() => { resendAtRef.current     = resendAt;     }, [resendAt]);
  useEffect(() => { blockedUntilRef.current = blockedUntil; }, [blockedUntil]);

  // ── On mount: restore state and check server for block status ─────────────
  useEffect(() => {
    startTick();

    // If we have an email and were on step 2, verify server-side block status.
    // This is the key piece: even if localStorage is cleared, the server still knows.
    const savedEmail = localStorage.getItem(LS_EMAIL);
    const savedStep  = Number(localStorage.getItem(LS_STEP) || '1');

    if (savedEmail && savedStep === 2) {
      axios.post(`${API_BASE_URL}/otp-status`, { email: savedEmail })
        .then(({ data }) => {
          if (data.isBlocked && data.blockedUntil) {
            const until = new Date(data.blockedUntil).getTime();
            setBlockedUntil(until);
            blockedUntilRef.current = until;
            localStorage.setItem(LS_BLOCKED_UNTIL, String(until));
          }
          // Sync attempt count from server (authoritative source)
          if (typeof data.attemptsUsed === 'number') {
            // attemptsUsed counts how many times /forgot-password was called
            // Our resendCount = attemptsUsed - 1 (first send is not a "resend")
            const serverResendCount = Math.max(0, data.attemptsUsed - 1);
            setResendCount(serverResendCount);
            localStorage.setItem(LS_RESEND_COUNT, String(serverResendCount));
          }
        })
        .catch(() => {/* network error — use localStorage values */});
    }

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist to localStorage whenever key values change ────────────────────
  useEffect(() => { localStorage.setItem(LS_STEP, String(step)); }, [step]);
  useEffect(() => { localStorage.setItem(LS_EMAIL, email); }, [email]);
  useEffect(() => { if (otpSentAt) localStorage.setItem(LS_OTP_SENT_AT, String(otpSentAt)); }, [otpSentAt]);
  useEffect(() => { if (resendAt)  localStorage.setItem(LS_RESEND_AT,   String(resendAt));  }, [resendAt]);
  useEffect(() => {
    if (blockedUntil) localStorage.setItem(LS_BLOCKED_UNTIL, String(blockedUntil));
    else              localStorage.removeItem(LS_BLOCKED_UNTIL);
  }, [blockedUntil]);
  useEffect(() => { localStorage.setItem(LS_RESEND_COUNT, String(resendCount)); }, [resendCount]);

  // ── Clear all persisted state (called on successful reset or back-to-step-1) ─
  const clearPersistedState = () => {
    [LS_EMAIL, LS_STEP, LS_OTP_SENT_AT, LS_RESEND_AT, LS_BLOCKED_UNTIL, LS_RESEND_COUNT]
      .forEach(k => localStorage.removeItem(k));
  };

  // Helper: record that an OTP was just sent right now
  const recordOtpSent = (serverBlockedUntil?: string | null) => {
    const sentAt = now();
    setOtpSentAt(sentAt);
    otpSentAtRef.current = sentAt;
    setResendAt(sentAt);
    resendAtRef.current = sentAt;

    // Recompute derived values immediately (don't wait for next tick)
    setOtpSecsLeft(OTP_EXPIRY_SECONDS);
    setResendSecsLeft(RESEND_COOLDOWN_SECS);

    if (serverBlockedUntil) {
      const until = new Date(serverBlockedUntil).getTime();
      setBlockedUntil(until);
      blockedUntilRef.current = until;
      setBlockSecsLeft(secsUntil(until));
    }
  };

  // ── Input change ──────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') { setEmail(value); return; }
    if (name === 'otp') {
      setFormData(prev => ({ ...prev, otp: value.replace(/\D/g, '').slice(0, 6) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email });

      // First send counts as resend 0 — user still has MAX_RESENDS left
      setResendCount(0);
      recordOtpSent();
      setStep(2);
      toast.success('OTP sent to your email! Valid for 5 minutes.');
    } catch (error: any) {
      const data = error.response?.data;
      // If server says blocked, capture the timestamp so we can show the right timer
      if (error.response?.status === 429 && data?.blockedUntil) {
        const until = new Date(data.blockedUntil).getTime();
        setBlockedUntil(until);
        blockedUntilRef.current = until;
        localStorage.setItem(LS_BLOCKED_UNTIL, String(until));
      }
      toast.error(data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    // Guard: respect both client-side counts AND server block
    if (resendCount >= MAX_RESENDS) { toast.error('Maximum resend attempts reached'); return; }
    if (resendSecsLeft > 0)         { return; }
    if (blockSecsLeft > 0)          { return; }

    setLoading(true);
    setFormData(prev => ({ ...prev, otp: '' }));
    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email });

      const newCount = resendCount + 1;
      setResendCount(newCount);
      recordOtpSent();
      toast.success('New OTP sent! Valid for 5 minutes.');
    } catch (error: any) {
      const data = error.response?.data;
      if (error.response?.status === 429 && data?.blockedUntil) {
        const until = new Date(data.blockedUntil).getTime();
        setBlockedUntil(until);
        blockedUntilRef.current = until;
        localStorage.setItem(LS_BLOCKED_UNTIL, String(until));
        setBlockSecsLeft(secsUntil(until));
      }
      toast.error(data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp)               { toast.error('Please enter the OTP'); return; }
    if (formData.otp.length !== 6)   { toast.error('OTP must be exactly 6 digits'); return; }
    if (otpSecsLeft === 0)           { toast.error('OTP has expired. Please request a new one.'); return; }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp: formData.otp });
      if (tickRef.current) clearInterval(tickRef.current);
      setStep(3);
      toast.success('OTP verified! Please set your new password.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong(formData.newPassword))           { toast.error('Password does not meet strength requirements'); return; }
    if (formData.newPassword !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/reset-password`, {
        email, otp: formData.otp, newPassword: formData.newPassword,
      });
      clearPersistedState();
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // ── Go back to step 1 ─────────────────────────────────────────────────────
  const handleBackToEmail = () => {
    clearPersistedState();
    if (tickRef.current) clearInterval(tickRef.current);
    setStep(1);
    setEmail('');
    setOtpSentAt(null);
    setResendAt(null);
    setBlockedUntil(null);
    setResendCount(0);
    setOtpSecsLeft(0);
    setResendSecsLeft(0);
    setBlockSecsLeft(0);
    setFormData({ otp: '', newPassword: '', confirmPassword: '' });
  };

  // ── Derived booleans used in render ──────────────────────────────────────
  const otpExpired        = otpSentAt !== null && otpSecsLeft === 0 && step === 2;
  const isServerBlocked   = blockSecsLeft > 0;
  const resendExhausted   = resendCount >= MAX_RESENDS;
  const resendOnCooldown  = resendSecsLeft > 0;
  const canResend         = !isServerBlocked && !resendExhausted && !resendOnCooldown && !loading;

  // Format block countdown as HH:MM:SS
  const fmtBlock = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`
      : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ─── Step Renderers ───────────────────────────────────────────────────────

  const renderStep1 = () => (
    <form onSubmit={handleSendOTP} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email" name="email" type="email" required
            value={email} onChange={handleInputChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl
                       focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            placeholder="Enter your email address"
          />
        </div>
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl
                   font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Spinner label="Sending OTP…" /> : 'Send OTP'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">

      {/* ── Server block banner ── */}
      {isServerBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-red-600 font-semibold text-sm mb-1">🔒 Too many OTP requests</div>
          <div className="text-red-500 text-xs">
            Blocked for <span className="font-mono font-bold">{fmtBlock(blockSecsLeft)}</span>
          </div>
          <div className="text-red-400 text-xs mt-1">This timer continues even after refresh.</div>
        </div>
      )}

      {/* ── OTP expiry timer ── */}
      <div className="flex flex-col items-center gap-2">
        {otpExpired ? (
          <div className="text-red-500 text-sm font-semibold text-center">⏰ OTP Expired</div>
        ) : (
          <OtpTimer seconds={otpSecsLeft} total={OTP_EXPIRY_SECONDS} />
        )}
        <p className="text-xs text-gray-500 text-center">
          OTP sent to <strong>{email}</strong>
        </p>
      </div>

      {/* ── OTP input ── */}
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
          Enter 6-Digit OTP
        </label>
        <input
          id="otp" name="otp" type="text" inputMode="numeric"
          required maxLength={6}
          value={formData.otp} onChange={handleInputChange}
          disabled={otpExpired}
          className={`block w-full px-4 py-3 border rounded-xl text-center text-2xl
                      tracking-[0.5em] font-mono focus:ring-2 focus:ring-green-500
                      focus:border-transparent transition
                      ${otpExpired
                        ? 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed'
                        : 'border-gray-300'}`}
          placeholder="••••••"
        />
        <p className="mt-1 text-xs text-gray-400 text-right">
          {formData.otp.length}/6 digits entered
        </p>
      </div>

      {/* ── Back / Verify buttons ── */}
      <div className="flex space-x-3">
        <button
          type="button" onClick={handleBackToEmail}
          className="flex-1 border border-gray-300 hover:border-green-500 text-gray-700
                     hover:text-green-600 py-3 px-4 rounded-xl font-medium transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || otpExpired || formData.otp.length !== 6}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl
                     font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Spinner label="Verifying…" /> : 'Verify OTP'}
        </button>
      </div>

      {/* ── Resend section ── */}
      <div className="text-center space-y-1">
        {isServerBlocked ? (
          <p className="text-xs text-red-500">
            Resend locked — try again in <span className="font-mono font-bold">{fmtBlock(blockSecsLeft)}</span>
          </p>
        ) : resendExhausted ? (
          <p className="text-xs text-gray-400">Maximum resend attempts reached</p>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={!canResend}
            className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400
                       disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? 'Sending…'
              : resendOnCooldown
                ? `Resend OTP in ${Math.floor(resendSecsLeft / 60)}:${String(resendSecsLeft % 60).padStart(2, '0')}`
                : `Resend OTP (${MAX_RESENDS - resendCount} left)`
            }
          </button>
        )}
        {/* Attempt indicator dots */}
        <div className="flex justify-center gap-2 mt-2">
          {Array.from({ length: MAX_RESENDS + 1 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < resendCount + 1
                  ? isServerBlocked ? 'bg-red-400' : 'bg-green-500'
                  : 'bg-gray-200'
              }`}
              title={i === 0 ? 'Initial OTP' : `Resend ${i}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400">
          {resendCount + 1}/{MAX_RESENDS + 1} OTPs used
        </p>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <PasswordInput
          id="newPassword" name="newPassword"
          value={formData.newPassword} onChange={handleInputChange}
          placeholder="Enter new password"
        />
        <PasswordStrengthChecker password={formData.newPassword} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <PasswordInput
          id="confirmPassword" name="confirmPassword"
          value={formData.confirmPassword} onChange={handleInputChange}
          placeholder="Re-enter new password"
        />
        {formData.confirmPassword.length > 0 && (
          <p className={`mt-1 text-xs flex items-center gap-1 ${
            formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-500'
          }`}>
            {formData.newPassword === formData.confirmPassword
              ? <><CheckCircle className="h-3.5 w-3.5" /> Passwords match</>
              : <><XCircle    className="h-3.5 w-3.5" /> Passwords do not match</>
            }
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !isPasswordStrong(formData.newPassword) || formData.newPassword !== formData.confirmPassword}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl
                   font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Spinner label="Resetting Password…" /> : 'Reset Password'}
      </button>
    </form>
  );

  const STEP_META = [
    { title: 'Forgot Password?',  desc: "Enter your email and we'll send you an OTP to reset your password." },
    { title: 'Verify OTP',        desc: 'Enter the 6-digit OTP sent to your email. It expires in 5 minutes.' },
    { title: 'Set New Password',  desc: 'Create a strong new password for your account.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50
                    flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-green-600 p-3 rounded-2xl shadow-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{STEP_META[step - 1].title}</h2>
          <p className="mt-2 text-sm text-gray-600">{STEP_META[step - 1].desc}</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map(n => (
            <React.Fragment key={n}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                              transition-colors duration-300
                              ${n < step   ? 'bg-green-600 text-white ring-2 ring-green-200'
                              : n === step  ? 'bg-green-600 text-white ring-4 ring-green-100'
                              : 'bg-gray-200 text-gray-500'}`}>
                {n < step ? <CheckCircle className="h-4 w-4" /> : n}
              </div>
              {n < 3 && (
                <div className={`h-1 w-10 rounded-full transition-colors duration-500
                                 ${n < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-green-600
                         hover:text-green-700 font-medium transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Spinner = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center gap-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
    {label}
  </div>
);

export default ForgotPassword;