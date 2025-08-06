# E-commerce Analytics Hub

A real-time e-commerce analytics and notification system built with modern Node.js/TypeScript and microservices architecture. This project demonstrates integration of PostgreSQL, Elasticsearch, Redis, Kafka, RabbitMQ, and Docker for a scalable, event-driven system.

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

- **Runtime**: Node.js 23+ with native TypeScript support
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

- CRUD operations for products
- Category management
- Inventory tracking
- Price history

### 2. Real-time Event Processing

- Product view tracking
- Search query analytics
- Purchase event processing
- User behavior analysis

### 3. Advanced Search

- Full-text product search
- Analytics search and filtering
- Auto-suggestions
- Search result optimization

### 4. Intelligent Notifications

- Low inventory alerts
- High demand notifications
- Price change alerts
- Custom business rule triggers

### 5. Analytics Dashboard

- Real-time metrics
- Sales analytics
- User behavior insights
- Performance monitoring

## 🛠️ Microservices

| Service                  | Technology              | Purpose                            |
| ------------------------ | ----------------------- | ---------------------------------- |
| **API Gateway**          | Express + TypeScript    | Main entry point, request routing  |
| **Product Service**      | Express + PostgreSQL    | Product CRUD, inventory management |
| **Search Service**       | Express + Elasticsearch | Product search, analytics queries  |
| **Event Processor**      | Node.js + Kafka + Redis | Stream processing, analytics       |
| **Notification Service** | Node.js + RabbitMQ      | Email/SMS queue processing         |

## 📈 Development Roadmap

### Phase 1: Foundation Setup (Week 1)

- [ ] **Project Structure & Tooling**

  - [x] Initialize monorepo with workspaces
  - [ ] Setup TypeScript configuration
  - [ ] Configure ESLint, Prettier, Husky
  - [ ] Setup Docker Compose for development
  - [ ] Initialize Git repository

- [ ] **Infrastructure Services**
  - [ ] PostgreSQL setup with Prisma
  - [ ] Redis configuration
  - [ ] Elasticsearch setup
  - [ ] Kafka setup
  - [ ] RabbitMQ setup

### Phase 2: Core Services (Week 2)

- [ ] **API Gateway**

  - [ ] Express server with TypeScript
  - [ ] Request validation middleware
  - [ ] Error handling
  - [ ] Rate limiting
  - [ ] API documentation (Swagger)

- [ ] **Product Service**
  - [ ] Database schema design
  - [ ] Product CRUD endpoints
  - [ ] Category management
  - [ ] Inventory tracking
  - [ ] Data validation

### Phase 3: Search & Events (Week 3)

- [ ] **Search Service**

  - [ ] Elasticsearch integration
  - [ ] Product indexing
  - [ ] Search endpoints
  - [ ] Auto-suggestions
  - [ ] Search analytics

- [ ] **Event System Foundation**
  - [ ] Kafka producers setup
  - [ ] Event schemas definition
  - [ ] Basic event publishing

### Phase 4: Real-time Processing (Week 4)

- [ ] **Event Processor Service**

  - [ ] Kafka consumers
  - [ ] Redis integration for real-time data
  - [ ] Analytics calculations
  - [ ] Data aggregation

- [ ] **Notification Service**
  - [ ] RabbitMQ integration
  - [ ] Email notification templates
  - [ ] Business rule engine
  - [ ] Alert management

### Phase 5: Advanced Features (Week 5)

- [ ] **Enhanced Analytics**

  - [ ] Real-time dashboard APIs
  - [ ] Complex analytics queries
  - [ ] Performance metrics
  - [ ] User behavior tracking

- [ ] **Business Intelligence**
  - [ ] Automated alerts
  - [ ] Trend detection
  - [ ] Predictive analytics (basic)
  - [ ] Custom reporting

### Phase 6: Production Ready (Week 6)

- [ ] **Testing & Quality**

  - [ ] Unit tests for all services
  - [ ] Integration tests
  - [ ] Load testing
  - [ ] Security audit

- [ ] **Deployment & Monitoring**
  - [ ] Production Docker setup
  - [ ] Health checks
  - [ ] Logging aggregation
  - [ ] Monitoring setup
  - [ ] CI/CD pipeline

## 🎯 Key Learning Outcomes

This project demonstrates:

- **Microservices Architecture**: Service decomposition, inter-service communication
- **Event-Driven Design**: Kafka for streaming, RabbitMQ for queuing
- **Database Design**: PostgreSQL with proper indexing and relationships
- **Search Technology**: Elasticsearch for full-text search and analytics
- **Caching Strategies**: Redis for performance optimization
- **Modern Node.js**: TypeScript, async/await, modern ES modules
- **DevOps Practices**: Docker, containerization, service orchestration
- **API Design**: RESTful APIs, OpenAPI documentation
- **Real-time Systems**: WebSocket integration, live updates
- **Testing**: Comprehensive testing strategy
- **Monitoring**: Application performance and health monitoring

## 🚦 Getting Started

1. **Prerequisites**

   ```bash
   node >= 20.0.0
   docker >= 24.0.0
   docker-compose >= 2.0.0
   ```

2. **Clone and Setup**

   ```bash
   git clone <your-repo>
   cd e-commerce-analytics-hub
   npm install
   ```

3. **Start Development Environment**

   ```bash
   docker-compose up -d  # Start infrastructure
   npm run dev          # Start all services
   ```

4. **Verify Setup**
   ```bash
   npm run health-check
   ```

## 📚 API Documentation

Once running, access:

- **API Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics

## 🤝 Contributing

This is a portfolio project, but contributions and suggestions are welcome!

## 📄 License

MIT License - feel free to use this code for your own projects.

---

**Note**: This project is designed as a comprehensive portfolio piece demonstrating modern Node.js development practices and system architecture skills.
