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
   npm test                    # All tests
   npm run test:journeys      # Journey tests only
   npm run test:hotels        # Hotel tests only
   npm run test:bookings      # Booking tests only
   ```

## 📁 Project Structure

```
liteapi-api-tests/
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.ts              # Jest configuration
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── schemas/
│   └── openapi.json           # OpenAPI 3.0 schema definitions
├── src/
│   ├── config/
│   │   └── env.ts             # Environment configuration
│   ├── helpers/
│   │   ├── client.ts          # PactumJS client setup
│   │   ├── openapi.ts         # OpenAPI schema utilities
│   │   ├── contract.ts        # Response validation
│   │   ├── dataFactory.ts     # Test data generation
│   │   ├── registry.ts        # Resource tracking
│   │   └── selectors.ts       # Response data selectors
│   └── suites/
│       ├── journeys/          # End-to-end user journeys
│       │   ├── rome_happy_path.spec.ts
│       │   ├── rome_nrfn_cancel.spec.ts
│       │   └── rome_multi_occupancy_altpay.spec.ts
│       ├── hotels/            # Hotel-specific tests
│       │   └── rates_negative.spec.ts
│       └── bookings/          # Booking-specific tests
│           └── cancel_negative.spec.ts
└── .github/
    └── workflows/
        └── api-tests.yml      # CI/CD pipeline
```

## 🧪 Test Suites

### Journey Tests (`src/suites/journeys/`)
Complete end-to-end user workflows:

- **`rome_happy_path.spec.ts`** - Full booking flow: Search → Rates → Prebook → Book → Cancel
- **`rome_nrfn_cancel.spec.ts`** - Non-refundable booking cancellation flow
- **`rome_multi_occupancy_altpay.spec.ts`** - Multi-occupancy with alternative payment methods

### Negative Tests
- **`rates_negative.spec.ts`** - Invalid date ranges, missing API keys
- **`cancel_negative.spec.ts`** - Invalid booking cancellation attempts

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all test suites |
| `npm run test:ci` | Run tests with CI reporting (JUnit XML) |
| `npm run test:journeys` | Run only journey tests |
| `npm run test:hotels` | Run only hotel tests |
| `npm run test:bookings` | Run only booking tests |
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

### TypeScript Configuration
- **Target**: ES2021
- **Module**: ES2022
- **Strict Mode**: Enabled
- **Module Resolution**: Bundler

## 🚀 CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/api-tests.yml`) that:

- Runs on push and pull requests
- Uses 4-shard parallel execution
- Generates JUnit XML reports
- Uploads test artifacts
- Supports matrix testing for scalability

## 🛠️ Development

### Adding New Tests
1. Create test files in appropriate suite directory
2. Use helper functions from `src/helpers/`
3. Follow naming convention: `*.spec.ts`
4. Include proper test descriptions and tags

### Extending Data Factory
Add new methods to `src/helpers/dataFactory.ts`:
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
2. Add validation in `src/helpers/contract.ts` if needed
3. Create corresponding test cases

## 📊 Test Coverage

The framework covers:
- ✅ **Happy Path Flows** - Complete user journeys
- ✅ **Negative Testing** - Error conditions and edge cases
- ✅ **Contract Validation** - OpenAPI schema compliance
- ✅ **Resource Cleanup** - Proper test isolation
- ✅ **Parallel Execution** - Scalable test runs

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
