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

- **Runtime**: Node.js 24 with native TypeScript support
- **Framework**: Express.js with modern middleware
- **Architecture**: Controller/Service pattern with layered design
- **Database**: PostgreSQL (with Prisma ORM)
- **Search**: Elasticsearch v9.1.0
- **Caching**: Redis
- **Message Streaming**: Apache Kafka v7.4.0
- **Message Queue**: RabbitMQ
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest + Supertest
- **Monitoring**: Prometheus + Grafana (optional)

## 🏛️ Architecture Pattern

This project implements a **professional Controller/Service architecture** that demonstrates enterprise-level Node.js development:

```
src/
├── controllers/           # HTTP request/response handling
│   ├── ProductController.ts
│   ├── CategoryController.ts
│   ├── ElasticsearchController.ts
│   ├── RedisController.ts
│   └── KafkaController.ts
├── services/             # Business logic layer
│   ├── ProductService.ts
│   ├── CategoryService.ts
│   ├── ElasticsearchService.ts
│   ├── RedisService.ts
│   └── KafkaService.ts
├── routes/               # Route definitions only
│   ├── products.ts
│   ├── categories.ts
│   ├── search.ts
│   ├── redis.ts
│   ├── kafka.ts
│   └── app.ts
├── lib/                  # External service clients
│   ├── elasticsearch.ts
│   ├── kafka.ts
│   └── redis.ts
└── middleware/           # Express middleware
```

### Architecture Benefits

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to unit test controllers and services independently
- **Maintainability**: Clear boundaries between HTTP handling and business logic
- **Scalability**: Easy to extract services to microservices
- **Type Safety**: Strong TypeScript interfaces throughout
- **Error Handling**: Consistent error propagation across layers
- **Dependency Injection**: Services injected into controllers

## 📊 Core Features

### 1. Product Catalog Management

- CRUD operations for products with full validation
- Category management with hierarchical relationships
- Inventory tracking with real-time updates
- Price history and analytics
- Automatic Elasticsearch indexing
- Kafka event publishing for all operations

### 2. Real-time Event Processing

- Product view tracking and analytics
- Search query analytics and optimization
- Purchase event processing with business rules
- User behavior analysis and insights
- Event-driven architecture with Kafka
- Detailed event logging and monitoring

### 3. Advanced Search & Analytics

- Full-text product search with Elasticsearch
- Analytics search and filtering capabilities
- Auto-suggestions and search optimization
- Real-time search result analytics
- Fuzzy matching and wildcard queries
- Search aggregations and statistics

### 4. Intelligent Notifications

- Low inventory alerts with configurable thresholds
- High demand notifications and trend detection
- Price change alerts and market analysis
- Custom business rule triggers and automation
- Kafka event streaming for real-time alerts

### 5. Analytics Dashboard

- Real-time metrics and performance monitoring
- Sales analytics with trend analysis
- User behavior insights and segmentation
- System performance and health monitoring
- Event-driven analytics processing

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
- **Controller/Service Pattern**: Professional layered architecture
- **Prisma ORM**: Type-safe database operations
- **Docker**: Containerized development and deployment

### Event-Driven Architecture

- **Apache Kafka**: High-throughput event streaming
- **RabbitMQ**: Reliable message queuing
- **Redis**: Real-time caching and session management
- **Event Sourcing**: Immutable event logs for analytics
- **Business Events**: Standardized event schemas

### Database & Search

- **PostgreSQL**: ACID-compliant relational database
- **Elasticsearch**: Full-text search and analytics
- **Database Design**: Proper indexing and relationships
- **Search Optimization**: Relevance scoring and filters
- **Real-time Indexing**: Automatic sync between PostgreSQL and Elasticsearch

### DevOps & Monitoring

- **Docker Compose**: Multi-service orchestration
- **Health Checks**: Service monitoring and alerts
- **Logging**: Structured logging with correlation IDs
- **Performance**: Optimized queries and caching
- **Event Visibility**: Detailed event logging for debugging

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

### Elasticsearch

- `GET /api/v1/elasticsearch/health` - Elasticsearch health check
- `GET /api/v1/elasticsearch/indices` - List all indices
- `POST /api/v1/elasticsearch/indices/{indexName}` - Create index
- `DELETE /api/v1/elasticsearch/indices/{indexName}` - Delete index
- `GET /api/v1/elasticsearch/indices/{indexName}/stats` - Index statistics
- `POST /api/v1/elasticsearch/indices/{indexName}/documents` - Index document
- `GET /api/v1/elasticsearch/indices/{indexName}/documents/{id}` - Get document
- `PUT /api/v1/elasticsearch/indices/{indexName}/documents/{id}` - Update document
- `DELETE /api/v1/elasticsearch/indices/{indexName}/documents/{id}` - Delete document
- `POST /api/v1/elasticsearch/indices/{indexName}/search` - Direct ES search

### Kafka Events

- `GET /api/v1/kafka/health` - Kafka health check
- `GET /api/v1/kafka/status` - Kafka connection status
- `POST /api/v1/kafka/publish` - Publish custom events
- `POST /api/v1/kafka/events/product-created` - Publish product created event
- `POST /api/v1/kafka/events/product-updated` - Publish product updated event
- `POST /api/v1/kafka/events/product-deleted` - Publish product deleted event
- `POST /api/v1/kafka/events/search-analytics` - Publish search analytics event
- `POST /api/v1/kafka/events/system-health` - Publish system health event
- `POST /api/v1/kafka/events/performance-metric` - Publish performance metric event

### Redis Management

- `GET /api/v1/redis/health` - Redis health check
- `GET /api/v1/redis/info` - Redis server information
- `POST /api/v1/redis/set` - Set key-value pair
- `GET /api/v1/redis/get/:key` - Get value by key
- `DELETE /api/v1/redis/del/:key` - Delete key
- `GET /api/v1/redis/exists/:key` - Check if key exists
- `POST /api/v1/redis/hset` - Set hash field
- `GET /api/v1/redis/hget/:key/:field` - Get hash field
- `GET /api/v1/redis/hgetall/:key` - Get all hash fields
- `POST /api/v1/redis/lpush` - Push to list (left)
- `POST /api/v1/redis/rpush` - Push to list (right)
- `POST /api/v1/redis/sadd` - Add to set
- `GET /api/v1/redis/smembers/:key` - Get set members
- `POST /api/v1/redis/flushdb` - Clear Redis database

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
- **API Documentation**: http://localhost:3000/docs
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

## 🏆 Professional Development Skills

This project demonstrates **enterprise-level Node.js development** with:

### Architecture Patterns

- **Controller/Service Pattern**: Clean separation of concerns
- **Dependency Injection**: Services injected into controllers
- **Layered Architecture**: HTTP → Controller → Service → Lib
- **Single Responsibility**: Each class has one job
- **Interface Segregation**: Clean interfaces for each service

### Code Quality

- **TypeScript**: Strong typing throughout
- **Async/Await**: Modern async patterns
- **Error Handling**: Proper error propagation
- **Validation**: Input validation and sanitization
- **Documentation**: JSDoc comments for all methods

### Professional Standards

- **Clean Code**: Readable, maintainable structure
- **Best Practices**: Industry-standard patterns
- **Scalability**: Easy to extend and maintain
- **Testability**: Easy to unit test each layer
- **Production Ready**: Enterprise-level architecture

## 🤝 Contributing

This is a portfolio project demonstrating modern Node.js development practices. Feel free to explore the code and use it as a reference for your own projects.

## 📄 License

MIT License - feel free to use this code for your own projects.

---

**Built with ❤️ using modern Node.js, TypeScript, and microservices architecture**
