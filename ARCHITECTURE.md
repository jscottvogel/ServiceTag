# Architecture Overview

## System Architecture

ServiceTag is built on a modern, cloud-native architecture using AWS services for maximum scalability, reliability, and performance.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript + Vite                            │   │
│  │  - Framer Motion (Animations)                            │   │
│  │  - React Router (Navigation)                             │   │
│  │  - Custom CSS Design System                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Amplify    │  │  App Runner  │  │  CloudFront + S3     │  │
│  │   Hosting    │  │  Container   │  │  Static Hosting      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AWS AMPLIFY GEN 2 BACKEND                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Authentication                         │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Amazon Cognito                                    │  │   │
│  │  │  - User Pools                                      │  │   │
│  │  │  - Email Verification                              │  │   │
│  │  │  - Secure Sign-in/Sign-up                          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API Layer                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  AWS AppSync (GraphQL API)                         │  │   │
│  │  │  - Auto-generated from schema                      │  │   │
│  │  │  - Real-time subscriptions                         │  │   │
│  │  │  - Authorization rules                             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Data Layer                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Amazon DynamoDB                                   │  │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │  │   │
│  │  │  │ ServiceTag   │  │ UserProfile  │  │Activity │  │  │   │
│  │  │  │   Table      │  │    Table     │  │  Table  │  │  │   │
│  │  │  └──────────────┘  └──────────────┘  └─────────┘  │  │   │
│  │  │  - Auto-scaling                                    │  │   │
│  │  │  - Point-in-time recovery                          │  │   │
│  │  │  - Global tables (optional)                        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SUPPORTING SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ CloudWatch   │  │  IAM Roles   │  │  AWS Lambda          │  │
│  │ Monitoring   │  │  & Policies  │  │  (Future Functions)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow
```
User → Cognito User Pool → JWT Token → AppSync API → DynamoDB
```

### Data Operations Flow
```
React App → Amplify Client → AppSync GraphQL → Lambda Resolvers → DynamoDB
                                    ↓
                            Real-time Subscriptions
```

## Key Components

### Frontend Architecture

**Component Hierarchy:**
```
App.tsx
├── Landing.tsx (Public)
├── Authenticator (Amplify UI)
└── Authenticated Routes
    ├── Navigation.tsx
    ├── Dashboard.tsx
    ├── ServiceTags.tsx
    └── Profile.tsx
```

**State Management:**
- React Hooks (useState, useEffect)
- Amplify Data Client (auto-generated)
- URL-based routing (React Router)

**Styling:**
- CSS Variables (Design System)
- Glassmorphism Effects
- Framer Motion Animations
- Mobile-first Responsive Design

### Backend Architecture

**Data Models:**

1. **ServiceTag**
   - Primary Key: id (auto-generated)
   - Attributes: title, description, status, priority, category, dueDate
   - Authorization: Owner-based + authenticated read

2. **UserProfile**
   - Primary Key: id (auto-generated)
   - Attributes: username, email, displayName, avatar, bio
   - Authorization: Owner-based + authenticated read

3. **Activity**
   - Primary Key: id (auto-generated)
   - Attributes: type, title, description, userId, timestamp
   - Authorization: Owner-based + authenticated read

**Authorization Strategy:**
```typescript
.authorization((allow) => [
  allow.owner(),                    // Owner can CRUD
  allow.authenticated().to(['read']) // Authenticated users can read
])
```

## Deployment Options

### Option 1: AWS Amplify Hosting
- **Best for**: Continuous deployment from Git
- **Features**: 
  - Automatic builds on push
  - Preview deployments
  - Custom domains
  - SSL certificates
  - Global CDN

### Option 2: AWS App Runner
- **Best for**: Container-based deployment
- **Features**:
  - Auto-scaling
  - Load balancing
  - Health checks
  - Custom domains
  - VPC integration

### Option 3: CloudFront + S3
- **Best for**: Static hosting with CDN
- **Features**:
  - Global distribution
  - Low latency
  - Cost-effective
  - High availability

## Security Architecture

### Authentication & Authorization
- **Cognito User Pools**: Secure user management
- **JWT Tokens**: Stateless authentication
- **IAM Roles**: Fine-grained permissions
- **AppSync Authorization**: GraphQL-level security

### Data Security
- **Encryption at Rest**: DynamoDB encryption
- **Encryption in Transit**: HTTPS/TLS
- **VPC Integration**: Optional private networking
- **Backup & Recovery**: Point-in-time recovery

### Application Security
- **CSP Headers**: Content Security Policy
- **CORS**: Cross-Origin Resource Sharing
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based

## Scalability

### Horizontal Scaling
- **DynamoDB**: Auto-scaling read/write capacity
- **Lambda**: Concurrent execution scaling
- **CloudFront**: Global edge locations
- **App Runner**: Auto-scaling instances

### Performance Optimization
- **Code Splitting**: Lazy loading routes
- **Image Optimization**: WebP format, lazy loading
- **Caching**: CloudFront, browser caching
- **Compression**: Gzip/Brotli

## Monitoring & Observability

### Metrics
- **CloudWatch Metrics**: API calls, errors, latency
- **DynamoDB Metrics**: Read/write capacity, throttles
- **Cognito Metrics**: Sign-ups, sign-ins, errors

### Logging
- **CloudWatch Logs**: Application logs
- **AppSync Logs**: GraphQL operations
- **Lambda Logs**: Function execution

### Alerting
- **CloudWatch Alarms**: Threshold-based alerts
- **SNS Notifications**: Email/SMS alerts
- **Dashboard**: Real-time monitoring

## Cost Optimization

### Free Tier Usage
- Cognito: 50,000 MAUs
- DynamoDB: 25 GB storage, 25 RCU/WCU
- Lambda: 1M requests/month
- CloudFront: 1 TB data transfer

### Cost Management
- **On-Demand Pricing**: Pay for what you use
- **Reserved Capacity**: Predictable workloads
- **Auto-Scaling**: Optimize resource usage
- **Cost Explorer**: Track spending

## Disaster Recovery

### Backup Strategy
- **DynamoDB**: Point-in-time recovery (35 days)
- **S3**: Versioning enabled
- **Code**: Git repository

### Recovery Procedures
- **RTO**: Recovery Time Objective < 1 hour
- **RPO**: Recovery Point Objective < 5 minutes
- **Multi-Region**: Optional for high availability

## Future Enhancements

### Planned Features
- [ ] File upload (S3 integration)
- [ ] Real-time notifications (AppSync subscriptions)
- [ ] Advanced analytics (QuickSight)
- [ ] Mobile apps (React Native)
- [ ] Offline support (Service Workers)
- [ ] Multi-language support (i18n)

### Scalability Roadmap
- [ ] Global tables (multi-region)
- [ ] ElastiCache (caching layer)
- [ ] API Gateway (REST API)
- [ ] Step Functions (workflows)
- [ ] EventBridge (event-driven)

---

**Built with AWS Amplify Gen 2 for modern, scalable applications**
