# ServiceTag - Professional Mobile Service Management

A premium, professionally styled mobile-first application built with AWS Amplify Gen 2, App Runner, and DynamoDB.

## 🚀 Features

- **Modern Architecture**: Built with AWS Amplify Gen 2, DynamoDB, and App Runner
- **Premium UI/UX**: Glassmorphism design with smooth animations and vibrant gradients
- **Mobile-First**: Fully responsive design optimized for all devices
- **Secure Authentication**: AWS Cognito with email verification
- **Real-time Data**: DynamoDB-powered real-time synchronization
- **Service Management**: Create, track, and manage service tags with priorities and statuses

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Framer Motion** for premium animations
- **React Router** for navigation
- **Custom CSS** with design system

### Backend
- **AWS Amplify Gen 2** for backend infrastructure
- **Amazon Cognito** for authentication
- **Amazon DynamoDB** for database
- **AWS App Runner** for deployment

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd /home/fred/projects/ServiceTag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS credentials**
   Make sure you have AWS credentials configured:
   ```bash
   aws configure
   ```

4. **Start the Amplify sandbox**
   ```bash
   npm run sandbox
   ```
   This will deploy the backend resources and generate `amplify_outputs.json`

5. **Start the development server** (in a new terminal)
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
ServiceTag/
├── amplify/
│   ├── auth/
│   │   └── resource.ts          # Authentication configuration
│   ├── data/
│   │   └── resource.ts          # Data models (DynamoDB)
│   └── backend.ts               # Backend definition
├── src/
│   ├── components/
│   │   ├── Navigation.tsx       # Navigation component
│   │   └── Navigation.css
│   ├── pages/
│   │   ├── Landing.tsx          # Landing page
│   │   ├── Dashboard.tsx        # Dashboard
│   │   ├── ServiceTags.tsx      # Service tags management
│   │   └── Profile.tsx          # User profile
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Design system
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Design System

The application features a comprehensive design system with:

- **Color Palette**: Vibrant HSL-based colors with primary, secondary, and accent colors
- **Glassmorphism**: Modern glass effect with backdrop blur
- **Typography**: Inter for body text, Outfit for headings
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first approach with breakpoints

## 📱 Pages

### Landing Page
- Hero section with animated elements
- Feature cards showcasing key benefits
- Stats section
- Call-to-action buttons

### Dashboard
- Overview statistics
- Quick actions
- Recent activity feed

### Service Tags
- Create, view, and manage service tags
- Filter by status (all, active, pending, completed)
- Priority and category management
- Due date tracking

### Profile
- User information management
- Editable profile fields
- User statistics

## 🔐 Authentication

The app uses AWS Cognito for authentication with:
- Email/password sign-up
- Email verification
- Secure sign-in
- Password reset

## 📊 Data Models

### ServiceTag
- Title, description, category
- Status: active, pending, completed, archived
- Priority: low, medium, high, urgent
- Due date, tags, attachments
- Owner-based authorization

### UserProfile
- Username, email, display name
- Avatar, bio
- User preferences

### Activity
- Activity type and title
- Description and metadata
- Timestamp tracking

## 🚀 Deployment

### Deploy to AWS

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy with Amplify**
   ```bash
   npm run deploy
   ```

### Deploy to App Runner

The application is designed to work seamlessly with AWS App Runner for containerized deployment.

## 🎯 Key Features

### Premium Design
- Glassmorphism effects
- Vibrant gradient backgrounds
- Smooth animations with Framer Motion
- Dark mode optimized
- Custom scrollbars

### Mobile Optimization
- Touch-friendly interface
- Responsive grid layouts
- Mobile navigation menu
- Optimized performance

### User Experience
- Intuitive navigation
- Loading states
- Empty states
- Form validation
- Error handling

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run sandbox` - Start Amplify sandbox
- `npm run deploy` - Deploy to AWS

## 🔧 Configuration

### Environment Variables
The app uses `amplify_outputs.json` generated by Amplify CLI. No manual environment variables needed.

### AWS Resources
- Cognito User Pool
- DynamoDB Tables (auto-generated)
- AppSync API (auto-generated)
- S3 Buckets (auto-generated)

## 🎨 Customization

### Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --color-primary: hsl(239, 84%, 67%);
  --color-secondary: hsl(280, 100%, 70%);
  /* ... */
}
```

### Fonts
Update Google Fonts in `index.html` and CSS variables.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ using AWS Amplify Gen 2
