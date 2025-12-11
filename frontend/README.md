# Collaboraid Frontend

A modern React application for event management and collaboration.

## Features

- **Responsive Design**: Built with Tailwind CSS for all screen sizes
- **Modern UI**: Clean, professional interface with purple color scheme
- **Contact Form**: Fully functional contact form with backend integration
- **Email Templates**: Professional email templates matching the frontend design
- **Toast Notifications**: Global toast system for user feedback
- **404 Page**: Professional Not Found page for unmatched routes

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Connection

The frontend connects to the backend API at `http://localhost:5000`. Make sure:

1. **Backend is running** on port 5000
2. **CORS is configured** (already done in backend)
3. **Contact route is active** at `/collaboraid/api/contact/message`

### Environment Configuration

To customize the backend URL, create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Contact Form Features

- **Real-time validation** with helpful error messages
- **Loading states** during form submission
- **Success/error feedback** with auto-hide functionality
- **Form reset** after successful submission
- **Responsive design** for all devices
- **Professional styling** matching the brand colors

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (Button, Input, Card)
│   ├── sections/       # Page sections (Hero, Features, etc.)
│   └── layouts/        # Layout components
├── pages/              # Page components
├── config.js           # API configuration
└── main.jsx           # App entry point
```

## Backend Integration

The contact form sends data to:

- **Endpoint**: `POST /collaboraid/api/contact/message`
- **Data**: `{ name, email, message }`
- **Response**: Success/error status with message

## Contributing

1. Follow the existing code style
2. Use Tailwind classes for styling
3. Maintain the purple color scheme (#9333ea, #7c3aed)
4. Test on both desktop and mobile devices
