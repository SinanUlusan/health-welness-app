# Health & Wellness App

A modern, multilingual health and wellness application built with React, TypeScript, and Vite. This app provides personalized fasting plans, weight tracking, and subscription management with integrated payment processing.

## 🌟 Features

### Core Functionality

- **Multi-step Onboarding**: Personalized user experience with lunch preferences and weight input
- **Bilingual Support**: Full English and Arabic language support with RTL layout
- **Subscription Plans**: Multiple pricing tiers with free trial option
- **Payment Integration**: Secure Stripe payment processing with fallback mock system
- **Analytics Tracking**: Comprehensive user behavior and conversion tracking
- **Error Monitoring**: Sentry integration for real-time error tracking and performance monitoring
- **Responsive Design**: Mobile-first design with smooth animations

### Payment System

- **Multiple Payment Methods**: Credit cards, Apple Pay, PayPal
- **Payment Status Handling**: Success, cancel, and error scenarios
- **Test Card Support**: Built-in test cards for development
- **Secure Checkout**: PCI-compliant payment processing

### User Experience

- **Smooth Animations**: Framer Motion powered transitions
- **Form Validation**: Real-time validation with Zod schema
- **Error Boundaries**: Graceful error handling and recovery
- **Loading States**: Optimized loading experiences
- **Testimonials**: Social proof with before/after results

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd health-welness-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

4. **Start development server**

   ```bash
   # Start frontend only
   npm run dev

   # Start with mock server
   npm run dev:full
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation and language switcher
│   ├── Paywall.tsx     # Subscription plans display
│   ├── PaymentForm.tsx # Payment processing forms
│   └── ...
├── pages/              # Route components
│   ├── OnboardingStep1.tsx
│   ├── OnboardingStep2.tsx
│   ├── PaywallPage.tsx
│   ├── SuccessPage.tsx
│   └── Payment*Page.tsx # Payment status pages
├── hooks/              # Custom React hooks
│   ├── useAppState.ts  # Global state management
│   └── useFormValidation.ts
├── services/           # External service integrations
│   ├── stripe.ts       # Stripe payment processing
│   ├── analytics.ts    # Google Analytics tracking
│   ├── sentry.ts       # Sentry error monitoring
│   └── api.ts          # API communication
├── i18n/               # Internationalization
│   └── locales/        # Translation files
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── schemas/            # Zod validation schemas
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run dev:full         # Start with mock server

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format with Prettier
npm run format:check    # Check formatting

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report

# Mock Server
npm run mock-server     # Start mock API server
```

### Testing

The app includes comprehensive test coverage:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Form validation and user flow testing
- **Payment Tests**: Success, failure, and cancel scenarios
- **Internationalization Tests**: Language switching and RTL support
- **Error Monitoring Tests**: Sentry integration testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- Header.test.tsx
```

### Code Quality

The project uses strict ESLint configuration with:

- TypeScript-specific rules
- React Hooks best practices
- Prettier integration
- Custom business logic rules

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

## 🔧 Configuration

### Environment Variables

| Variable                      | Description                     | Required |
| ----------------------------- | ------------------------------- | -------- |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key          | Yes      |
| `VITE_GA_TRACKING_ID`         | Google Analytics ID             | No       |
| `VITE_ENABLE_ANALYTICS_LOCAL` | Enable GA in local dev          | No       |
| `VITE_SENTRY_DSN`             | Sentry DSN for error tracking   | No       |
| `VITE_ENABLE_SENTRY_LOCAL`    | Enable Sentry in local dev      | No       |
| `VITE_APP_VERSION`            | App version for Sentry releases | No       |

### Google Analytics Local Testing

To test Google Analytics locally:

1. **Set Environment Variables**:

   ```bash
   cp env.example .env.local
   # Edit .env.local with your GA tracking ID
   ```

2. **Enable Local Analytics**:

   ```env
   VITE_ENABLE_ANALYTICS_LOCAL=true
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

3. **Test in Browser**:
   - Open browser console
   - Run the test script: `node ga-test.js`
   - Check for GA debug messages

