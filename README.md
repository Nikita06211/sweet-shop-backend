# Sweet Shop Management System - Backend API

A full-stack Sweet Shop Management System built with Node.js, TypeScript, Express, TypeORM, and PostgreSQL (NeonDB). This project demonstrates RESTful API development, JWT authentication, role-based access control, and test-driven development (TDD) practices.

**Frontend Repository:** [sweet-shop-frontend](https://github.com/Nikita06211/sweet-shop-frontend)  
**Live Application:** [sweet-shop-frontend](https://sweet-shop-frontend-five.vercel.app)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [My AI Usage](#my-ai-usage)
- [Screenshots](#screenshots)

## Project Overview

The Sweet Shop Management System is a comprehensive backend API that allows users to manage a sweet shop inventory. The system supports user authentication, sweet product management, inventory tracking, and role-based access control (admin and regular users).

### Key Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Sweet Management**: CRUD operations for sweet products
- **Search Functionality**: Search sweets by name, category, and price range
- **Inventory Management**: Purchase and restock operations
- **Role-Based Access**: Admin-only endpoints for sensitive operations
- **Comprehensive Testing**: High test coverage with Jest and Supertest
- **Type Safety**: Full TypeScript implementation

## Features

### Authentication
- User registration with email and password
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User/Admin)

### Sweets Management
- Create, read, update, and delete sweets
- Get individual sweet by ID
- Search sweets by multiple criteria
- Each sweet has: name, category, price, quantity, and optional imageUrl

### Inventory Management
- Purchase sweets (decreases quantity)
- Restock sweets (admin only, increases quantity)
- Stock validation to prevent overselling

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL (NeonDB)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest
- **Development**: nodemon, ts-node

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** database (or NeonDB account)
- **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Nikita06211/sweet-shop-backend
cd sweet-shop-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (NeonDB)
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24

# Bcrypt Configuration
BCRYPT_ROUNDS=10
```

**Important**: 
- Replace `DATABASE_URL` with your NeonDB connection string
- Generate a strong `JWT_SECRET` for production
- Never commit the `.env` file to version control

### 4. Database Setup

The application uses TypeORM with `synchronize: true` in development mode, which automatically creates/updates database tables. For production, use migrations instead.

### 5. Verify Setup

Run the health check:

```bash
npm run dev
```

Visit `http://localhost:3001/health` - you should see:
```json
{
  "status": "ok",
  "message": "Sweet Shop API is running"
}
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

### Production Mode

```bash
npm run build
npm start
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Test Coverage Report

```bash
npm run test:coverage
```

### Test Coverage

The project maintains high test coverage (>80%) with comprehensive tests for:
- Authentication endpoints
- Sweet management endpoints
- Inventory operations
- Middleware functionality
- Error handling

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### 1. Register User

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

---

#### 2. Login User

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials

---

### Sweets Endpoints

All sweets endpoints require authentication (Bearer token in Authorization header).

#### 3. Create Sweet

**POST** `/api/sweets`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Chocolate Bar",
  "category": "Chocolate",
  "price": 2.50,
  "quantity": 100,
  "imageUrl": "https://example.com/images/chocolate-bar.jpg"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Sweet created successfully",
  "data": {
    "sweet": {
      "id": "uuid",
      "name": "Chocolate Bar",
      "category": "Chocolate",
      "price": 2.50,
      "quantity": 100,
      "imageUrl": "https://example.com/images/chocolate-bar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token

---

#### 4. List All Sweets

**GET** `/api/sweets`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Sweets retrieved successfully",
  "data": {
    "sweets": [
      {
        "id": "uuid",
        "name": "Chocolate Bar",
        "category": "Chocolate",
        "price": 2.50,
        "quantity": 100,
        "imageUrl": "https://example.com/images/chocolate-bar.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

#### 5. Get Sweet by ID

**GET** `/api/sweets/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Sweet retrieved successfully",
  "data": {
    "sweet": {
      "id": "uuid",
      "name": "Chocolate Bar",
      "category": "Chocolate",
      "price": 2.50,
      "quantity": 100,
      "imageUrl": "https://example.com/images/chocolate-bar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Sweet not found

---

#### 6. Search Sweets

**GET** `/api/sweets/search?name=chocolate&category=Chocolate&minPrice=1.00&maxPrice=5.00`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `name` (optional): Search by name (partial match, case-insensitive)
- `category` (optional): Filter by category (exact match)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Sweets search completed successfully",
  "data": {
    "sweets": [
      {
        "id": "uuid",
        "name": "Chocolate Bar",
        "category": "Chocolate",
        "price": 2.50,
        "quantity": 100,
        "imageUrl": "https://example.com/images/chocolate-bar.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

#### 7. Update Sweet

**PUT** `/api/sweets/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Chocolate Bar",
  "category": "Premium Chocolate",
  "price": 3.00,
  "quantity": 150,
  "imageUrl": "https://example.com/images/chocolate-bar.jpg"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Sweet updated successfully",
  "data": {
    "sweet": {
      "id": "uuid",
      "name": "Updated Chocolate Bar",
      "category": "Premium Chocolate",
      "price": 3.00,
      "quantity": 150,
      "imageUrl": "https://example.com/images/chocolate-bar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Sweet not found

---

#### 8. Delete Sweet

**DELETE** `/api/sweets/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Sweet deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Sweet not found

---

### Inventory Endpoints

#### 9. Purchase Sweet

**POST** `/api/sweets/:id/purchase`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Purchase completed successfully",
  "data": {
    "sweet": {
      "id": "uuid",
      "name": "Chocolate Bar",
      "category": "Chocolate",
      "price": 2.50,
      "quantity": 95,
      "imageUrl": "https://example.com/images/chocolate-bar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or insufficient stock
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Sweet not found

---

#### 10. Restock Sweet

**POST** `/api/sweets/:id/restock`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "quantity": 50
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Restock completed successfully",
  "data": {
    "sweet": {
      "id": "uuid",
      "name": "Chocolate Bar",
      "category": "Chocolate",
      "price": 2.50,
      "quantity": 150,
      "imageUrl": "https://example.com/images/chocolate-bar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Sweet not found

---

### Health Check

#### 11. Health Check

**GET** `/health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Sweet Shop API is running"
}
```

---

## Project Structure

```
sweet-shop-backend/
├── src/
│   ├── app.ts                 # Main application entry point
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── sweets.controller.ts
│   │   └── inventory.controller.ts
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── sweets.service.ts
│   │   └── inventory.service.ts
│   ├── entities/              # TypeORM entities
│   │   ├── User.ts
│   │   └── Sweet.ts
│   ├── dto/                   # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   └── sweet.dto.ts
│   ├── routes/                # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── sweets.routes.ts
│   │   └── inventory.routes.ts
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── database/              # Database configuration
│   │   └── dataSource.ts
│   ├── utils/                 # Utility functions
│   │   └── jwt.util.ts
│   └── tests/                 # Test files
│       ├── setup.ts
│       ├── auth.test.ts
│       ├── auth.middleware.test.ts
│       └── sweets.test.ts
├── .env                       # Environment variables (not committed)
├── .env.example               # Example environment file
├── .gitignore
├── jest.config.js             # Jest configuration
├── nodemon.json               # Nodemon configuration
├── package.json
├── tsconfig.json              # TypeScript configuration
└── README.md
```

## My AI Usage

### AI Tools Used

Throughout the development of this project, I utilized **Cursor AI** (powered by advanced language models) as my primary AI coding assistant. Cursor AI was integrated directly into my development environment, providing real-time code suggestions, explanations, and assistance.

### How I Used AI

#### 1. **Project Setup and Configuration**
- **Initial Setup**: I used AI to help set up the TypeScript configuration, TypeORM with PostgreSQL, and Jest testing framework. The AI assisted in creating the proper `tsconfig.json`, `jest.config.js`, and database connection setup.
- **Example**: "Set up TypeORM with NeonDB PostgreSQL connection"

#### 2. **Code Generation and Boilerplate**
- **Entity Definitions**: AI helped generate TypeORM entity classes with proper decorators for `User` and `Sweet` entities, including validation decorators from `class-validator`.
- **Service Layer**: Used AI to generate initial service method structures, including the authentication service with password hashing logic.
- **Example**: "Create a User entity with email, password, and role fields using TypeORM"

#### 3. **Test-Driven Development (TDD)**
- **Test Case Generation**: AI was instrumental in writing comprehensive test cases following TDD principles. For each feature, I asked the AI to generate test cases first (Red phase), then implemented the functionality (Green phase).
- **Example**: "Write tests for the user registration endpoint that check for duplicate emails, validation errors, and successful registration"
- **Test Setup**: AI helped configure the test environment, including database setup/teardown and test user creation.

#### 4. **API Endpoint Implementation**
- **Route Definitions**: AI assisted in structuring RESTful routes with proper middleware chains (authentication, validation, admin checks).
- **Controller Logic**: Used AI to implement controller methods with proper error handling and response formatting.
- **Example**: "Create a PUT endpoint to update a sweet with partial updates support"

#### 5. **Error Handling and Validation**
- **Middleware Development**: AI helped create validation middleware using `class-validator` and error handling middleware for consistent error responses.
- **Example**: "Create middleware to validate DTOs and return formatted error messages"

#### 6. **Debugging and Problem Solving**
- **Type Errors**: When encountering TypeScript type errors (especially with JWT and TypeORM), AI helped identify and fix type mismatches.
- **Database Issues**: AI assisted in resolving database connection issues and transaction problems during testing.
- **Example**: "Fix the 'Driver not Connected' error in Jest tests"

#### 7. **Code Refactoring**
- **Best Practices**: AI suggested improvements for code organization, error handling patterns, and TypeScript best practices.
- **Example**: "Refactor the authentication service to handle database constraint violations properly"

#### 8. **Documentation**
- **Code Comments**: AI helped write clear, concise comments explaining complex logic.
- **README Generation**: AI assisted in creating comprehensive documentation, including API endpoint documentation and setup instructions.

### Reflection on AI Impact

#### Positive Impacts

1. **Accelerated Development**: AI significantly sped up the development process, especially for boilerplate code and repetitive patterns. What would have taken hours of research and implementation was completed in minutes.

2. **Learning Enhancement**: Working with AI helped me understand TypeORM patterns, TypeScript advanced types, and Jest testing best practices more quickly. The AI provided explanations alongside code suggestions.

3. **Error Reduction**: AI caught many potential bugs early, especially type errors and common pitfalls in async/await patterns.

4. **TDD Adherence**: AI made it easier to follow TDD strictly by quickly generating comprehensive test cases before implementation.

5. **Consistency**: AI helped maintain consistent code style, error handling patterns, and response formats throughout the project.

#### Challenges and Considerations

1. **Over-Reliance Risk**: There were moments where I had to consciously ensure I understood the generated code rather than blindly accepting it. I made sure to review and understand every AI-suggested change.

2. **Context Limitations**: Sometimes AI suggestions needed adjustment based on the specific project context. I always verified that suggestions aligned with the project's architecture.

3. **Testing Edge Cases**: While AI generated good test cases, I had to add some edge cases and integration scenarios manually to ensure comprehensive coverage.

4. **Best Practices**: I cross-referenced AI suggestions with official documentation to ensure we were following current best practices, especially for security (JWT, password hashing).

#### Responsible AI Usage

- **Code Review**: Every AI-generated code was reviewed, tested, and understood before committing.
- **Security**: I verified that AI suggestions for authentication and authorization followed security best practices.
- **Transparency**: All commits where AI was used include co-authorship attribution as required.
- **Learning**: I used AI as a learning tool, asking for explanations when I didn't understand generated code.

### Conclusion

AI was an invaluable tool in this project, acting as a pair programmer that accelerated development while maintaining code quality. However, it was used responsibly—as an assistant rather than a replacement for understanding. The combination of AI assistance and my own knowledge resulted in a well-structured, tested, and documented codebase that follows industry best practices.

## Screenshots

### Application Screenshots

#### 1. Authentication - Login Endpoint

![Login API Response](./assets/auth-login.png)

The image shows a successful login request to `/api/auth/login` endpoint, demonstrating:
- POST request with user credentials (email and password)
- Successful 200 OK response
- JWT token generation
- User details returned in the response

#### 2. Test Results

![Test Results](./assets/tests.png)

The image displays comprehensive test execution results:
- All 63 tests passed across 3 test suites
- Database connection management during tests
- Test execution time: ~169 seconds
- Complete test coverage validation

## Additional Notes

- All endpoints require authentication except `/health` and `/api/auth/register` and `/api/auth/login`
- Admin endpoints require a user with `role: 'admin'`
- JWT tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN`)
- Database uses UUIDs for primary keys
- All prices are stored as decimals with 2 decimal places
- Quantity must be non-negative integers

