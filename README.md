# Путеводитель студента - Telegram Web App

Complete React UI for student guide service platform.

## Features

✨ **Two Roles**

- Student: Create orders, track progress, chat with executors
- Executor: Browse orders, manage work, track finances

🎨 **Design**

- Dark/Light mode toggle
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Loading skeletons

🔔 **Components**

- Bottom navigation tabs
- Toast notifications
- Real-time chat UI
- Progress tracking

## Tech Stack

- React 18
- Tailwind CSS
- Framer Motion (animations)
- React Icons
- React Hot Toast
- Vite
- Axios

## Installation

```bash
cd /Users/jamshid/Desktop/tg
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── App.jsx                 # Main app with routing
├── index.css              # Global styles
├── components/
│   ├── ThemeToggle.jsx   # Dark/Light mode toggle
│   └── Skeleton.jsx      # Loading skeletons
└── screens/
    ├── Welcome.jsx        # Role selection
    ├── Registration.jsx   # User registration
    ├── StudentHome.jsx
    ├── StudentOrders.jsx
    ├── StudentChat.jsx
    ├── StudentProfile.jsx
    ├── ExecutorHome.jsx
    ├── ExecutorOrders.jsx
    ├── ExecutorWork.jsx
    ├── ExecutorFinance.jsx
    └── ExecutorProfile.jsx
```

## Features Implemented

✅ Registration flow
✅ Role-based navigation (Student/Executor)
✅ Dark/Light mode with persistent toggle
✅ Bottom navigation with 4-5 tabs
✅ Mock data for orders, chat, finance
✅ Smooth page transitions
✅ Skeleton loaders
✅ Toast notifications
✅ Responsive mobile design
✅ All UI screens from specification

## UI Principles

- **Minimalism** - 1 main action per screen
- **Colors**: Blue (action), Green (success), Red (error)
- **Animations** - Framer Motion for smooth transitions
- **Mobile-first** - Optimized for small screens

## Notes

- This is a UI-only implementation with mock data
- No backend API integration
- No Telegram Bot integration
- All data is simulated
- Perfect for prototyping and design review
