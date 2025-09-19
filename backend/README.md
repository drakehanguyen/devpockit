# DevPockit Backend

FastAPI backend for DevPockit - A collection of essential developer tools.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- uv (Python package manager)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup

```bash
# Run database migrations
uv run alembic upgrade head
```

### Development Server

```bash
# Start the development server
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Server will be available at:
# - API: http://localhost:8000
# - API Documentation: http://localhost:8000/docs
# - ReDoc Documentation: http://localhost:8000/redoc
```

## 🏗️ Architecture

### Project Structure

```
backend/
├── app/
│   ├── api/              # API route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── deps.py       # Authentication dependencies
│   │   └── tools.py      # Developer tools endpoints
│   ├── core/             # Core application components
│   │   ├── config.py     # Application settings
│   │   ├── database.py   # Database connection & session
│   │   └── security.py   # JWT & password security
│   ├── models/           # SQLAlchemy ORM models
│   │   └── user.py       # User model
│   ├── schemas/          # Pydantic schemas
│   │   ├── base.py       # Base schemas
│   │   ├── tools.py      # Tool request/response schemas
│   │   └── user.py       # User schemas
│   ├── services/         # Business logic layer
│   │   ├── tools_service.py  # Developer tools logic
│   │   └── user_service.py   # User management logic
│   └── utils/            # Utility functions
├── alembic/              # Database migrations
├── main.py               # FastAPI application entry point
├── pyproject.toml        # Project configuration
└── README.md             # This file
```

### Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT tokens with python-jose
- **Password Hashing**: passlib with bcrypt
- **Validation**: Pydantic v2
- **Environment**: uv for dependency management

## 🔐 Authentication System

### JWT Token Authentication

The backend uses JWT (JSON Web Tokens) for secure authentication:

- **Token Expiry**: 30 minutes (configurable)
- **Algorithm**: HS256
- **Password Hashing**: bcrypt via passlib
- **Token Format**: Bearer token in Authorization header

### Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login` → Returns JWT token
3. **Access Protected Routes**: Include `Authorization: Bearer <token>` header
4. **Token Validation**: Automatic validation on protected endpoints

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./devpockit.db

# Application
PROJECT_NAME=DevPockit
VERSION=1.0.0
ENVIRONMENT=development
DEBUG=true

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8000`
- **API Prefix**: `/api/v1`

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "password123"
}

# Response includes JWT token
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "access_token": "eyJ...",
    "token_type": "bearer"
  }
}
```

#### Get Current User (Protected)
```http
GET /api/v1/auth/me
Authorization: Bearer <jwt_token>
```

#### Logout
```http
POST /api/v1/auth/logout
```

### Developer Tools Endpoints

#### JSON Formatter
```http
POST /api/v1/tools/json/format
Content-Type: application/json

{
  "data": "{\"key\": \"value\"}",
  "minify": false
}
```

#### YAML Converter
```http
POST /api/v1/tools/yaml/convert
Content-Type: application/json

{
  "data": "key: value",
  "to_format": "json"
}
```

#### UUID Generator
```http
POST /api/v1/tools/uuid/generate
Content-Type: application/json

{
  "version": 4,
  "count": 1
}
```

#### User History (Protected)
```http
GET /api/v1/tools/history
Authorization: Bearer <jwt_token>
```

#### Add to Favorites (Protected)
```http
POST /api/v1/tools/favorites?tool_name=json-formatter
Authorization: Bearer <jwt_token>
```

### Health Check
```http
GET /health
GET /api/v1/tools/health
```

## 🛠️ Development

### Code Quality

```bash
# Linting with Ruff
uv run ruff check

# Code formatting with Black
uv run black .

# Type checking
uv run mypy app/
```

### Testing

```bash
# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=app --cov-report=html
```

### Database Operations

```bash
# Create new migration
uv run alembic revision --autogenerate -m "Description"

# Apply migrations
uv run alembic upgrade head

# Downgrade migration
uv run alembic downgrade -1

# Reset database (development only)
rm devpockit.db
uv run alembic upgrade head
```

### Adding New Dependencies

```bash
# Add production dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Update dependencies
uv sync
```

## 🔧 Configuration

### Settings Management

Configuration is managed through `app/core/config.py` using Pydantic Settings:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DevPockit"
    VERSION: str = "1.0.0"
    # ... other settings

    class Config:
        env_file = ".env"
```

### CORS Configuration

CORS is configured for frontend development:

```python
# In main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Deployment

### Production Environment

1. **Update Environment Variables**:
   ```bash
   ENVIRONMENT=production
   DEBUG=false
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET_KEY=your-production-secret-key
   ```

2. **Database Migration**:
   ```bash
   uv run alembic upgrade head
   ```

3. **Run Production Server**:
   ```bash
   uv run uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Vercel Deployment

The backend is configured for Vercel serverless deployment via `vercel.json` in the project root.

## 📊 Current Phase Status

### ✅ Completed Phases

- **Phase 1**: Project Setup ✅
- **Phase 2**: Backend Foundation ✅
- **Phase 3**: API Structure ✅
- **Phase 4**: Database Setup ✅
- **Phase 5**: Authentication System ✅

### 🔄 Next Phases

- **Phase 6**: Basic UI Layout (Frontend)
- **Phase 7**: JSON ↔ YAML Converter Implementation
- **Phase 8**: JSON Formatter Implementation
- **Phase 9**: XML Formatter Implementation
- **Phase 10**: UUID Generator Implementation

## 🧪 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login and get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Access protected endpoint
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Using the Interactive API Docs

Visit `http://localhost:8000/docs` for the interactive Swagger UI where you can:
- View all available endpoints
- Test API calls directly in the browser
- See request/response schemas
- Authenticate and test protected endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check if SQLite database file exists
   - Run `uv run alembic upgrade head`

2. **JWT Token Issues**:
   - Verify `JWT_SECRET_KEY` is set in `.env`
   - Check token expiry (default 30 minutes)

3. **CORS Errors**:
   - Update `BACKEND_CORS_ORIGINS` in settings
   - Ensure frontend URL is included

4. **Import Errors**:
   - Run `uv sync` to install dependencies
   - Check Python version (3.11+ required)

5. **Migration Errors**:
   - Delete `devpockit.db` and run migrations again
   - Check Alembic configuration in `alembic.ini`

### Logs and Debugging

```bash
# Enable debug mode
DEBUG=true uv run uvicorn main:app --reload

# Check application logs
# Logs are printed to stdout in development
```

## 📝 Contributing

1. Follow the project structure and naming conventions
2. Use type hints for all functions
3. Add docstrings for all public methods
4. Write tests for new features
5. Run linting and formatting before committing
6. Update API documentation for new endpoints

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [JWT.io](https://jwt.io/) - JWT token debugger
