// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import Logo from "../components/Logo";
import gradiantBg from "../gradiant.png";

const AXON = {
  bg: '#1A1A1A',
  surface: '#0A2647',
  surfaceHigh: '#061a33',
  border: '#1E3A5F',
  borderFocus: '#D4AF37',
  primary: '#D4AF37',
  primaryText: '#0A2647',
  textHeadline: '#FFFFFF',
  textMain: '#87CEEB',
  textMuted: '#5A6380',
  textDim: '#5A6380',
  error: '#FF4D4D',
  errorBg: 'rgba(255,77,77,0.08)',
};

const inputBase = {
  width: '100%',
  background: AXON.surface,
  border: `1px solid ${AXON.borderFocus}`,
  borderRadius: '9999px',
  padding: '14px 16px',
  fontSize: '14px',
  color: AXON.textMain,
  outline: 'none',
  fontFamily: 'JetBrains Mono, monospace',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function Field({
  label,
  hint,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <label
          htmlFor={id}
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: error
              ? AXON.error
              : focused
              ? AXON.borderFocus
              : AXON.textMuted,
            transition: 'color 0.15s',
          }}
        >
          {label}
        </label>

        {hint && !error && (
          <span style={{ fontSize: '11px', color: AXON.textMuted }}>
            {hint}
          </span>
        )}

        {error && (
          <span style={{ fontSize: '11px', color: AXON.error }}>
            {error}
          </span>
        )}
      </div>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          setFocused(false);
          onBlur && onBlur(e);
        }}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          ...inputBase,
          borderColor: error
            ? AXON.error
            : focused
            ? AXON.borderFocus
            : AXON.borderFocus,
          boxShadow:
            focused && !error
              ? `0 0 0 2px rgba(212,175,55,0.12)`
              : 'none',
        }}
      />
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#FF4D4D', '#D4AF37', '#87CEEB', '#7CFFB2'];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px',
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '3px',
            borderRadius: '999px',
            background:
              i < score
                ? colors[score - 1]
                : AXON.border,
            transition: 'background 0.2s',
          }}
        />
      ))}

      <span
        style={{
          fontSize: '11px',
          color:
            score > 0
              ? colors[score - 1]
              : AXON.textMuted,
          minWidth: '40px',
          textAlign: 'right',
        }}
      >
        {score > 0 ? labels[score - 1] : ''}
      </span>
    </div>
  );
}

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'Student',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const navigate = useNavigate();

  const validate = (fields) => {
    const e = {};

    if (!fields.name.trim()) {
      e.name = 'Required';
    }

    if (!fields.email.trim()) {
      e.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      e.email = 'Enter valid email';
    }

    if (!fields.password) {
      e.password = 'Required';
    } else if (fields.password.length < 8) {
      e.password = 'At least 8 chars';
    }

    if (!fields.confirm) {
      e.confirm = 'Required';
    } else if (fields.confirm !== fields.password) {
      e.confirm = 'Passwords do not match';
    }

    return e;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const e = validate(form);

    setErrors((prev) => ({
      ...prev,
      [field]: e[field],
    }));
  };

  const handleChange = (field, value) => {
    const updated = {
      ...form,
      [field]: value,
    };

    setForm(updated);

    if (touched[field]) {
      const e = validate(updated);

      setErrors((prev) => ({
        ...prev,
        [field]: e[field],
      }));
    }
  };

  const handleSubmit = async () => {
    const allTouched = { name: true, email: true, password: true, confirm: true };
    setTouched(allTouched);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setGlobalError('');

    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      setGlobalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: AXON.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        fontFamily:
          'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        color: AXON.textMain,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
        }}
      >
        <div
          style={{
            background: AXON.surface,
            backgroundImage: `url(${gradiantBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: `1px solid ${AXON.border}`,
            padding: '46px',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle overlay to keep text readable on top of gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,38,71,0.7)', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              marginBottom: '10px',
            }}
          >
            <Logo size={32} fontSize="28px" />
          </div>

          <div style={{ marginTop: '34px' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: AXON.textHeadline,
                marginBottom: '8px',
              }}
            >
              Create account
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: AXON.textMain,
                marginBottom: '30px',
              }}
            >
              Set up your workspace and begin using AXON.
            </p>
          </div>

          {globalError && (
            <div
              style={{
                background: AXON.errorBg,
                border: `1px solid ${AXON.error}`,
                padding: '10px 14px',
                marginBottom: '20px',
                fontSize: '13px',
                color: AXON.error,
                borderRadius: '10px',
              }}
            >
              {globalError}
            </div>
          )}

          {false ? (
            <div
              style={{
                padding: '18px',
                borderRadius: '14px',
                background: 'rgba(124,255,178,0.08)',
                border: '1px solid #7CFFB2',
                color: '#7CFFB2',
                fontSize: '14px',
              }}
            >
              Account created successfully. Redirecting...
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '22px',
                }}
              >
                <Field
                  label="Full name"
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    handleChange('name', e.target.value)
                  }
                  onBlur={() => handleBlur('name')}
                  error={touched.name && errors.name}
                  placeholder="Your full name"
                />

                <Field
                  label="Email"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    handleChange('email', e.target.value)
                  }
                  onBlur={() => handleBlur('email')}
                  error={touched.email && errors.email}
                  placeholder="you@example.com"
                />

                <div>
                  <Field
                    label="Password"
                    hint="Min 8 characters"
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      handleChange('password', e.target.value)
                    }
                    onBlur={() => handleBlur('password')}
                    error={touched.password && errors.password}
                    placeholder="Create password"
                  />

                  <PasswordStrength password={form.password} />
                </div>

                <Field
                  label="Confirm password"
                  id="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={(e) =>
                    handleChange('confirm', e.target.value)
                  }
                  onBlur={() => handleBlur('confirm')}
                  error={touched.confirm && errors.confirm}
                  placeholder="Repeat password"
                />

                {/* Role selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="role"
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: AXON.textMuted,
                    }}
                  >
                    Role
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="role"
                      value={form.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      style={{
                        width: '100%',
                        appearance: 'none',
                        background: AXON.surface,
                        border: `1px solid ${AXON.borderFocus}`,
                        borderRadius: '9999px',
                        padding: '14px 40px 14px 16px',
                        fontSize: '14px',
                        color: AXON.textMain,
                        outline: 'none',
                        fontFamily: 'JetBrains Mono, monospace',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Student">Student — personal task management & AI chat</option>
                      <option value="Manager">Manager — team calendar, scheduling & planning</option>
                    </select>
                    {/* Chevron icon */}
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke={AXON.primary} strokeWidth="2.5" strokeLinecap="round"
                      style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '11px', color: AXON.textMuted, paddingLeft: '4px' }}>
                    {form.role === 'Manager'
                      ? '✦ Calendar, scheduling & team features will be enabled'
                      : '✦ Personal dashboard, AI chat & kanban board'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '34px',
                  padding: '15px 0',
                  background: loading
                    ? AXON.surfaceHigh
                    : AXON.primary,
                  color: AXON.primaryText,
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s ease',
                  boxShadow: loading
                    ? 'none'
                    : '0 4px 18px rgba(212,175,55,0.18)',
                }}
              >
                {loading
                  ? 'Creating account…'
                  : 'Create account'}
              </button>

              <p
                style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: AXON.textMain,
                  marginTop: '22px',
                }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: AXON.primary,
                    textDecoration: 'none',
                    fontWeight: '700',
                  }}
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}