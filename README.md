# CGS Backend Service

A secure, containerized Node.js/Express backend API with JWT authentication, PostgreSQL integration, and several security enhancements.

## Table of Contents
- [Features](#features)
- [Setup Instructions](#setup-instructions)
  - [Docker Setup](#docker-setup)
  - [Manual Setup](#manual-setup)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Profile](#user-profile)
- [Security Implementations](#security-implementations)
- [Enhancements](#enhancements)
- [Contributing](#contributing)
- [Known Limitations](#known-limitations)
- [License](#license)

## Features

- **Secure Authentication**: JWT-based auth with Argon2id password hashing
- **User Management**: Create accounts and manage user profiles
- **API Security**: Rate limiting, input validation, and secure password storage
- **Fully Containerized**: Docker Compose setup with proper networking
- **Database**: PostgreSQL integration with persistent storage
- **Comprehensive Logging**: Request and error logging

## Setup Instructions

### Docker Setup

The easiest way to run the application is using Docker Compose.

#### Prerequisites
- Docker and Docker Compose installed

#### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/shashiX07/auth-task.git
   cd auth-task
   ```

2. Create a `.env` file in the root directory with:
   ```
   # Database Configuration
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=db
   DB_PORT=5432
   DB_NAME=cgs_db

   # Server Configuration
   PORT=5000
   NODE_ENV=production

   # JWT Configuration
   JWT_SECRET=yoursecretkey
   JWT_EXPIRATION=1h
   ```

3. Start the containers:
   ```bash
   docker-compose up -d
   ```

4. The API will be available at: `http://localhost:5000`

### Manual Setup

#### Prerequisites
- Node.js (v14+)
- PostgreSQL

#### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/shashiX07/auth-task.git
   cd auth-task/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   # Database Configuration
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cgs_db

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=yoursecretkey
   JWT_EXPIRATION=1h
   ```

4. Set up the PostgreSQL database:
   ```bash
   psql -U postgres
   CREATE DATABASE cgs_db;
   \q
   ```

5. Run the database initialization script:
   ```bash
   psql -U postgres -d cgs_db -f db/init.sql
   ```

6. Start the server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Register a new user.
- **Request Body**: 
  ```json
  {
    "username": "user123",
    "password": "securepassword"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "User created successfully",
    "success": true
  }
  ```

#### POST /api/auth/signin
Authenticate and receive a JWT token.
- **Request Body**: 
  ```json
  {
    "username": "user123",
    "password": "securepassword"
  }
  ```
- **Response**: 
  ```json
  {
    "token": "jwt_token_here",
    "success": true
  }
  ```

### User Profile

#### GET /api/users/me
Get the current user's profile.
- **Headers**: 
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response**: 
  ```json
  {
    "data": {
      "id": 1,
      "username": "user123",
      "description": "User description",
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    "success": true
  }
  ```

#### PUT /api/users/me
Update the user's description.
- **Headers**: 
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Request Body**: 
  ```json
  {
    "description": "Updated profile description"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Description updated successfully",
    "success": true,
    "data": {
      "id": 1,
      "username": "user123",
      "description": "Updated profile description",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

## Security Implementations

- **Password Hashing**: Argon2id algorithm (winner of the Password Hashing Competition)
- **JWT Authentication**: Stateless authentication with configurable expiration
- **Input Validation**: Using express-validator to prevent malformed requests
- **Rate Limiting**: Prevents brute force attacks with tiered limits:
  - General API endpoints: 100 requests per 15 minutes
  - Authentication endpoints: 30 requests per 15 minutes
- **Data Sanitization**: Prevents SQL injection and XSS attacks
- **CORS Protection**: Configured to restrict cross-origin requests
- **Helmet Integration**: HTTP headers security with helmet middleware
- **Content Security Policy**: Strict CSP to prevent XSS attacks
- **Request Validation**: All incoming data is validated before processing

## Enhancements

- **Comprehensive Logging**: Using Winston for structured logging of requests and errors
- **Database Persistence**: Docker volumes for data persistence between container restarts
- **Health Checks**: Database service uses health checks to ensure readiness
- **Environment Variables**: Flexible configuration through .env files
- **Proper Error Handling**: Consistent error responses with appropriate HTTP status codes
- **API Documentation**: Clear documentation of all available endpoints
- **Docker Optimization**: Multi-stage builds and lightweight images
