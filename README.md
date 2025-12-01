<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# JuaAfya - Clinic Management System

A comprehensive, AI-powered clinic management platform built with React, TypeScript, and modern web technologies. Features patient management, appointment scheduling, inventory management, visit workflows, and AI-powered features powered by Google Gemini.

**View in AI Studio:** https://ai.studio/apps/drive/1f-eL7DZIcOas6c1vNim-6Zz4DFgf7A6_

## Features

✨ **Core Features**
- Patient management (CRUD, search, medical history)
- Appointment scheduling and management
- Patient visit workflow (Check-in → Vitals → Consultation → Lab → Billing → Pharmacy → Clearance)
- Pharmacy and inventory management with audit logs
- Bulk SMS broadcast messaging
- Multi-role support (Admin, Doctor, Nurse, Receptionist, Pharmacist, Lab Tech)
- Multi-tenant SaaS admin dashboard
- Dark mode support

🤖 **AI-Powered Features**
- Google Gemini AI for patient note analysis
- AI-powered SMS drafting
- Daily briefing generation
- Interactive AI chatbot for clinic staff

📱 **Communication**
- SMS integration (Mobiwave)
- Patient appointment reminders
- Bulk messaging campaigns

🔒 **Security & Quality**
- Input validation and XSS prevention
- Global error boundary
- Supabase authentication ready
- TypeScript type safety
- Environment variable protection

## Quick Start

### Prerequisites

- **Node.js** 16.0 or higher
- **npm** or **yarn**
- API Keys (get these from the respective services):
  - Google Gemini API key
  - Mobiwave SMS API token
  - Supabase URL and API keys

### Installation

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   ```

2. **Set up environment variables** by copying the example:
   ```bash
   cp .env.example .env.local
   ```

3. **Fill in your credentials** in `.env.local`:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Google Gemini API
   GEMINI_API_KEY=your-gemini-api-key

   # Mobiwave SMS
   SMS_API_KEY=your-sms-token
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Development Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   └── ...             # Feature components
├── context/            # React Context providers (state management)
├── hooks/              # Custom React hooks
├── services/           # External API integrations
├── utils/              # Utility functions and helpers
├── types.ts            # TypeScript type definitions
├── constants.ts        # Mock data and constants
└── App.tsx             # Main app component
```

## Architecture Highlights

### State Management
- **React Context API** for global state (PatientContext, InventoryContext, VisitContext)
- **Custom Hooks** for common patterns (useAsync, useLocalStorage, useDebounce)
- **No prop drilling** - contexts + hooks eliminate deep prop passing

### Components
- **Smart Components** (containers) - access data from context, handle logic
- **Dumb Components** (presentational) - pure render functions, receive data via props
- **Reusable UI Library** - Modal, Button, FormInput, Card, Alert, LoadingSpinner

### Security
- Input validation for all user inputs
- XSS prevention with sanitization
- Global error boundary for graceful error handling
- API key protection (environment variables only)
- Error logging and monitoring ready

### Performance
- Lazy loading ready (React.lazy + Suspense)
- LocalStorage caching for offline support
- Debounced state updates for expensive operations
- Memoization hooks available (React.memo, useMemo)

## Configuration

### Environment Variables

Refer to [.env.example](./.env.example) for all available options:

```env
# Required
VITE_SUPABASE_URL=              # Supabase project URL
VITE_SUPABASE_ANON_KEY=         # Supabase public API key
GEMINI_API_KEY=                 # Google Gemini API key
SMS_API_KEY=                    # Mobiwave SMS API token

# Optional
VITE_API_URL=http://localhost:3001
LOG_LEVEL=debug
NODE_ENV=development
```

## Testing

Testing setup is coming in Phase 3. Currently, the app includes:
- TypeScript for static type checking
- Input validation utilities
- Error boundary for runtime error handling

To add tests:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deployment Platforms

The app can be deployed to:
- **Netlify** - Static hosting with serverless functions
- **Vercel** - Optimized for React/Next.js
- **Railway** - Container deployment
- **Fly.io** - Docker container hosting

### Environment Variables for Production

Set these in your deployment platform's environment settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `SMS_API_KEY`

## Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS (CDN)
- **UI Icons:** Lucide React
- **Charts:** Recharts
- **Authentication:** Supabase
- **AI:** Google Gemini API
- **SMS:** Mobiwave API

## Code Quality

### TypeScript
- Full TypeScript support with strict mode ready
- Type definitions for all domain models
- Utility types for common patterns

### Validation
- Input validators for phone, email, SMS, dates, times
- Patient form validation
- API response validation

### Error Handling
- Centralized error handling service
- Retry logic with exponential backoff
- User-friendly error messages
- Error logging ready for monitoring services

## Contributing

When adding new features:

1. **Use Context for shared state** - Don't prop drill
2. **Compose components** - Break large components into smaller pieces
3. **Add type definitions** - All new data structures should be typed
4. **Validate inputs** - Use validators from `utils/validators.ts`
5. **Handle errors gracefully** - Use errorHandler utilities

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed best practices.

## Roadmap

### ✅ Completed (Phase 1 & 2)
- Core clinic management features
- Patient visit workflow
- Inventory management
- Security fundamentals
- Architecture refactoring foundation
- Reusable component library
- Context-based state management

### 🚧 In Progress (Phase 3)
- Testing framework setup
- Unit tests for services
- Integration tests for workflows
- CI/CD pipeline

### 📋 Planned (Phase 4 & 5)
- Performance optimizations (lazy loading, code splitting)
- Loading states and indicators
- Accessibility improvements (ARIA labels)
- Full authentication integration
- Error monitoring (Sentry)
- Advanced analytics and reporting

## Troubleshooting

### API Key Issues

**"API Key missing" error**
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`
- Keys are loaded from environment at build time
- Restart dev server after changing `.env.local`

**SMS not sending**
- Check `SMS_API_KEY` is correctly set
- Verify Mobiwave account has sufficient credits
- Check phone number format

**Gemini API errors**
- Verify `GEMINI_API_KEY` is valid and has quota remaining
- Check Google Cloud Console for API limits

### Performance Issues

- Clear browser cache and reload
- Check Network tab in DevTools for slow requests
- Use React DevTools Profiler to identify slow components

## Support

For issues and questions:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for design patterns
2. Review [.env.example](./.env.example) for configuration
3. Check console logs for detailed error messages
4. Refer to the troubleshooting section above

## License

This project is part of JuaAfya - a healthcare management platform.

## Changelog

### [Latest] - Phase 1 & 2 Implementation

#### Added
- Comprehensive input validation utilities
- Global error boundary component
- Error handling service with retry logic
- Supabase authentication setup
- Context-based state management (Patient, Inventory, Visit)
- Custom hooks library (useAsync, useLocalStorage, useDebounce, etc.)
- Reusable UI component library (Modal, Button, FormInput, Card, Alert, LoadingSpinner)
- Architecture documentation

#### Improved
- Security: API keys now protected in environment only
- Code organization: Reduced prop drilling with contexts
- Maintainability: Reusable components reduce duplication
- Type safety: Full TypeScript support throughout

#### Fixed
- Empty preview issue (missing entry point script)
- SMS_API_KEY environment variable mapping

---

**Last Updated:** January 2025
**Current Phase:** 2 (Architecture Refactoring) - Foundation Complete
**Next Phase:** 3 (Testing & Quality)
