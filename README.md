# Kuga LMS Frontend

React-based frontend for the Kuga LMS Attendance Management System.

## Features

- 🎓 **Student Portal**
  - View class schedule
  - Scan QR codes for attendance
  - Mobile-friendly camera integration

- 👨‍🏫 **Teacher Portal**
  - View teaching schedule
  - Generate dynamic QR codes for attendance
  - Real-time QR code streaming

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client
- **QRCode** - QR code generation
- **Shadcn UI** - UI components

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8888` (see `../kuga-qr/README.md`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Copy example env file
cp .env.example .env

# Or create .env manually with:
echo "VITE_API_BASE_URL=http://localhost:8888" > .env
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Note:** API requests are automatically proxied through Vite:
- Frontend: `http://localhost:5173`
- API calls: `/api/*` → `http://localhost:8888/*`
- This solves Mixed Content issues when using HTTPS frontend with HTTP backend

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # UI components (Button, Card, Input, etc)
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── student/
│   │   ├── StudentSchedulePage.tsx
│   │   └── StudentScanPage.tsx
│   └── teacher/
│       ├── TeacherSchedulePage.tsx
│       └── TeacherQRStreamPage.tsx
├── lib/                # Utilities
│   ├── api.ts          # API client
│   └── utils.ts        # Helper functions
├── store/              # Zustand stores
│   └── authStore.ts    # Authentication state
├── types/              # TypeScript types
│   └── api.ts          # API types
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

### Development

No `.env` file needed! Vite proxy automatically routes `/api/*` to `http://localhost:8888/*`

### Production

Create a `.env.production` file:

```env
VITE_API_BASE_URL=https://your-backend.com
```

See `HTTPS_BACKEND_SETUP.md` for details on proxy configuration.

## Test Credentials

Use these credentials to test the application:

**Student:**
- ID: `S1001`
- Password: `pass`

**Teacher:**
- ID: `T2001`
- Password: `pass`

## Usage

### For Students

1. Login with student credentials
2. View your class schedule
3. Click "Mark Attendance" on a class
4. Scan the QR code displayed by your teacher
5. Or manually enter QR data and schedule ID

### For Teachers

1. Login with teacher credentials
2. View your teaching schedule
3. Click "Generate QR Code" for a class
4. Display the QR code to students
5. QR code auto-refreshes for security

## Development Notes

- The app uses JWT tokens stored in localStorage for authentication
- Protected routes automatically redirect based on user role
- QR streaming uses Server-Sent Events (SSE)
- Camera access requires HTTPS in production (or localhost in dev)
- **iOS Simulator does not support camera** - use manual QR entry or test on real iPhone
- See `SIMULATOR_NOTE.md` for iOS Simulator camera limitations

## API Integration

The app communicates with the backend API at:
- Student endpoints: `/student/*`
- Teacher endpoints: `/teacher/*`

All authenticated requests include a Bearer token in the Authorization header.

See the backend OpenAPI spec at `../kuga-qr/openapi/openapi.yaml` for full API documentation.

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## License

MIT © 2025
# qr-code
