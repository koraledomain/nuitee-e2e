# LiteAPI API Tests (PactumJS + Jest + TypeScript)

A comprehensive API testing framework for LiteAPI Travel services, built with PactumJS, Jest, and TypeScript. This project implements end-to-end user journeys, negative testing, and OpenAPI contract validation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- LiteAPI sandbox key

### Setup
1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd nuite-e2e-api-playwright-config
   npm ci
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your LITEAPI_KEY
   ```

3. **Run tests:**
   ```bash
   npm test                    # All API tests
   npm run test:minimal       # Minimal E2E tests
   npm run test:api           # API tests only
   ```

## 📁 Project Structure

```
liteapi-api-tests/
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.ts              # Jest configuration
├── playwright.config.ts        # Playwright configuration
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── schemas/
│   └── openapi.json           # OpenAPI 3.0 schema definitions
├── mcp-server/                 # MCP Server for selector management
│   ├── package.json
│   └── server.js
├── src/
│   ├── api/                    # API Testing (PactumJS + Jest)
│   │   ├── config/
│   │   │   └── env.ts         # Environment configuration
│   │   ├── helpers/
│   │   │   ├── client.ts      # PactumJS client setup
│   │   │   ├── openapi.ts     # OpenAPI schema utilities
│   │   │   ├── contract.ts    # Response validation
│   │   │   ├── dataFactory.ts # Test data generation
│   │   │   ├── registry.ts    # Resource tracking
│   │   │   └── selectors.ts   # Response data selectors
│   │   └── suites/
│   │       ├── journeys/      # End-to-end user journeys
│   │       │   └── rome_happy_path.spec.ts
│   │       ├── hotels/        # Hotel-specific tests
│   │       │   └── rates_negative.spec.ts
│   │       └── bookings/      # Booking-specific tests
│   │           └── cancel_negative.spec.ts
│   └── e2e/                   # E2E Testing (Playwright)
│       └── minimal.spec.ts    # Minimal UI tests
└── .github/
    └── workflows/
        ├── api-tests.yml      # API tests CI/CD
        ├── playwright-tests.yml # E2E tests CI/CD
        └── schemathesis.yml   # OpenAPI contract testing
```

## 🧪 Test Suites

### API Tests (`src/api/suites/`)
Complete API testing with PactumJS:

- **`journeys/rome_happy_path.spec.ts`** - Full booking flow: Search → Rates → Prebook → Book → Cancel
- **`hotels/rates_negative.spec.ts`** - Invalid date ranges, missing API keys
- **`bookings/cancel_negative.spec.ts`** - Invalid booking cancellation attempts

### E2E Tests (`src/e2e/`)
Minimal UI testing with Playwright:

- **`minimal.spec.ts`** - Basic website loading and interaction validation

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all API test suites |
| `npm run test:ci` | Run API tests with CI reporting (JUnit XML) |
| `npm run test:minimal` | Run minimal E2E tests |
| `npm run test:api` | Run API tests only |
| `npm run report` | Display test reporting information |

## 🏗️ Architecture Features

### OpenAPI Contract Validation
- Automatic response validation against OpenAPI schemas
- Schema-aware request body generation
- Contract testing ensures API compatibility

### Data Factory Pattern
- Smart test data generation with OpenAPI hints
- Configurable defaults with override capabilities
- Schema-driven request body construction

### Resource Management
- Automatic tracking of created resources (bookings)
- Cleanup after test completion
- Prevents test data pollution

### MCP Server Integration
- Centralized selector management for E2E tests
- Real-time selector updates
- Contract-based element selection

### Parallel Execution
- Optimized for CI/CD with sharding support
- Configurable worker count based on environment
- Fast test execution with proper resource management

## 🔧 Configuration

### Environment Variables
```bash
BASE_URL=https://book.liteapi.travel/v3.0  # API base URL
LITEAPI_KEY=your_sandbox_key               # API authentication key
RUN_ID=LOCAL                               # Test run identifier
```

### Jest Configuration
- **Test Environment**: Node.js
- **Timeout**: 60 seconds per test
- **Workers**: 50% in CI, 100% locally
- **Reporters**: Default + JUnit XML for CI

### Playwright Configuration
- **Test Environment**: Node.js
- **Browsers**: Chrome, Firefox, Safari
- **Screenshots**: On failure
- **Videos**: On failure

### TypeScript Configuration
- **Target**: ES2021
- **Module**: ES2022
- **Strict Mode**: Enabled
- **Module Resolution**: Bundler

## 🚀 CI/CD Pipeline

The project includes multiple GitHub Actions workflows:

### API Tests (`.github/workflows/api-tests.yml`)
- Runs on push and pull requests
- Uses 4-shard parallel execution
- Generates JUnit XML reports
- Uploads test artifacts

### E2E Tests (`.github/workflows/playwright-tests.yml`)
- Manual dispatch trigger
- Optional headed mode
- Minimal test execution
- Artifact upload

### Contract Testing (`.github/workflows/schemathesis.yml`)
- OpenAPI contract validation
- Nightly execution
- Schema compliance checking

## 🛠️ Development

### Adding New API Tests
1. Create test files in appropriate suite directory (`src/api/suites/`)
2. Use helper functions from `src/api/helpers/`
3. Follow naming convention: `*.spec.ts`
4. Include proper test descriptions and tags

### Adding E2E Tests
1. Create test files in `src/e2e/`
2. Use Playwright's built-in selectors
3. Follow naming convention: `*.spec.ts`
4. Include proper test descriptions

### MCP Server Usage
```bash
cd mcp-server
npm install
npm start
```

**Available tools:**
- `get_selector` - Get CSS selector for UI element
- `list_selectors` - List all available selectors  
- `update_selector` - Update a selector

### Extending Data Factory
Add new methods to `src/api/helpers/dataFactory.ts`:
```typescript
export const DF = {
  // ... existing methods
  newMethod(overrides: Dict = {}): Dict {
    return { /* your data */ };
  }
};
```

### Adding OpenAPI Endpoints
1. Update `schemas/openapi.json` with new endpoint definitions
2. Add validation in `src/api/helpers/contract.ts` if needed
3. Create corresponding test cases

## 📊 Test Coverage

The framework covers:
- ✅ **API Happy Path Flows** - Complete user journeys
- ✅ **API Negative Testing** - Error conditions and edge cases
- ✅ **Contract Validation** - OpenAPI schema compliance
- ✅ **Resource Cleanup** - Proper test isolation
- ✅ **E2E Basic Validation** - UI interaction testing
- ✅ **Parallel Execution** - Scalable test runs

## 🎯 Enhancement Capabilities

This project demonstrates several advanced testing patterns that can be extended:

### 1. Advanced Test Organization
- Project-based test execution with annotations
- Run specific test categories (journey, smoke, ui, api, mobile)
- Browser-specific test execution

### 2. User Journey Testing
- Complete end-to-end user workflows
- Authentication flow testing
- Search and selection workflows
- Multi-browser parallel execution

### 3. API + E2E Integration
- Combined API and UI testing
- Authentication via API + UI validation
- Endpoint accessibility testing

### 4. Selector Contract Management
- Centralized selector management
- Page Object pattern
- Type-safe selector access
- Contract validation tests

### 5. Advanced Test Discovery
- Dynamic element discovery
- Screenshot-based validation
- Real-time selector updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
- Check the test logs for detailed error information
- Verify your `.env` configuration
- Ensure your LiteAPI key has proper permissions
- Review the OpenAPI schema for endpoint requirements