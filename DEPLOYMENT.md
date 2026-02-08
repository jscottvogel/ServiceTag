# ServiceTag Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **Node.js 18+** installed
4. **npm** package manager

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Amplify Sandbox

The Amplify sandbox creates temporary AWS resources for development:

```bash
npm run sandbox
```

This command will:
- Deploy authentication (Cognito)
- Create DynamoDB tables
- Set up AppSync API
- Generate `amplify_outputs.json` with real AWS endpoints

**Note**: Keep this terminal running. The sandbox will watch for changes.

### 3. Start Development Server

In a new terminal:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production Deployment

### Option 1: AWS Amplify Hosting (Recommended)

#### Step 1: Connect Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Select the branch to deploy

#### Step 2: Configure Build Settings

Amplify will auto-detect the build settings. Verify:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Step 3: Deploy

Click "Save and deploy". Amplify will:
- Deploy backend resources
- Build the frontend
- Deploy to CDN
- Provide a URL

### Option 2: AWS App Runner

#### Step 1: Build Docker Image

```bash
docker build -t servicetag .
```

#### Step 2: Push to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name servicetag

# Get login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag servicetag:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/servicetag:latest

# Push image
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/servicetag:latest
```

#### Step 3: Create App Runner Service

1. Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner)
2. Click "Create service"
3. Select "Container registry" → "Amazon ECR"
4. Choose your image
5. Configure:
   - Port: 80
   - CPU: 1 vCPU
   - Memory: 2 GB
6. Click "Create & deploy"

### Option 3: Manual Deployment

#### Step 1: Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

#### Step 2: Deploy Backend

```bash
npx ampx sandbox --once
```

This deploys backend resources without watching for changes.

#### Step 3: Deploy Frontend

Upload the `dist/` directory to:
- **S3 + CloudFront**: For static hosting
- **Netlify/Vercel**: For quick deployment
- **Your own server**: Using nginx/apache

## Environment Configuration

### Backend Configuration

The backend is configured in `amplify/`:
- `auth/resource.ts` - Authentication settings
- `data/resource.ts` - Database schema
- `backend.ts` - Backend definition

### Frontend Configuration

Update `amplify_outputs.json` after deploying backend:

```bash
npx ampx generate outputs --branch main
```

## Post-Deployment

### 1. Verify Authentication

1. Visit your deployed URL
2. Click "Get Started"
3. Create an account
4. Verify email
5. Sign in

### 2. Test Features

- Create a service tag
- Update your profile
- View dashboard statistics

### 3. Monitor

- **CloudWatch Logs**: Backend function logs
- **Amplify Console**: Build and deployment logs
- **App Runner Console**: Container logs and metrics

## Troubleshooting

### Issue: "Client could not be generated"

**Solution**: Ensure Amplify sandbox is running and `amplify_outputs.json` exists.

```bash
npm run sandbox
```

### Issue: Authentication not working

**Solution**: Check Cognito configuration:

```bash
aws cognito-idp list-user-pools --max-results 10
```

### Issue: Database queries failing

**Solution**: Verify DynamoDB tables exist:

```bash
aws dynamodb list-tables
```

### Issue: Build fails

**Solution**: Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Scaling Considerations

### Database

- DynamoDB auto-scales by default
- Consider on-demand pricing for variable workloads
- Use provisioned capacity for predictable traffic

### Authentication

- Cognito scales automatically
- Monitor user pool limits
- Configure MFA for security

### Frontend

- Use CloudFront for global CDN
- Enable compression (gzip/brotli)
- Implement code splitting

### Backend

- Lambda functions scale automatically
- Monitor concurrent executions
- Set reserved concurrency if needed

## Security Best Practices

1. **Enable MFA** in Cognito
2. **Use HTTPS** everywhere
3. **Implement CSP** headers
4. **Regular security audits**
5. **Keep dependencies updated**

```bash
npm audit
npm audit fix
```

## Cost Optimization

### Free Tier Resources

- Cognito: 50,000 MAUs free
- DynamoDB: 25 GB storage free
- Lambda: 1M requests/month free
- S3: 5 GB storage free

### Monitoring Costs

```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## Backup and Recovery

### Database Backups

Enable point-in-time recovery:

```bash
aws dynamodb update-continuous-backups \
  --table-name ServiceTag \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### User Data

Export Cognito users:

```bash
aws cognito-idp list-users --user-pool-id YOUR_POOL_ID
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: npx ampx pipeline-deploy
```

## Support

For deployment issues:
1. Check AWS CloudWatch logs
2. Review Amplify Console logs
3. Verify AWS credentials
4. Check service quotas

---

**Happy Deploying! 🚀**
