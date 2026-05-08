// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AXON = {
  // Palette aligned with AXON Brand Identity System
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

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const navigate = useNavigate();

  const validate = (fields) => {
    const e = {};

    if (!fields.email.trim()) {
      e.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      e.email = 'Enter a valid email';
    }

    if (!fields.password) {
      e.password = 'Required';
    } else if (fields.password.length < 6) {
      e.password = 'At least 6 characters';
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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (touched[field]) {
      const e = validate({
        ...form,
        [field]: value,
      });

      setErrors((prev) => ({
        ...prev,
        [field]: e[field],
      }));
    }
  };

  const handleSubmit = async () => {
    const allTouched = {
      email: true,
      password: true,
    };

    setTouched(allTouched);

    const e = validate(form);
    setErrors(e);

    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setGlobalError('');

    try {
      await new Promise((r) => setTimeout(r, 700));

      onLogin();
      navigate('/');
    } catch {
      setGlobalError(
        'Incorrect email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
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
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
        }}
      >
        {/* Main Card */}
        <div
          style={{
            background: AXON.surface,
            border: `1px solid ${AXON.border}`,
            padding: '46px',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          }}
        >
          {/* Logo + Title inside blue box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                color: AXON.primary,
                fontSize: '32px',
                fontWeight: '700',
              }}
            >
              <svg
  width="33"
  height="33"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1px',
  }}
>
  <path
    d="M13.2 2L5.8 13H11L9.8 22L18.2 10.8H13.6L13.2 2Z"
    fill={AXON.primary}
  />
</svg> 
            </span>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '30px',
                  fontWeight: '700',
                  color: AXON.primary,
                  letterSpacing: '0.03em',
                }}
              >
                AXON
              </h1>

              {/* Description line */}
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.65)',
                  letterSpacing: '0.02em',
                }}
              >
                Intelligent AI automation workspace
              </p>
            </div>
          </div>

          {/* Sign in text */}
          <div style={{ marginTop: '34px' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: AXON.textHeadline,
                marginBottom: '8px',
              }}
            >
              Sign in
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: AXON.textMain,
                marginBottom: '30px',
              }}
            >
              Welcome back. Enter your credentials to continue.
            </p>
          </div>

          {/* Global error */}
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

          {/* Fields */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
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
              autoComplete="email"
            />

            <Field
              label="Password"
              hint="Forgot password?"
              id="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                handleChange('password', e.target.value)
              }
              onBlur={() => handleBlur('password')}
              error={touched.password && errors.password}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          {/* Submit */}
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '28px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background: AXON.border,
              }}
            />

            <span
              style={{
                fontSize: '11px',
                color: AXON.textMuted,
              }}
            >
              or
            </span>

            <div
              style={{
                flex: 1,
                height: '1px',
                background: AXON.border,
              }}
            />
          </div>

          {/* Register */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: AXON.textMain,
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: AXON.primary,
                textDecoration: 'none',
                fontWeight: '700',
              }}
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Bottom note */}
        <p
          style={{
            marginTop: '22px',
            textAlign: 'center',
            fontSize: '11px',
            color: AXON.textMuted,
            lineHeight: '1.6',
          }}
        >
          Use demo@axon.app with any password to sign in during Day 1.
        </p>
      </div>
    </div>
  );
}