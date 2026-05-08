// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

export default function Register() {
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
  const [success, setSuccess] = useState(false);

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
    const allTouched = {
      name: true,
      email: true,
      password: true,
      confirm: true,
    };

    setTouched(allTouched);

    const e = validate(form);

    setErrors(e);

    if (Object.keys(e).length > 0) return;

    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 700));

      setSuccess(true);

      setTimeout(() => navigate('/login'), 1500);
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
            border: `1px solid ${AXON.border}`,
            padding: '46px',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}
          >
            <svg
              width="33"
              height="33"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M13.2 2L5.8 13H11L9.8 22L18.2 10.8H13.6L13.2 2Z"
                fill={AXON.primary}
              />
            </svg>

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

              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                Intelligent AI automation workspace
              </p>
            </div>
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

          {success ? (
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
  );
}