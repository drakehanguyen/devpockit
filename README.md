# DevPockit - Developer Tools Web App

A modern web application providing essential developer tools with a clean, responsive interface. Built with Next.js 15 frontend and FastAPI backend, featuring user authentication and work history tracking.

## 🚀 Features

### Developer Tools
- **JSON ↔ YAML Converter** - Bidirectional conversion with validation
- **JSON Formatter** - Minify/beautify with syntax highlighting
- **XML Formatter** - Format XML with error handling
- **UUID Generator** - v1, v4, v5 with bulk generation
- **JWT Encoder/Decoder** - HS256 algorithm, header/payload editing
- **Cron Parser** - Human-readable descriptions, next execution times
- **Regex Tester** - JavaScript/Python flavors, match highlighting
- **Lorem Ipsum Generator** - Customizable text generation

### User Experience
- 🌙 Dark mode by default with light mode toggle
- 📱 Mobile-responsive design
- 🔐 User authentication and accounts
- 📚 Work history tracking
- 📋 Copy-to-clipboard functionality
- ⚡ Fast and responsive interface

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Language**: TypeScript
- **Package Manager**: pnpm

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Data Validation**: Pydantic
- **Environment Management**: uv
- **Database**: SQLite (dev) → Vercel Postgres (prod)

### Development & Deployment
- **Repository**: Monorepo structure
- **Deployment**: Vercel (full-stack)
- **Testing**: Jest (frontend) + pytest (backend)
- **Database Migrations**: Alembic

## 📁 Project Structure

```
devpockit/
├── frontend/          # Next.js frontend
├── backend/           # FastAPI backend
├── shared/            # Shared types and utilities
├── docs/              # Documentation
├── vercel.json        # Vercel deployment config
└── PROJECT_PLAN.md    # Detailed project plan
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+ and uv
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devpockit
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
   - Frontend will be available at: http://localhost:3000 (or 3001 if 3000 is busy)

3. **Backend Setup**
   ```bash
   cd backend
   uv sync
   uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Backend API will be available at: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Access the application**
   - **Frontend**: http://localhost:3000 (or 3001)
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

## 📋 Development Phases

This project follows an 18-phase development plan:

- **Phases 1-6**: Foundation setup
- **Phases 7-15**: Tool implementation
- **Phases 16-18**: Testing and deployment

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed phase information.

## 🧪 Testing

```bash
# Frontend tests
cd frontend
pnpm test

# Backend tests
cd backend
uv run pytest
```

## 🛠 Development Commands

### Frontend Commands
```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

### Backend Commands
```bash
cd backend

# Install dependencies
uv sync

# Start development server
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Run tests
uv run pytest

# Run linting
uv run ruff check

# Format code
uv run black .

# Run both linting and formatting
uv run ruff check && uv run black .
```

## 🔧 Troubleshooting

### Common Issues

**Frontend Issues:**
- **Port 3000 in use**: Next.js will automatically use port 3001
- **Build errors**: Clear `.next` folder and reinstall dependencies
- **Type errors**: Check TypeScript configuration in `tsconfig.json`

**Backend Issues:**
- **Import errors**: Ensure you're in the backend directory and using `uv run`
- **Port 8000 in use**: Change port with `--port 8001` in uvicorn command
- **Database errors**: Check if SQLite file exists and has proper permissions

**Environment Setup:**
- **pnpm not found**: Install with `npm install -g pnpm`
- **uv not found**: Install with `pip install uv`
- **Python version**: Ensure Python 3.11+ is installed

## 🚀 Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

## 📚 Documentation

- [Project Plan](./PROJECT_PLAN.md) - Detailed development phases
- [Project Rules](./PROJECT_RULES.md) - Development guidelines
- [API Documentation](./docs/api.md) - Backend API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/phase-X-tool-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/phase-X-tool-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🎯 Roadmap

- [ ] Additional tools (Base64, Hash generators)
- [ ] Advanced features (favorites, custom tools)
- [ ] Performance optimizations
- [ ] Mobile app (React Native)

---

**Built with ❤️ for developers by developers**
