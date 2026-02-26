# NIT Trichy Tournament Management — Frontend

React frontend for the Inter-NIT Tournament Management System.

## Tech Stack
- **React 18** + **Vite** — Fast development and build
- **TailwindCSS** — Utility-first styling with custom NIT Trichy theme
- **React Router v6** — Client-side routing with protected routes
- **Axios** — HTTP client with JWT interceptor
- **html5-qrcode** — Camera-based QR code scanning
- **react-hot-toast** — Toast notifications

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
- `VITE_API_URL` — Backend API URL (default: http://localhost:8000)

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

---

## Features

### Role-Based Access Control
| Role | Pages Accessible |
|------|-----------------|
| `admin` | All pages |
| `registration_volunteer` | Dashboard, Registration |
| `verification_volunteer` | Dashboard, Verification |
| `food_volunteer` | Dashboard, Food Coupons |

### Pages

#### Login (`/login`)
- Secure sign-in with username/password
- JWT token stored in localStorage
- Auto-redirect based on role

#### Dashboard (`/dashboard`)
- Role-specific module cards
- Quick access navigation

#### Registration (`/registration`)
- Multi-step flow: Scan QR → Verify Info → Capture Photo → Confirm
- Duplicate registration prevention
- Manual ID fallback

#### Verification (`/verification`)
- Scan QR to display participant identity card
- Shows stored photo for visual verification
- Food consumption overview

#### Food Coupons (`/food`)
- Auto-calculated tournament day
- Meal selection with consumed status indicators
- Confirmation modal before marking
- Atomic double-spending prevention

#### Admin Panel (`/admin`)
- Overview statistics
- Food consumption dashboard with progress bars
- Volunteer account management (create/delete)
- Tournament date configuration

---

## Project Structure
```
frontend/
├── src/
│   ├── App.jsx                   # Routes + Auth provider
│   ├── main.jsx                  # Entry point
│   ├── index.css                 # Tailwind + global styles
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management
│   ├── services/
│   │   └── api.js                # Axios + JWT interceptor
│   ├── components/
│   │   ├── ProtectedRoute.jsx    # Role-based route guard
│   │   ├── Navbar.jsx            # Top navigation
│   │   ├── QRScanner.jsx         # html5-qrcode wrapper
│   │   ├── CameraCapture.jsx     # getUserMedia camera
│   │   └── ConfirmModal.jsx      # Confirmation dialog
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Registration.jsx
│       ├── Verification.jsx
│       ├── FoodCoupon.jsx
│       └── AdminDashboard.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── .env.example
└── README.md
```

## Color Theme
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Red | `#A6192E` | NIT Trichy brand, CTAs |
| Dark 900 | `#0a0a0f` | Page background |
| Dark 700 | `#1a1a28` | Cards |
| Dark 600 | `#222235` | Inputs, secondary cards |

## Browser Requirements
- Camera access (HTTPS required in production for QR/camera features)
- Modern browser (Chrome 80+, Firefox 75+, Safari 13+)

## Production Deployment
For camera features to work in production, the app **must be served over HTTPS**.

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```
