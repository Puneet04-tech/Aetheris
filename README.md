# Aetheris - The Unified Professional Ecosystem

Aetheris is a hyper-integrated full-stack web application that eliminates professional platform fragmentation. It merges the networking capabilities of LinkedIn, the technical depth of GitHub, the visual artistry of Behance, and the real-time community engagement of Discord and Reddit into one cohesive experience.

## 🏗️ Project Structure

This repository contains two main applications:

### 📱 Frontend (`/frontend`)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **UI Components**: Radix UI primitives
- **State Management**: React Hooks with custom API client
- **Port**: 3000

### 🖥 Backend (`/backend`)
- **Framework**: Next.js 15 (API Routes)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **API**: RESTful endpoints with TypeScript
- **Port**: 3001

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or Neon account)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd aetheris
```

### 2. Environment Setup
Create environment files for both frontend and backend:

**Backend Environment** (`backend/.env.local`):
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**Frontend Environment** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Database Setup
```bash
cd backend

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Start Development Servers
```bash
# Start backend server (Terminal 1)
cd backend
npm run dev

# Start frontend server (Terminal 2)
cd frontend
npm run dev
```

### 6. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📋 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Drizzle Studio
npm run db:seed      # Seed with sample data
```

### Frontend Scripts
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## 🔧 API Endpoints

### Posts
- `GET /api/posts` - Get posts with filtering and pagination
- `POST /api/posts` - Create new post
- `POST /api/posts/[id]/vote` - Vote on post
- `DELETE /api/posts/[id]/vote` - Remove vote

### Communities
- `GET /api/communities` - Get communities
- `POST /api/communities` - Create community
- `POST /api/communities/[id]/join` - Join community
- `DELETE /api/communities/[id]/leave` - Leave community

### Opportunities
- `GET /api/opportunities` - Get job opportunities
- `POST /api/opportunities` - Create opportunity

### System
- `GET /api/health` - Health check endpoint

## 🗄 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Multi-modal identities with roles and badges
- **Communities**: Reddit/Discord hybrid communities
- **Posts**: Multi-media content with various types
- **Comments**: Nested discussion threads
- **Votes**: Upvote/downvote system
- **Opportunities**: Job listings and freelance projects

## 🎨 Design System: Executive Aurora

Aetheris features a premium "CEO-level" interface with:

- **Color Palette**: Deep charcoal background with dynamic mesh gradients in Emerald and Amethyst
- **Glassmorphism**: Frosted glass effects with backdrop blur and subtle borders
- **Status Ribbons**: Floating 3D-effect badges for user roles and achievements
- **Responsive Design**: Mobile-first approach with desktop optimization

## 🎯 Features

### Core Functionality
- **Multi-Hyphenate Profiles**: Users don't just have a "Job Title" - they have "Streams" (Dev, Designer, Founder)
- **Project Vaults**: Code repositories, visual portfolios, and case studies in one place
- **Communities & Circles**: Persistent, role-based chat rooms and forum threads
- **Opportunity Board**: Job listings with salary transparency and freelance leads
- **Real-time Voting & Comments**: Upvote/downvote system with nested discussions

### Post Types
- **REPO**: Code snippets and repository showcases
- **GALLERY**: Visual portfolios and design work
- **ARTICLE**: Long-form content and case studies
- **PULSE**: Status updates and milestones
- **JOB**: Career opportunities and freelance projects
- **QUESTION**: Community Q&A and discussions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Database by [Drizzle ORM](https://orm.drizzle.team/)

---

**Aetheris** - Where talent meets opportunity in one unified ecosystem.
