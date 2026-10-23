/**
 * CampusConnect Domain & Email Validator Utility
 * Provides safe email normalization, strict dot-boundary subdomain matching,
 * disposable domain protection, and institutional validation.
 */

// Public / generic free email providers that can never be an institutional domain
const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'rediffmail.com',
  'gmx.com',
  'mail.com',
]);

// Known disposable / temporary email domains to reject immediately
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'trashmail.com',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'maildrop.cc',
  'inboxkitten.com',
  'generator.email',
  'mytemp.email',
  'emailondeck.com',
  'tempinbox.com',
  'fakeinbox.com',
]);

/**
 * Normalizes email by trimming whitespace and lowercasing the entire address.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim().toLowerCase();
  return trimmed;
}

/**
 * Extracts and normalizes the domain from an email address.
 */
export function extractEmailDomain(email: string): string {
  const normalized = normalizeEmail(email);
  const parts = normalized.split('@');
  if (parts.length !== 2) return '';
  return parts[1].trim();
}

/**
 * Validates domain syntax (labels with hyphens/alphanumerics, proper dot separation, valid TLD)
 */
export function isValidDomainSyntax(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  // RFC 1035 / 1123 compliant domain regex
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  return domainRegex.test(domain);
}

/**
 * Checks whether a domain is disposable or a generic personal email provider.
 */
export function isSuspiciousOrDisposableDomain(domain: string): boolean {
  const d = domain.toLowerCase().trim();
  if (PUBLIC_EMAIL_DOMAINS.has(d)) return true;
  if (DISPOSABLE_EMAIL_DOMAINS.has(d)) return true;

  // Check if subdomain of disposable service
  for (const disp of DISPOSABLE_EMAIL_DOMAINS) {
    if (d.endsWith(`.${disp}`)) return true;
  }

  return false;
}

/**
 * Strict dot-boundary subdomain and exact domain matching.
 * Matches:
 *  - emailDomain === approvedDomain (e.g. "gla.ac.in" === "gla.ac.in")
 *  - emailDomain.endsWith("." + approvedDomain) (e.g. "student.gla.ac.in" endsWith ".gla.ac.in")
 * 
 * Rejects:
 *  - "fakegla.ac.in" against "gla.ac.in" (no dot boundary)
 *  - "gla.ac.in.evil.com" against "gla.ac.in" (reversed hierarchy)
 */
export function isInstitutionalDomainAllowed(
  emailDomain: string,
  approvedDomains: string[]
): boolean {
  if (!emailDomain || !approvedDomains || approvedDomains.length === 0) return false;

  const normalizedCandidate = emailDomain.toLowerCase().trim();

  // Reject public email providers (e.g., gmail.com cannot be used even if misconfigured)
  if (isSuspiciousOrDisposableDomain(normalizedCandidate)) {
    return false;
  }

  return approvedDomains.some((approved) => {
    const normApproved = approved.toLowerCase().trim();
    if (!normApproved) return false;

    // Exact match: user@gla.ac.in vs gla.ac.in
    if (normalizedCandidate === normApproved) return true;

    // Subdomain match with strict dot boundary: user@cs.gla.ac.in or user@student.gla.ac.in
    if (normalizedCandidate.endsWith(`.${normApproved}`)) return true;

    return false;
  });
}
