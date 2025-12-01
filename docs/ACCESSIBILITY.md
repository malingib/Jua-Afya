# Accessibility Guidelines

This document outlines accessibility best practices for the JuaAfya application.

## Overview

Accessibility ensures the application is usable by everyone, including people with disabilities. This includes:
- Visual impairments (blindness, low vision, color blindness)
- Hearing impairments (deafness, hard of hearing)
- Motor impairments (difficulty using mouse, tremors)
- Cognitive impairments (dyslexia, memory issues)

## WCAG 2.1 Compliance

We aim for WCAG 2.1 Level AA compliance:
- **A**: Minimum accessibility
- **AA**: Enhanced accessibility (our target)
- **AAA**: Highest accessibility

## Key Areas

### 1. Semantic HTML

Use proper HTML elements:

```html
<!-- ✅ Good -->
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- ❌ Bad -->
<div class="nav">
  <div class="item"><span>Home</span></div>
  <div class="item"><span>About</span></div>
</div>
```

Use semantic elements:
- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- `<button>` instead of `<div onClick>`
- `<form>`, `<label>`, `<input>`

### 2. ARIA Labels

Add ARIA attributes for clarity:

```html
<!-- Buttons -->
<button aria-label="Close modal">✕</button>

<!-- Live regions (screen reader updates) -->
<div aria-live="polite" aria-atomic="true">
  {{ message }}
</div>

<!-- Descriptions -->
<input aria-describedby="password-hint" />
<div id="password-hint">Must be at least 8 characters</div>

<!-- Roles -->
<div role="alert">{{ error }}</div>
<div role="status">Loading...</div>
```

### 3. Keyboard Navigation

All functionality must be keyboard accessible:

```typescript
// ✅ Good - supports Enter and Space
<button onKeyDown={handleKeyboardActivation}>
  Click me
</button>

// Add tabIndex for custom interactive elements
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyboard}
>
  Custom button
</div>

// Tab order
<input tabIndex="1" /> {/* First */}
<input tabIndex="2" /> {/* Second */}
<button tabIndex="-1" /> {/* Skip in tab order */}
```

### 4. Color Contrast

Ensure sufficient color contrast (WCAG AA):
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

```typescript
import { validateContrast } from '@/utils/accessibility';

// Check contrast
const isReadable = validateContrast('#333333', '#FFFFFF');
```

### 5. Text Alternatives

Provide alt text for images:

```html
<!-- ✅ Good -->
<img src="chart.png" alt="Monthly revenue chart showing growth trend" />
<img src="avatar.png" alt="Dr. Andrew's profile picture" />

<!-- ❌ Bad -->
<img src="chart.png" alt="chart" />
<img src="avatar.png" alt="image" />
<img src="icon.png" alt="" /> {/* Only if decorative */}
```

### 6. Form Accessibility

Make forms accessible:

```html
<label for="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-hint"
  required
/>
<div id="email-hint">We'll never share your email</div>

<!-- Error messages -->
<input aria-invalid="true" aria-describedby="email-error" />
<div id="email-error" role="alert">Invalid email format</div>
```

In React:

```typescript
import { FormInput } from '@/components/common';

<FormInput
  id="email"
  label="Email Address"
  error={errors.email}
  helper="We'll never share your email"
/>
```

### 7. Headings Structure

Use headings properly:

```html
<!-- ✅ Good -->
<h1>JuaAfya Dashboard</h1>
<h2>Patients</h2>
<h3>Recently Visited</h3>

<!-- ❌ Bad -->
<h1>JuaAfya</h1>
<h3>Patients</h3> {/* Skipped h2 */}
<h2>Recently Visited</h2>
```

## Implementation

### Using Accessibility Utilities

```typescript
import { announce, generateId, handleKeyboardActivation } from '@/utils/accessibility';

// Generate unique IDs
const inputId = generateId('form-input');

// Announce to screen readers
announce('Patient saved successfully');

// Handle keyboard
<button
  onKeyDown={(e) => handleKeyboardActivation(e, handleSubmit)}
/>
```

### Component Accessibility

#### Modal Component
```typescript
<Modal
  isOpen={true}
  title="Edit Patient"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  Content
</Modal>
```

#### FormInput Component
```typescript
<FormInput
  label="Phone Number"
  error={error}
  helper="Format: +254712345678"
/>
```

#### Button Component
```typescript
<Button
  aria-label="Save changes"
  aria-busy={isLoading}
>
  Save
</Button>
```

## Testing Accessibility

### Manual Testing

1. **Keyboard Navigation**
   - Use Tab to navigate
   - Shift+Tab to go backwards
   - Enter/Space to activate

2. **Screen Reader Testing**
   - Use NVDA (Windows), VoiceOver (Mac), JAWS
   - Navigate page and check announcements

3. **Color Contrast**
   - Use browser DevTools accessibility audit
   - Check against WCAG standards

### Automated Testing

```bash
# Axe DevTools (browser extension)
# Great for automated scanning

# Lighthouse (in Chrome DevTools)
# Includes accessibility audit

# Wave (browser extension)
# Visual feedback on accessibility issues
```

## Checklist

Before deploying:

- [ ] All buttons have text or aria-label
- [ ] All images have meaningful alt text
- [ ] Links are underlined or clearly distinguishable
- [ ] Color isn't the only indicator (use icons/text too)
- [ ] Form labels associated with inputs
- [ ] Error messages linked to fields
- [ ] Headings form a logical outline
- [ ] No keyboard traps
- [ ] Focus visible on all elements
- [ ] Modals set focus properly
- [ ] ARIA used correctly
- [ ] Video/audio has captions
- [ ] Text has sufficient contrast
- [ ] No flashing content (>3 times/second)

## Common Issues

### Image Alt Text
```html
<!-- ❌ Bad -->
<img src="doctor.jpg" alt="Doctor" />

<!-- ✅ Good -->
<img src="doctor.jpg" alt="Dr. Andrew Kimani wearing white coat in clinic" />
```

### Icon Buttons
```typescript
// ❌ Bad
<button><TrashIcon /></button>

// ✅ Good
<button aria-label="Delete patient">
  <TrashIcon />
</button>
```

### Color Only
```typescript
// ❌ Bad
<div className={error ? 'text-red-600' : 'text-green-600'}>
  Status
</div>

// ✅ Good
<div className={error ? 'text-red-600' : 'text-green-600'}>
  <CheckCircle /> {error ? 'Error' : 'Success'}
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM](https://webaim.org/)

## Support

For accessibility questions or issues:
1. Check the guidelines above
2. Review WCAG 2.1 documentation
3. Test with screen readers
4. Ask for review in PRs
