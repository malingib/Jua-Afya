/**
 * Accessibility Utilities
 * Helpers for implementing accessible UI patterns
 */

/**
 * Generate unique ID for accessibility attributes
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce content to screen readers
 */
export const announce = (
  message: string,
  role: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', role);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Visually hidden
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, 1000);
};

/**
 * Handle keyboard navigation (Enter and Space)
 */
export const handleKeyboardActivation = (
  event: React.KeyboardEvent,
  handler: () => void
): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handler();
  }
};

/**
 * Create accessible button props
 */
export const getAccessibleButtonProps = (
  onClick: () => void,
  disabled: boolean = false
) => ({
  onClick,
  onKeyDown: (e: React.KeyboardEvent) => handleKeyboardActivation(e, onClick),
  disabled,
  role: 'button' as const,
  tabIndex: disabled ? -1 : 0,
});

/**
 * Create accessible link props
 */
export const getAccessibleLinkProps = (href: string, external: boolean = false) => ({
  href,
  target: external ? '_blank' : undefined,
  rel: external ? 'noopener noreferrer' : undefined,
});

/**
 * Validate color contrast (WCAG AA standard)
 * Returns true if contrast ratio is >= 4.5:1 for normal text
 */
export const validateContrast = (
  foregroundColor: string,
  backgroundColor: string
): boolean => {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const luminance =
      (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance;
  };

  const l1 = getLuminance(foregroundColor);
  const l2 = getLuminance(backgroundColor);

  const lighterColor = Math.max(l1, l2);
  const darkerColor = Math.min(l1, l2);

  const contrastRatio = (lighterColor + 0.05) / (darkerColor + 0.05);

  return contrastRatio >= 4.5;
};

/**
 * Skip to main content link
 */
export const createSkipLink = (): string => {
  const skipLinkId = generateId('skip-to-main');
  return skipLinkId;
};

/**
 * Create screen reader only text element
 */
export const srOnly = {
  className: 'sr-only',
  style: {
    position: 'absolute' as const,
    width: '1px' as const,
    height: '1px' as const,
    padding: '0' as const,
    margin: '-1px' as const,
    overflow: 'hidden' as const,
    clip: 'rect(0, 0, 0, 0)' as const,
    whiteSpace: 'nowrap' as const,
    borderWidth: '0' as const,
  },
};

export default {
  generateId,
  announce,
  handleKeyboardActivation,
  getAccessibleButtonProps,
  getAccessibleLinkProps,
  validateContrast,
  createSkipLink,
  srOnly,
};
