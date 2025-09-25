# 심밧다 - TLAQKTEK

Full-stack web application built with FastAPI backend and Next.js frontend.

## Tech Stack

### Backend

- **FastAPI** - Python web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **JWT** - Authentication
- **Transformers/Torch** - AI/ML capabilities

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)

## Quick Start

### Using Docker (Recommended)

1. Clone the repository

```bash
git clone <repository-url>
cd tlaqktek
```

2. Start all services

```bash
docker-compose up -d
```

3. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup

1. Navigate to backend directory

```bash
cd backend
```

2. Install dependencies using uv

```bash
pip install uv
uv sync
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations

```bash
uv run alembic upgrade head
```

5. Start the development server

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. Navigate to frontend directory

```bash
cd frontend
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start the development server

```bash
npm run dev
```

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/fastapi_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Database

### Migrations

Create new migration:

```bash
cd backend
uv run alembic revision --autogenerate -m "description"
```

Apply migrations:

```bash
uv run alembic upgrade head
```

## API Documentation

When the backend is running, API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
tlaqktek/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── alembic/            # Database migrations
│   ├── main.py             # Application entry point
│   └── pyproject.toml      # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/                # Source code
│   ├── components/         # React components
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
└── docker-compose.yml      # Docker services
```

## Development Commands

### Backend

```bash
# Run tests
uv run pytest

# Format code
uv run black .
uv run isort .

# Type checking
uv run mypy .

# Start development server
uv run uvicorn main:app --reload
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Docker Services

- **web**: FastAPI backend (port 8000)
- **frontend**: Next.js frontend (port 3000)
- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
