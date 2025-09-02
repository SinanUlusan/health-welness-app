# Mock API Server

This directory contains a json-server based mock API server for the health-wellness application.

## Installation

The mock server is already installed with project dependencies:

```bash
npm install --save-dev json-server concurrently
```

## Usage

### Starting the Mock Server

```bash
# Run only the mock server
npm run mock-server

# Run mock server and development server together
npm run dev:full
```

The mock server will run at `http://localhost:3001`.

## API Endpoints

### Payment Processing

#### Create Payment Intent

- **POST** `/payments/create-intent`
- **Description**: Creates a Stripe payment intent for processing payments
- **Request Body**: Any payment data (not required for mock)
- **Response**:

```json
{
  "success": true,
  "clientSecret": "pi_test_mock_1234567890_secret_abc123",
  "message": "Payment intent created successfully"
}
```

#### Process Payment

- **POST** `/payments/process`
- **Description**: Processes a payment with the provided client secret and payment data
- **Request Body**:

```json
{
  "clientSecret": "pi_test_mock_1234567890_secret_abc123",
  "paymentData": {
    "cardNumber": "4242 4242 4242 4242",
    "expirationMonth": "12",
    "expirationYear": "26",
    "cvc": "123",
    "email": "test@example.com"
  }
}
```

- **Response (Success)**:

```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_mock_1234567890",
    "status": "succeeded",
    "amount": 1000,
    "currency": "usd",
    "client_secret": "pi_test_mock_1234567890_secret_abc123"
  },
  "message": "Payment processed successfully"
}
```

- **Response (Failure - Test Card 4000000000000002)**:

```json
{
  "success": false,
  "error": "Payment declined. Please try again with a different card.",
  "paymentIntent": null
}
```

### Onboarding

#### Get All Onboarding Data

- **GET** `/onboarding`
- **Description**: Retrieves all onboarding step data
- **Response**: Array of onboarding objects

#### Get Specific Onboarding Data

- **GET** `/onboarding/:id`
- **Description**: Retrieves specific onboarding data by ID
- **Response**: Single onboarding object

#### Create Onboarding Data

- **POST** `/onboarding`
- **Description**: Creates new onboarding step data
- **Request Body**:

```json
{
  "step": 1,
  "data": {
    "lunchType": "sandwiches"
  }
}
```

- **Response**:

