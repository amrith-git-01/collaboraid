# Unite

A comprehensive event creation and management application that enables users to create, discover, join, and manage events. Built with React and Node.js, Unite provides a seamless platform for organizing both online and offline events with advanced features like location mapping, participant management, user profiles, and organization-based event management.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Database Models](#database-models)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Development](#development)
- [Future Enhancements](#future-enhancements)

## Features

### Authentication & User Management

- **User Registration & Login**: Secure JWT-based authentication with email validation
- **Password Management**:
  - Password reset via email with secure token-based system
  - Password update with current password verification
- **Session Management**: Automatic authentication checks with token persistence
- **Profile Management**:
  - Update personal information (name, phone, bio)
  - Profile photo upload to AWS S3 with automatic image processing
  - Social media links management

### Event Management

- **Event Creation**:
  - Support for both online and offline events
  - Online events: Platform selection (Zoom, Google Meet, Teams, etc.) with meeting links
  - Offline events: Location search with interactive map integration
  - Event images from preset gallery
  - Access control: Free for all or code-protected events
  - Attendee capacity management
- **Event Discovery**:
  - Browse all available events
  - Advanced filtering (type, status, date range, access type)
  - Real-time search functionality
  - Event detail views with participant information
- **Event Participation**:
  - Join/leave events
  - Code-protected event access
  - Capacity validation
- **Event Management**:
  - Edit events (creators only)
  - Soft delete functionality
  - Automatic status tracking (upcoming, ongoing, completed)

### Organization Management

- **Organization Creation**: Create organizations with name, description, URL, and location
- **Organization Management**:
  - View organization details
  - Edit organization information
  - View organization members
  - Delete organization
- **Organization-Based Events**: All events are associated with an organization

### Calendar View

- **Month & Week Views**: Interactive calendar with month and week view modes
- **Event Display**: Events displayed on calendar with color coding by type
- **Event Details**: Click events to view full details in modal
- **Statistics**: Quick stats showing total events, monthly events, and total attendees
- **Navigation**: Easy navigation between months/weeks with "Today" button

### Analytics Dashboard

- **UI Implementation**: Complete analytics dashboard interface
- **Metrics Display**:
  - Total events and growth rate
  - Total attendees and average attendance
  - Engagement rate
  - Top category distribution
- **Charts & Trends**:
  - Monthly events trend visualization
  - Category distribution charts
  - Attendance trends table
  - Top performing events
- **Note**: Currently uses mock data; backend integration pending

### Location Services

- **Location Search**: Autocomplete location search with debounced API calls
- **Map Integration**: Interactive Leaflet maps with OpenStreetMap tiles
- **Coordinate Storage**: Geographic coordinates stored for future features

## Tech Stack

### Frontend

- **React 18.3.1**: Modern UI library with hooks
- **React Router DOM 6.30.1**: Client-side routing with protected routes
- **Redux Toolkit 1.9.7**: State management
- **Redux Persist 6.0.0**: State persistence across page refreshes
- **Vite 7.1.2**: Fast build tool and development server
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Leaflet 1.9.4 & React-Leaflet 4.2.1**: Interactive map integration
- **Lucide React 0.541.0**: Modern icon library
- **Framer Motion 10.18.0**: Animation library

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js 5.1.0**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose 8.16.3**: MongoDB object modeling
- **JWT (jsonwebtoken 9.0.2)**: Authentication tokens
- **Bcrypt 6.0.0**: Password hashing (12 salt rounds)
- **Multer 2.0.2**: File upload handling
- **AWS SDK v3**: S3 integration for image storage
- **Nodemailer 7.0.5**: Email service for notifications
- **Sharp 0.34.3**: Image processing and optimization
- **Validator 13.15.15**: Input validation

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **Nodemon**: Development server auto-reload

## Project Structure

```
collaboraid/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   ├── errorController.js
│   │   ├── eventController.js
│   │   ├── locationController.js
│   │   ├── organizationController.js
│   │   ├── profilePhotoController.js
│   │   └── userController.js
│   ├── models/               # Database models
│   │   ├── eventModel.js
│   │   ├── organizationModel.js
│   │   └── userModel.js
│   ├── routes/               # API routes
│   │   ├── contactRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── organizationRoutes.js
│   │   ├── profilePhotoRoutes.js
│   │   └── userRoutes.js
│   ├── services/             # Business logic services
│   │   └── locationService.js
│   ├── utils/                # Utility functions
│   │   ├── appError.js
│   │   ├── catchAsync.js
│   │   ├── email.js
│   │   ├── multerConfig.js
│   │   └── token.js
│   ├── app.js                # Express app configuration
│   ├── server.js             # Server entry point
│   └── package.json
│
├── frontend/
│   ├── public/               # Static assets
│   │   ├── images/
│   │   │   ├── event_images/  # Preset event images
│   │   │   └── feature_images/
│   │   └── default.png
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   │   ├── AuthCheck.jsx
│   │   │   │   ├── NotAuthenticated.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── ProtectedRouteWrapper.jsx
│   │   │   │   ├── PublicRoute.jsx
│   │   │   │   └── RootRedirect.jsx
│   │   │   ├── forms/        # Form components
│   │   │   │   ├── AuthTabs.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── layouts/      # Layout components
│   │   │   │   └── DashboardLayout.jsx
│   │   │   ├── ui/           # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── CustomDateTimePicker.jsx
│   │   │   │   ├── FilterDropdown.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── Textarea.jsx
│   │   │   ├── CalendarEventModal.jsx
│   │   │   ├── CreateEventForm.jsx
│   │   │   ├── CreateEventModal.jsx
│   │   │   ├── DeleteEventModal.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventFooter.jsx
│   │   │   ├── EventHeader.jsx
│   │   │   ├── EventSkeletonCard.jsx
│   │   │   ├── ImageSelectionModal.jsx
│   │   │   ├── JoinEvents.jsx
│   │   │   ├── LeaveEventModal.jsx
│   │   │   ├── LocationMap.jsx
│   │   │   ├── LocationSearch.jsx
│   │   │   ├── MyEvents.jsx
│   │   │   ├── OrganizationForm.jsx
│   │   │   ├── RemovePhotoModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SocialLinks.jsx
│   │   │   └── UploadModal.jsx
│   │   ├── contexts/         # React contexts
│   │   │   ├── LoadingContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   └── useToastNavigation.js
│   │   ├── pages/            # Page components
│   │   │   ├── Analytics.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Organizations.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/         # API service layer
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── eventService.js
│   │   │   ├── locationService.js
│   │   │   ├── organizationService.js
│   │   │   ├── profilePhotoService.js
│   │   │   └── userService.js
│   │   ├── store/            # Redux store
│   │   │   ├── authSlice.js
│   │   │   ├── eventsSlice.js
│   │   │   ├── filtersSlice.js
│   │   │   ├── organizationSlice.js
│   │   │   ├── index.js
│   │   │   └── selectors.js
│   │   ├── utils/            # Utility functions
│   │   │   ├── authStorage.js
│   │   │   └── tokenStorage.js
│   │   ├── App.jsx           # Main app component
│   │   ├── config.js         # Configuration
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)
- AWS S3 account (for image storage)
- Email service credentials (for password reset emails)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory (or use `config.env`):

```env
NODE_ENV=development
PORT=5151
DATABASE=mongodb://localhost:27017/unite
DATABASE_PASSWORD=your-database-password-if-needed

# JWT Configuration
JWT_SECRET=your-secret-jwt-key-here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@unite.com

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET_NAME=your-bucket-name
```

4. Start the backend server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5151` (or the port specified in your `.env` file).

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5151
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

## Database Models

### User Model

- `name`: String (required)
- `email`: String (required, unique, validated)
- `phone`: String (optional, validated)
- `bio`: String (optional, max 100 characters)
- `password`: String (required, hashed with bcrypt)
- `profilePhoto`: String (URL to S3)
- `passwordChangedAt`: Date
- `passwordResetToken`: String
- `passwordResetExpires`: Date
- `createdAt`: Date
- `updatedAt`: Date

### Event Model

- `eventName`: String (required, 10-40 characters)
- `eventDescription`: String (required, 10-300 characters)
- `eventType`: Enum ['online', 'offline'] (required)
- `eventAccessType`: Enum ['freeForAll', 'codeToJoin'] (required)
- `eventJoinCode`: String (required if codeToJoin, 4-20 characters, unique)
- `eventStartDate`: Date (required)
- `eventEndDate`: Date (required)
- `eventStatus`: Enum ['upcoming', 'ongoing', 'completed'] (default: 'upcoming')
- `eventImage`: String (required, URL)
- `eventCreator`: ObjectId (ref: User, required)
- `eventOrganization`: ObjectId (ref: Organization, required)
- `eventMaxAttendees`: Number (required)
- `eventParticipants`: [ObjectId] (ref: User)
- `online`: Object { eventPlatform, eventLink } (if online event)
- `offline`: Object { eventLocation, coordinates: { lat, lon } } (if offline event)
- `isDeleted`: Boolean (default: false)
- `eventDeletedAt`: Date
- `eventCreatedAt`: Date
- `eventUpdatedAt`: Date

### Organization Model

- `organizationName`: String (required, 3-50 characters)
- `description`: String (optional, max 500 characters)
- `organizationUrl`: String (optional, validated URL)
- `location`: Object { address, coordinates: { lat, lon } } (optional)
- `organizationCreator`: ObjectId (ref: User, required)
- `organizationMembers`: [ObjectId] (ref: User, default includes creator)
- `createdAt`: Date
- `updatedAt`: Date
- `isDeleted`: Boolean (default: false)
- `deletedAt`: Date

## API Documentation

### Base URL

```
http://localhost:5151/unite/api
```

### Authentication Endpoints

- `POST /users/register` - Register a new user
- `POST /users/login` - Login user
- `POST /users/logout` - Logout user
- `GET /users/me` - Get current user
- `PATCH /users/updateMe` - Update user profile
- `PATCH /users/updatePassword` - Update password
- `POST /users/forgotPassword` - Request password reset
- `POST /users/resetPassword` - Reset password with token

### Event Endpoints

- `POST /events/create` - Create a new event
- `GET /events/getAllEvents` - Get all events (with optional filters)
- `GET /events/getMyEvents` - Get events created by current user
- `GET /events/getJoinedEvents` - Get events user has joined
- `GET /events/:id` - Get event by ID
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event (soft delete)
- `POST /events/:id/join` - Join an event
- `POST /events/:id/leave` - Leave an event

### Organization Endpoints

- `POST /organizations/create` - Create a new organization
- `GET /organizations/myOrganization` - Get current user's organization
- `GET /organizations/:id` - Get organization by ID
- `PATCH /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

### Other Endpoints

- `POST /profile-photo/upload` - Upload profile photo
- `DELETE /profile-photo/remove` - Remove profile photo
- `POST /location/search` - Search locations
- `POST /contact/send` - Send contact form

**Note**: All endpoints except `/users/register`, `/users/login`, `/users/forgotPassword`, `/users/resetPassword`, and `/contact/send` require authentication.

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication with expiration
- **Password Reset**: Secure token-based password reset via email (10-minute expiration)
- **Route Protection**: Protected API routes with authentication middleware
- **Input Validation**: Server-side validation for all inputs using Mongoose validators
- **Error Handling**: Centralized error handling with custom error classes
- **CORS**: Configured CORS for cross-origin requests
- **Token Storage**: Secure token storage in localStorage with HTTP-only cookie support
- **Password Security**: Password change tracking to invalidate old tokens

## Development

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Backend Scripts

- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm start` - Start production server

### State Management

The application uses Redux Toolkit with the following slices:

- **authSlice**: Manages authentication state, user profile, and session information
- **eventsSlice**: Handles all event-related data (all events, user events, modals, form state)
- **filtersSlice**: Manages event filtering and search state for both "My Events" and "Join Events"
- **organizationSlice**: Manages organization data and state

State is persisted using Redux Persist, ensuring data survives page refreshes.

## Future Enhancements

The following features have UI implementations but require backend integration:

1. **Analytics Dashboard**: Complete analytics with real event data and metrics (currently uses mock data)
2. **Event Notifications**: Email/push notifications for event updates
3. **Event Reminders**: Automated reminders before events
4. **Event Comments/Discussions**: Social features for event participants
5. **Event Sharing**: Social media sharing capabilities
6. **Advanced Filtering**: More sophisticated event filtering options
7. **Event Export**: Export events to calendar formats (iCal, Google Calendar)
8. **Real-time Updates**: WebSocket integration for real-time event updates
9. **Organization Join Codes**: Join organizations via codes (currently only creation is supported)
10. **Event Recurrence**: Support for recurring events

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Authors

- Development Team

## Acknowledgments

- React community for excellent documentation
- Tailwind CSS for the utility-first CSS framework
- Leaflet for open-source mapping
- All open-source contributors whose packages made this project possible
