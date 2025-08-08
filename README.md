# E-commerce Analytics Hub

A real-time e-commerce analytics and notification system built with modern Node.js/TypeScript and microservices architecture. This project demonstrates advanced integration of PostgreSQL, Elasticsearch, Redis, Kafka, RabbitMQ, and Docker for a scalable, event-driven system.

## 🏗️ Architecture Overview

This project implements an **event-driven microservices architecture** where services communicate through message brokers rather than direct HTTP calls:

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
- **Database**: PostgreSQL (with Prisma ORM)
- **Search**: Elasticsearch v9.1.0
- **Caching**: Redis
- **Message Streaming**: Apache Kafka v7.4.0
- **Message Queue**: RabbitMQ
- **Containerization**: Docker & Docker Compose

## 🏛️ Project Structure

This project follows a **layered architecture** with **independent background workers**:

### Main Application

```
src/
├── controllers/           # HTTP request/response handling
│   ├── ProductController.ts
│   ├── CategoryController.ts
│   ├── ElasticsearchController.ts
│   ├── RedisController.ts
│   ├── KafkaController.ts
│   ├── AnalyticsController.ts
│   ├── RabbitMQController.ts
│   └── EmailController.ts
├── services/             # Business logic layer
│   ├── ProductService.ts
│   ├── CategoryService.ts
│   ├── ElasticsearchService.ts
│   ├── RedisService.ts
│   ├── KafkaService.ts
│   ├── AnalyticsService.ts
│   ├── RabbitMQService.ts
│   └── EmailService.ts
├── routes/               # Route definitions
│   ├── products.ts
│   ├── categories.ts
│   ├── search.ts
│   ├── redis.ts
│   ├── kafka.ts
│   ├── analytics.ts
│   ├── rabbitmq.ts
│   ├── email.ts
│   └── app.ts
├── lib/                  # External service clients
│   ├── elasticsearch.ts
│   ├── kafka.ts
│   ├── redis.ts
│   ├── rabbitmq.ts
│   └── email.ts
├── middleware/           # Express middleware
│   └── cache.ts
└── config/              # Configuration files
    └── swagger/
```

### Background Workers

```
src/
├── workers/              # Independent background processes
│   ├── event-processor.ts    # Kafka consumer for analytics
│   └── notification-worker.ts # RabbitMQ consumer for emails
└── scripts/              # One-time utilities
    ├── reindex-products.ts
    └── init-elasticsearch.ts
```

### Key Benefits

- **Clean Architecture**: Clear separation between HTTP handling and business logic
- **Independent Workers**: Background processes run separately from the main server
- **Event-Driven**: Services communicate through message brokers
- **Scalable**: Can scale workers independently
- **Fault Tolerant**: If one service crashes, others continue

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
- Email notifications with professional HTML templates
- RabbitMQ integration for reliable message queuing
- Background notification processing
- Secure development with Ethereal Email

### 5. Real-time Analytics

- Live analytics dashboard with real-time aggregated data
- Search analytics with query tracking and top searches
- Product analytics with event counts and view tracking
- System analytics with performance monitoring
- Recent events log with rolling history
- Event processor consuming from Kafka
- Redis analytics storage for real-time data

### 6. Email Notifications

- Email service with Nodemailer and Ethereal Email
- Professional HTML templates for all alert types
- Low stock alerts with automated notifications
- High demand alerts for trending products
- Price change alerts for significant updates
- Welcome emails for new users
- Custom email support with flexible content
- Background processing via notification worker

## 🛠️ Microservices Architecture

| Service                  | Technology              | Purpose                            |
| ------------------------ | ----------------------- | ---------------------------------- |
| **API Gateway**          | Express + TypeScript    | Main entry point, request routing  |
| **Product Service**      | Express + PostgreSQL    | Product CRUD, inventory management |
| **Search Service**       | Express + Elasticsearch | Product search, analytics queries  |
| **Event Processor**      | Node.js + Kafka + Redis | Stream processing, analytics       |
| **Notification Service** | Node.js + RabbitMQ      | Email notifications and alerts     |

### How Services Work Together

1. **API Gateway** handles HTTP requests and publishes events to Kafka
2. **Event Processor** consumes Kafka events, processes analytics, stores in Redis
3. **API Gateway** publishes notifications to RabbitMQ for alerts
4. **Notification Worker** consumes RabbitMQ messages and sends emails
5. **All services are independent** - no direct HTTP calls between them

## 🎯 Technical Highlights

### Modern Node.js Development

- **TypeScript**: Full type safety and modern ES modules
- **Express.js**: RESTful API design with middleware
- **Layered Architecture**: Clean separation of concerns
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

## 🔄 How This Project Works

### Event Flow Example

1. **User creates a product** via `POST /api/v1/products`
2. **API Gateway** processes the request and saves to PostgreSQL
3. **API Gateway** publishes event to Kafka: `product.created`
4. **Event Processor** (independent worker) consumes the Kafka event
5. **Event Processor** processes analytics and stores in Redis
6. **API Gateway** publishes notification to RabbitMQ for low stock alert
7. **Notification Worker** (independent worker) consumes RabbitMQ message
8. **Notification Worker** sends email via Ethereal Email

### Key Components

- **API Gateway**: Handles HTTP requests, publishes events to message brokers
- **Event Processor**: Independent worker that consumes Kafka events for analytics
- **Notification Worker**: Independent worker that consumes RabbitMQ for emails
- **Message Brokers**: Kafka for events, RabbitMQ for notifications
- **Data Stores**: PostgreSQL for products, Redis for analytics, Elasticsearch for search

### Why This Architecture?

- **Loose Coupling**: Services don't know about each other
- **Scalability**: Can run multiple workers independently
- **Fault Tolerance**: If one service crashes, others continue
- **Asynchronous**: HTTP requests don't wait for background processing

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

## 📚 API Documentation

Complete API documentation is available at **http://localhost:3000/docs** when the application is running.

The Swagger UI provides:

- Interactive API testing
- Request/response examples
- Authentication details
- All available endpoints with descriptions

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
- **Analytics Dashboard**: http://localhost:3000/api/v1/analytics/dashboard
- **RabbitMQ Management**: http://localhost:15672 (admin / password)
- **Elasticsearch**: http://localhost:9200
- **pgAdmin**: http://localhost:5050 (admin@example.com / password)

## 🏆 Professional Development Skills

This project demonstrates **enterprise-level Node.js development** with:

### Architecture Excellence

- **Layered Design**: Clean separation between HTTP handling and business logic
- **Event-Driven Architecture**: Services communicate via message brokers
- **Independent Workers**: Background processes separate from HTTP server
- **Microservices Ready**: Easy to extract services

### Code Quality Standards

- **TypeScript**: Strong typing throughout
- **Async/Await**: Modern async patterns
- **Error Handling**: Proper error propagation
- **Input Validation**: Comprehensive request validation
- **Clean Code**: Readable, maintainable structure

### Production Readiness

- **Scalability**: Can scale workers independently
- **Fault Tolerance**: Services continue if one crashes
- **Testability**: Easy to unit test each layer
- **Best Practices**: Industry-standard patterns
- **Interview-Ready**: Demonstrates advanced Node.js skills

## 🤝 Contributing

This is a portfolio project demonstrating modern Node.js development practices. Feel free to explore the code and use it as a reference for your own projects.

## 📄 License

MIT License - feel free to use this code for your own projects.