```json
{
  "id": "abc1",
  "step": 1,
  "data": {
    "lunchType": "sandwiches"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Update Onboarding Data

- **PUT** `/onboarding/:id`
- **Description**: Updates existing onboarding data

#### Delete Onboarding Data

- **DELETE** `/onboarding/:id`
- **Description**: Deletes onboarding data by ID

### Subscription Plans

#### Get All Subscription Plans

- **GET** `/subscriptionPlans`
- **Description**: Retrieves all available subscription plans
- **Response**:

```json
[
  {
    "id": "free-trial",
    "name": "7 days free trial",
    "duration": "1 year",
    "price": 0,
    "isFree": true,
    "isPopular": true
  },
  {
    "id": "3-months",
    "name": "3 months",
    "duration": "",
    "price": 8.4,
    "originalPrice": 11.6,
    "discount": 29
  },
  {
    "id": "1-month",
    "name": "1 month",
    "duration": "",
    "price": 11.6
  }
]
```

#### Get Specific Subscription Plan

- **GET** `/subscriptionPlans/:id`
- **Description**: Retrieves specific subscription plan by ID

#### Create Subscription Plan

- **POST** `/subscriptionPlans`
- **Description**: Creates new subscription plan

#### Update Subscription Plan

- **PUT** `/subscriptionPlans/:id`
- **Description**: Updates existing subscription plan

#### Delete Subscription Plan

- **DELETE** `/subscriptionPlans/:id`
- **Description**: Deletes subscription plan by ID

### Countries

#### Get All Countries

- **GET** `/countries`
- **Description**: Retrieves all supported countries
- **Response**:

```json
[
  {
    "id": "turkey",
    "code": "TR",
    "nameKey": "paywall.countries.turkey"
  },
  {
    "id": "united-states",
    "code": "US",
    "nameKey": "paywall.countries.unitedStates"
  }
]
```

#### Get Specific Country

- **GET** `/countries/:id`
- **Description**: Retrieves specific country by ID

#### Create Country

- **POST** `/countries`
- **Description**: Creates new country entry

#### Update Country

- **PUT** `/countries/:id`
- **Description**: Updates existing country

#### Delete Country

- **DELETE** `/countries/:id`
- **Description**: Deletes country by ID

### Testimonials

#### Get All Testimonials

- **GET** `/testimonials`
- **Description**: Retrieves all user testimonials
- **Response**:

```json
[
  {
    "id": "testimonial-1",
    "name": "Yasmine, -8 kg",
    "ratingTitle": "Improved digestion",
    "text": "My customized fasting plan really helped me with my stomach cramps and bloating problems.",
    "stars": 5,
    "beforeImage": "testimonial-before.png",
    "afterImage": "testimonial-after.png"
  }
]
```

#### Get Specific Testimonial

- **GET** `/testimonials/:id`
- **Description**: Retrieves specific testimonial by ID

#### Create Testimonial

- **POST** `/testimonials`
- **Description**: Creates new testimonial

#### Update Testimonial

- **PUT** `/testimonials/:id`
- **Description**: Updates existing testimonial

#### Delete Testimonial

- **DELETE** `/testimonials/:id`
- **Description**: Deletes testimonial by ID

### Reviews

#### Get All Reviews

- **GET** `/reviews`
- **Description**: Retrieves all user reviews
- **Response**:

```json
[
  {
    "id": "review-1",
    "title": "Fascinating!",
    "emoji": "🔥",
    "stars": 5,
    "content": "My customized fasting plan really helped me with my stomach cramps and bloating problems.",
    "reviewer": "Kumsalp",
    "reviewDate": "Nov 22"
  }
]
```

#### Get Specific Review

- **GET** `/reviews/:id`
- **Description**: Retrieves specific review by ID

#### Create Review

- **POST** `/reviews`
- **Description**: Creates new review

#### Update Review

- **PUT** `/reviews/:id`
- **Description**: Updates existing review

#### Delete Review

- **DELETE** `/reviews/:id`
- **Description**: Deletes review by ID

### Lunch Types

#### Get All Lunch Types

- **GET** `/lunchTypes`
- **Description**: Retrieves all available lunch type options
- **Response**:

```json
[
  {
    "id": "sandwiches",
    "value": "sandwiches",
    "labelKey": "onboarding.lunchTypes.sandwiches",
    "emoji": "🥪"
  },
  {
    "id": "soups",
    "value": "soups",
    "labelKey": "onboarding.lunchTypes.soups",
    "emoji": "🥗"
  },
  {
    "id": "fast_food",
    "value": "fastfood",
    "labelKey": "onboarding.lunchTypes.fastFood",
    "emoji": "🍟"
  },
  {
    "id": "other",
    "value": "other",
    "labelKey": "onboarding.lunchTypes.other",
    "emoji": "👀"
  }
]
```

#### Get Specific Lunch Type

- **GET** `/lunchTypes/:id`
- **Description**: Retrieves specific lunch type by ID

#### Create Lunch Type

- **POST** `/lunchTypes`
- **Description**: Creates new lunch type

#### Update Lunch Type

- **PUT** `/lunchTypes/:id`
- **Description**: Updates existing lunch type

#### Delete Lunch Type

- **DELETE** `/lunchTypes/:id`
- **Description**: Deletes lunch type by ID

### Payments History

#### Get All Payments

- **GET** `/payments`
- **Description**: Retrieves all payment history
- **Response**:

```json
[
  {
    "id": "656a",
    "paymentInfo": {
      "paymentMethod": "card",
      "country": "Turkey",
      "expirationMonth": "12",
      "expirationYear": "26",
      "cardNumber": "4242 4242 4242 4242",
      "email": "test@gmail.com",
      "cvc": "123"
    },
    "planId": "free-trial",
    "timestamp": "2025-08-31T14:10:33.839Z",
    "transactionId": "txn_1756649433839"
  }
]
```

#### Get Specific Payment

- **GET** `/payments/:id`
- **Description**: Retrieves specific payment by ID

#### Create Payment Record

- **POST** `/payments`
- **Description**: Creates new payment record

#### Update Payment Record

- **PUT** `/payments/:id`
- **Description**: Updates existing payment record

#### Delete Payment Record

- **DELETE** `/payments/:id`
- **Description**: Deletes payment record by ID

### Users

#### Get All Users

- **GET** `/users`
- **Description**: Retrieves all users

#### Get Specific User

- **GET** `/users/:id`
- **Description**: Retrieves specific user by ID

#### Create User

- **POST** `/users`
- **Description**: Creates new user

#### Update User

- **PUT** `/users/:id`
- **Description**: Updates existing user

#### Delete User

- **DELETE** `/users/:id`
- **Description**: Deletes user by ID

## Data Structure

The mock API uses data from the `db.json` file with the following collections:

```json
{
  "onboarding": [],
  "subscriptionPlans": [],
  "countries": [],
  "testimonials": [],
  "reviews": [],
  "lunchTypes": [],
  "payments": [],
  "users": []
}
```

## Test Examples

### Creating a payment intent:

```bash
curl -X POST http://localhost:3001/payments/create-intent \
  -H "Content-Type: application/json"
```

### Processing a payment:

```bash
curl -X POST http://localhost:3001/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "clientSecret": "pi_test_mock_1234567890_secret_abc123",
    "paymentData": {
      "cardNumber": "4242 4242 4242 4242",
      "expirationMonth": "12",
      "expirationYear": "26",
      "cvc": "123",
      "email": "test@example.com"
    }
  }'
```

### Submitting onboarding data:

```bash
curl -X POST http://localhost:3001/onboarding \
  -H "Content-Type: application/json" \
  -d '{"step": 1, "data": {"lunchType": "sandwiches"}}'
```

### Getting subscription plans:

```bash
curl -X GET http://localhost:3001/subscriptionPlans
```

### Getting countries:

```bash
curl -X GET http://localhost:3001/countries
```

### Getting testimonials:

```bash
curl -X GET http://localhost:3001/testimonials
```

### Getting reviews:

```bash
curl -X GET http://localhost:3001/reviews
```

### Getting lunch types:

```bash
curl -X GET http://localhost:3001/lunchTypes
```

## Features

- JSON-Server based RESTful API
- CORS support
- Automatic ID generation
- Data persistence (in db.json file)
- Fallback mechanism (uses localStorage if server is not running)
- Stripe payment simulation with test card support
- Comprehensive CRUD operations for all collections

## Development

- Edit the `db.json` file to add new data
- Server automatically detects changes (hot reload)
- API responses are automatically saved to the `db.json` file
- Test card `4000000000000002` will always fail for testing error scenarios
