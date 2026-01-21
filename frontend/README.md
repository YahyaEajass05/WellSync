# WellSync Frontend

AI-Powered Mental Wellness & Academic Performance Prediction System - Frontend Application

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **3D Graphics:** Three.js + React Three Fiber
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Notifications:** Sonner

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install additional Shadcn components (as needed):**
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and update:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── dashboard/
│   │   ├── predictions/
│   │   ├── analytics/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── three/                    # 3D components
│   │   ├── WellnessOrb.tsx
│   │   ├── StressVisualization.tsx
│   │   └── Scene.tsx
│   └── providers.tsx
├── lib/
│   ├── api/                      # API client
│   │   ├── axios-instance.ts
│   │   ├── auth.ts
│   │   ├── predictions.ts
│   │   ├── users.ts
│   │   └── notifications.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePredictions.ts
│   │   └── useDashboard.ts
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── utils.ts
│   └── constants.ts
├── types/
│   ├── index.ts
│   └── api.ts
└── package.json
```

## 🎨 Key Features

### 1. Authentication
- ✅ Login/Register with form validation
- ✅ Email verification
- ✅ Password reset
- ✅ JWT token management
- ✅ Protected routes

### 2. Dashboard
- ✅ User statistics overview
- ✅ Latest predictions display
- ✅ Recent activity feed
- ✅ Quick action cards

### 3. Predictions
- ✅ Mental Wellness prediction
- ✅ Academic Impact prediction
- ✅ Stress Level prediction
- ✅ Prediction history
- ✅ Real-time results

### 4. 3D Visualizations
- ✅ Interactive Wellness Orb (color-coded by score)
- ✅ Stress particle visualization
- ✅ Smooth animations with Three.js
- ✅ Auto-rotating 3D scenes

### 5. UI/UX
- ✅ Responsive design (mobile-first)
- ✅ Dark/Light theme support
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 📚 Adding New Components

### Using Shadcn CLI
```bash
# Add a button component
npx shadcn-ui@latest add button

# Add multiple components
npx shadcn-ui@latest add card dialog dropdown-menu
```

### Available Shadcn Components
- accordion, alert, avatar, badge, button, card, checkbox
- dialog, dropdown-menu, form, input, label, select, table
- tabs, toast, tooltip, and more...

## 🎯 API Integration

The frontend connects to the backend API at `http://localhost:5000/api` (configurable via `.env.local`).

### API Endpoints Used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `GET /users/dashboard` - Get dashboard data
- `POST /predictions/mental-wellness` - Create mental wellness prediction
- `POST /predictions/academic-impact` - Create academic prediction
- `POST /predictions/stress-level` - Create stress prediction
- `GET /predictions` - Get all predictions

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage and Zustand store
4. Axios interceptor adds token to all requests
5. Protected routes check for token
6. Auto-redirect to login if unauthorized

## 🎨 Theming

The app supports light/dark themes using `next-themes`.

### Color Palette
```css
--primary: 200 100% 50%        /* Blue */
--secondary: 142 71% 45%       /* Green */
--accent: 280 60% 50%          /* Purple */
--wellness-high: #4ade80       /* Green */
--wellness-medium: #fbbf24     /* Yellow */
--wellness-low: #ef4444        /* Red */
```

## 🧪 Testing (Coming Soon)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_AI_SERVICE_URL` | AI Service URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `WellSync` |

## 🚨 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Run `npm install` to install all dependencies

### Issue: API connection errors
**Solution:** 
1. Check if backend is running on `http://localhost:5000`
2. Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check CORS settings in backend

### Issue: 3D components not rendering
**Solution:**
1. Ensure Three.js dependencies are installed
2. Check browser console for WebGL errors
3. Try a different browser (Chrome/Firefox recommended)

### Issue: "localStorage is not defined"
**Solution:** This happens during SSR. Wrap localStorage access in `useEffect` or check `typeof window !== 'undefined'`

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

The optimized build will be created in `.next/` directory.

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Deployment
1. Build the application: `npm run build`
2. Upload `.next/` folder and `node_modules/` to server
3. Run `npm start` on the server
4. Configure reverse proxy (nginx/apache)

## 🤝 Contributing

1. Create a new branch for your feature
2. Follow the existing code style
3. Test your changes thoroughly
4. Create a pull request

## 📄 License

MIT

## 🆘 Support

For issues and questions:
- Check the documentation
- Review existing issues
- Contact the development team

---

**Built with ❤️ using Next.js and Three.js**