4. **Use Chrome Extension**:
   - Install "Google Analytics Debugger" extension
   - See real-time events in console

### Sentry Error Monitoring

To test Sentry error monitoring locally:

1. **Set Environment Variables**:

   ```bash
   cp env.example .env.local
   # Edit .env.local with your Sentry DSN
   ```

2. **Enable Local Sentry**:

   ```env
   VITE_ENABLE_SENTRY_LOCAL=true
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   VITE_APP_VERSION=1.0.0
   ```

3. **Test in Browser**:
   - Open browser console
   - Run: `runAllSentryTests()`
   - Check Sentry dashboard for test events

4. **Test Error Scenarios**:
   - Manual error: `testSentryError()`
   - Test message: `testSentryMessage("Test message")`
   - User tracking: `testSentryUser("user123", "test@example.com")`

### Mock Server

The app includes a mock server for development:

- **Port**: 3001
- **Endpoints**: RESTful API for all data collections
- **Payment Simulation**: Mock Stripe payment processing
- **Database**: JSON file-based storage

```bash
# Start mock server
npm run mock-server

# Available endpoints
GET/POST /onboarding
GET/POST /payments
GET/POST /subscriptionPlans
GET/POST /testimonials
POST /payments/create-intent
POST /payments/process
```

## 🌐 Internationalization

The app supports multiple languages with automatic RTL layout:

- **English**: Default language (LTR)
- **Arabic**: Full RTL support
- **Dynamic Routing**: Language-specific URLs
- **Automatic Detection**: Browser language preference

### Adding New Languages

1. Create translation file in `src/i18n/locales/`
2. Add language configuration
3. Update routing logic

## 💳 Payment Integration

### Stripe Integration

- **Secure Processing**: PCI-compliant payment handling
- **Multiple Methods**: Cards, Apple Pay, PayPal
- **Test Cards**: Built-in test card numbers
- **Error Handling**: Comprehensive error scenarios

### Test Cards

```javascript
// Success cards
4242424242424242; // Visa
5555555555554444; // Mastercard
378282246310005; // American Express

// Decline card
4000000000000002; // Generic decline
```

### Payment Flow

1. User selects subscription plan
2. Payment form validation
3. Stripe payment intent creation
4. Payment processing
5. Success/cancel/error handling

## 📊 Analytics

### Google Analytics Integration

- **Page Views**: Automatic tracking
- **Custom Events**: User interactions and conversions
- **E-commerce**: Subscription and payment tracking
- **User Behavior**: Onboarding and engagement metrics

### Tracked Events

- Onboarding steps completion
- Plan selection and payment attempts
- Language changes and user preferences
- Form submissions and validation errors

### Sentry Error Monitoring

- **Real-time Error Tracking**: Automatic JavaScript error capture
- **Performance Monitoring**: Page load times and API call performance
- **Session Replay**: User interaction recording for debugging
- **Release Tracking**: Version-based error grouping
- **Environment Filtering**: Separate tracking for dev/staging/production

### Error Monitoring Features

- React Error Boundary integration
- Network error tracking
- Sensitive data filtering
- Custom error context and tags
- User identification and tracking

## 🚀 Deployment

### Build Process

```bash
# Create production build
npm run build

# Preview build locally
npm run preview
```

### Deployment Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Cloudflare, AWS CloudFront
- **Container**: Docker deployment

### Environment Setup

1. Set production environment variables
2. Configure Stripe webhook endpoints
3. Set up Google Analytics
4. Configure Sentry error monitoring
5. Configure domain and SSL

## 🔒 Security

- **HTTPS Only**: Secure communication
- **Input Validation**: Zod schema validation
- **XSS Protection**: React built-in protection
- **CORS Configuration**: Proper cross-origin settings
- **Environment Variables**: Secure credential management
- **Error Data Scrubbing**: Automatic sensitive data filtering in Sentry

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Ensure responsive design
- Test internationalization

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review test examples
- Consult the mock server documentation

## 🔄 Changelog

### v1.0.0

- Initial release
- Multi-language support
- Payment integration
- Comprehensive testing
- Analytics tracking
- Sentry error monitoring integration
