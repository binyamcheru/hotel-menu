# Hotel Menu Backend

A robust Go-based backend for a hotel menu management system, featuring QR code scanning analytics, menu management, and multi-role authentication.

## 🚀 Features

- **Multi-Role Auth**: Supported roles: `user`, `admin`, `superadmin`.
- **Menu Management**: Manage hotels, categories, and menu items.
- **Analytics**: Track QR code scans and menu item views.
- **Feedback & Ratings**: Collect customer feedback and item ratings.
- **CORS Support**: Ready for frontend integration.

## 🛠 Technology Stack

- **Language**: Go (v1.25+)
- **Framework**: [Gin Gonic](https://github.com/gin-gonic/gin)
- **Database**: PostgreSQL
- **Driver**: [pgx/v5](https://github.com/jackc/pgx)
- **Migrations**: [golang-migrate](https://github.com/golang-migrate/migrate)

## 📋 Prerequisites

- Go installed (v1.25 or higher)
- PostgreSQL running locally or via Docker

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root (already exists in your current setup) with the following:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=hotelmenu
   JWT_SECRET=your_secret_key
   PORT=8080
   ```

3. **Install dependencies**:
   ```bash
   go mod tidy
   ```

## 🏗 Database Management

### 1. Run Migrations
Apply the database schema:
```bash
go run cmd/migrate/main.go up
```

### 2. Seed Data
Populate the database with initial categories and a superadmin user:
```bash
go run cmd/seed/main.go
```

## 🏃 Running the Application

Start the API server:
```bash
go run cmd/api/main.go
```
The server will start on `http://localhost:8080`.

## 🧪 API Documentation

The full API walkthrough and Postman setup instructions are available in:
- [Walkthrough Documentation](.gemini/antigravity/brain/7b5c798c-75ec-4c8f-a769-67f6f0dd62af/walkthrough.md) (Search for this in your artifacts)

### Base URL: `http://localhost:8080/api`

| Method | Endpoint | Access |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Public |
| `GET` | `/menu/hotels/:id` | Public |
| `GET` | `/hotels` | Admin+ |
| `POST` | `/hotels` | Superadmin |

## 🧪 Testing with Postman

1. Import the endpoints from the guide.
2. Login to get a JWT.
3. Use **Bearer Token** auth for protected routes.
