// src/utils/validation.ts

// 1. Strict RFC 5322 Email Regex
const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;

// 2. E.164 Phone Regex for Kenya
const KENYA_PHONE_REGEX = /^(\+254|254|0)?[17][0-9]{8}$/;

// 3. Blocklist of disposable, spam, and nonsense domains
const BLOCKED_DOMAINS = [
  "mail.com",
  "email.com",
  "test.com",
  "example.com",
  "demo.com",
  "tempmail.com",
  "mailinator.com",
  "yopmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "temp-mail.org",
  "dispostable.com",
  "mohmal.com",
  "trashmail.com",
];

export interface ValidationResult {
  isValid: boolean;
  message: string;
  formattedValue?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: "Email address is required." };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Syntax check
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      message:
        "Invalid email format. Please ensure it includes '@' and a valid domain (e.g., .com, .co.ke).",
    };
  }

  // Domain blocklist check
  const domain = trimmedEmail.split("@")[1];
  if (BLOCKED_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      message: `"${domain}" is not a valid email provider. Please use a real email address (e.g., Gmail, Yahoo, Outlook, Safaricom).`,
    };
  }

  return {
    isValid: true,
    message: "Valid email.",
    formattedValue: trimmedEmail,
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, message: "Phone number is required." };
  }

  const trimmedPhone = phone.trim().replace(/\s+/g, "");

  if (!KENYA_PHONE_REGEX.test(trimmedPhone)) {
    return {
      isValid: false,
      message: "Invalid phone format. Use 0712345678 or +254712345678.",
    };
  }

  // Normalize to E.164 format
  let formattedValue = trimmedPhone;
  if (trimmedPhone.startsWith("0")) {
    formattedValue = `+254${trimmedPhone.substring(1)}`;
  } else if (trimmedPhone.startsWith("254")) {
    formattedValue = `+${trimmedPhone}`;
  }

  return { isValid: true, message: "Valid phone number.", formattedValue };
};
