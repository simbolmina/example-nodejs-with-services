# E-commerce Analytics Hub

A real-time e-commerce analytics and notification system built with modern Node.js/TypeScript and microservices architecture. This project demonstrates advanced integration of PostgreSQL, Elasticsearch, Redis, Kafka, RabbitMQ, and Docker for a scalable, event-driven system.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Product Service │    │  Search Service │
│  (Express +     │    │  (PostgreSQL)   │    │ (Elasticsearch) │
│   TypeScript)   │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────────────────────────────┐
          │                 Kafka                       │
          │          (Event Streaming)                  │
          └─────────┬─────────────────────┬─────────────┘
                    │                     │
    ┌───────────────▼──────────────┐    ┌─▼─────────────────┐
    │    Event Processor           │    │ Notification      │
    │   (Analytics + Redis)        │    │ Service           │
    │                              │    │ (RabbitMQ)        │
    └──────────────────────────────┘    └───────────────────┘
```

## 🚀 Tech Stack

- **Runtime**: Node.js 24git + with native TypeScript support
- **Framework**: Express.js with modern middleware
- **Database**: PostgreSQL (with Prisma ORM)
- **Search**: Elasticsearch
- **Caching**: Redis
- **Message Streaming**: Apache Kafka
- **Message Queue**: RabbitMQ
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest + Supertest
- **Monitoring**: Prometheus + Grafana (optional)

## 📊 Core Features

### 1. Product Catalog Management

- CRUD operations for products with full validation
- Category management with hierarchical relationships
- Inventory tracking with real-time updates
- Price history and analytics

### 2. Real-time Event Processing

- Product view tracking and analytics
- Search query analytics and optimization
- Purchase event processing with business rules
- User behavior analysis and insights

### 3. Advanced Search & Analytics

- Full-text product search with Elasticsearch
- Analytics search and filtering capabilities
- Auto-suggestions and search optimization
- Real-time search result analytics

### 4. Intelligent Notifications

- Low inventory alerts with configurable thresholds
- High demand notifications and trend detection
- Price change alerts and market analysis
- Custom business rule triggers and automation

### 5. Analytics Dashboard

- Real-time metrics and performance monitoring
- Sales analytics with trend analysis
- User behavior insights and segmentation
- System performance and health monitoring

## 🛠️ Microservices Architecture

| Service                  | Technology              | Purpose                            |
| ------------------------ | ----------------------- | ---------------------------------- |
| **API Gateway**          | Express + TypeScript    | Main entry point, request routing  |
| **Product Service**      | Express + PostgreSQL    | Product CRUD, inventory management |
| **Search Service**       | Express + Elasticsearch | Product search, analytics queries  |
| **Event Processor**      | Node.js + Kafka + Redis | Stream processing, analytics       |
| **Notification Service** | Node.js + RabbitMQ      | Email/SMS queue processing         |

## 🎯 Technical Highlights

### Modern Node.js Development

- **TypeScript**: Full type safety and modern ES modules
- **Express.js**: RESTful API design with middleware
- **Prisma ORM**: Type-safe database operations
- **Docker**: Containerized development and deployment

### Event-Driven Architecture

- **Apache Kafka**: High-throughput event streaming
- **RabbitMQ**: Reliable message queuing
- **Redis**: Real-time caching and session management
- **Event Sourcing**: Immutable event logs for analytics

### Database & Search

- **PostgreSQL**: ACID-compliant relational database
- **Elasticsearch**: Full-text search and analytics
- **Database Design**: Proper indexing and relationships
- **Search Optimization**: Relevance scoring and filters

### DevOps & Monitoring

- **Docker Compose**: Multi-service orchestration
- **Health Checks**: Service monitoring and alerts
- **Logging**: Structured logging with correlation IDs
- **Performance**: Optimized queries and caching

## 🚦 Quick Start

### Prerequisites

```bash
node >= 24.0.0
docker >= 24.0.0
docker-compose >= 2.0.0
```

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd e-commerce-analytics-hub

# Install dependencies
npm install

# Start the development environment
docker-compose up -d

# Start the application
npm run dev
```

### Verify Setup

```bash
# Health check
curl http://localhost:3000/health

# API status
curl http://localhost:3000/status

# Products API
curl http://localhost:3000/api/v1/products
```

## 📚 API Endpoints

### Core APIs

- `GET /health` - Service health check
- `GET /status` - System status and metrics
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Soft delete product

### Categories

- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create new category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

### Database Management

```bash
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 📊 Monitoring & Tools

### Service URLs

- **API Gateway**: http://localhost:3000
- **pgAdmin**: http://localhost:5050 (admin@example.com / password)
- **RabbitMQ Management**: http://localhost:15672 (admin / password)
- **Elasticsearch**: http://localhost:9200
- **Kafka**: localhost:29092

### Database Connection

- **Host**: localhost
- **Port**: 5432
- **Database**: ecommerce_db
- **Username**: postgres
- **Password**: password

## 🤝 Contributing

This is a portfolio project demonstrating modern Node.js development practices. Feel free to explore the code and use it as a reference for your own projects.

## 📄 License

MIT License - feel free to use this code for your own projects.

---

**Built with ❤️ using modern Node.js, TypeScript, and microservices architecture**
