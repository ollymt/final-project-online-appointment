// ─── Regex patterns ───────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// PH mobile: 09XXXXXXXXX or +639XXXXXXXXX (11 or 13 chars)
const PH_PHONE_RE = /^(09\d{9}|\+639\d{9})$/;
// Name: letters, spaces, hyphens, periods, apostrophes only
const NAME_RE = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-.]+$/;

// ─── Individual field validators ──────────────────────────────────────────────
export const validateEmail = (value) => {
  const v = value?.trim() ?? '';
  if (!v) return 'Email address is required.';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address (e.g. you@example.com).';
  return null;
};

export const validatePassword = (value) => {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return null;
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
};

export const validateName = (value, fieldLabel = 'Name') => {
  const v = value?.trim() ?? '';
  if (!v) return `${fieldLabel} is required.`;
  if (v.length < 2) return `${fieldLabel} must be at least 2 characters.`;
  if (v.length > 80) return `${fieldLabel} must be 80 characters or less.`;
  if (!NAME_RE.test(v)) return `${fieldLabel} can only contain letters, spaces, hyphens, or apostrophes.`;
  // Must have at least two words (first + last name)
  if (fieldLabel === 'Full name' && v.split(/\s+/).filter(Boolean).length < 2) {
    return 'Please enter your first and last name.';
  }
  return null;
};

export const validatePhone = (value, required = false) => {
  const v = value?.trim() ?? '';
  if (!v) return required ? 'Phone number is required.' : null;
  if (!PH_PHONE_RE.test(v)) return 'Enter a valid PH mobile number (e.g. 09171234567).';
  return null;
};

export const validateService = (value) => {
  if (!value) return 'Please select a service.';
  return null;
};

export const validateDate = (value) => {
  if (!value) return 'Please select an appointment date.';
  return null;
};

export const validateTime = (value) => {
  if (!value) return 'Please select an appointment time.';
  return null;
};

export const validateNotes = (value, maxLength = 300) => {
  if (value && value.length > maxLength) return `Notes must be ${maxLength} characters or less.`;
  return null;
};

// ─── Password strength ────────────────────────────────────────────────────────
export const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: null };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#E74C3C' };
  if (score <= 2) return { score, label: 'Fair', color: '#F39C12' };
  if (score <= 3) return { score, label: 'Good', color: '#3498DB' };
  return { score, label: 'Strong', color: '#27AE60' };
};

// ─── Run a map of validators at once ─────────────────────────────────────────
// validators: { fieldName: () => errorStringOrNull }
export const runValidators = (validators) => {
  const errors = {};
  for (const [field, fn] of Object.entries(validators)) {
    const err = fn();
    if (err) errors[field] = err;
  }
  return errors; // empty object = all valid
};