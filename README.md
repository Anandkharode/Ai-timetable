# 🎓 AI Timetable Generator

An intelligent, automated timetable generation system for educational institutions. Built with React, Node.js, and MongoDB, this application uses AI algorithms to create conflict-free academic schedules with smart faculty and room allocation.



### Core Functionality
- **AI-Powered Scheduling** - Intelligent algorithms for conflict-free timetable generation
- **Faculty Management** - Add, edit, and manage faculty members with departments and subjects
- **Room Allocation** - Smart room assignment with capacity and type tracking
- **Dashboard Analytics** - Visual overview of schedules, faculty, and room statistics
- **Interactive Timetable View** - Beautiful, responsive timetable display with color-coded subjects
- **Customizable Settings** - Configure institution details, working days, time slots, and breaks

### User Experience
-  **Dark Mode** - Fully functional dark theme with persistent preference
-  **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Authentication** - Secure login/signup with JWT tokens
-  **Google Sign-In** - Quick authentication with Google OAuth (development mode included)
-  **Profile Management** - Edit user profiles, change passwords, and upload avatars
- **Modern UI/UX** - Premium design with smooth animations and transitions

### Export & Integration
- **Print Support** - Print-optimized timetables for distribution
- **Local Storage** - Client-side persistence for settings and preferences

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - Modern UI library with hooks
- **React Router 7.12** - Client-side routing
- **Vite 7.2** - Fast build tool and dev server
- **CSS3** - Custom styling with CSS variables for theming
- **Google Fonts** - Cormorant Garamond & Work Sans

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.2** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 9.1** - MongoDB object modeling
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v7.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-timetable.git
cd ai-timetable
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### Create Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/timetable
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
```

**Important:** Replace `your_super_secret_jwt_key_here_change_this_in_production` with a strong, random secret key.

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

#### (Optional) Configure Google OAuth

If you want to use real Google Sign-In instead of the development mode:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:5173` to authorized JavaScript origins
6. Copy your Client ID
7. Update the Client ID in:
   - `frontend/src/pages/Login.jsx` (line 76)
   - `frontend/src/pages/Signup.jsx` (line 82)

Replace `"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"` with your actual Client ID.

---

## 🏃‍♂️ Running the Application

### Start MongoDB

Ensure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```


### Start the Backend Server

From the `backend` directory:

```bash
npm run dev
```

The backend will start on **http://localhost:5000**

### Start the Frontend Development Server

From the `frontend` directory (in a new terminal):

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---



## 🎮 Usage Guide

### First-Time Setup

1. **Sign Up**: Create an account or use Google Sign-In
2. **Add Faculty**: Navigate to Faculty panel and add teaching staff
3. **Add Rooms**: Navigate to Rooms panel and add available classrooms
4. **Configure Settings**: Go to Settings and set:
   - Institution name
   - Academic year and semester
   - Working days
   - Time slots and breaks
5. **Create Schedule**: Click "Create Schedule" and add subjects with faculty assignments
6. **Generate Timetable**: Submit the form to generate your timetable
7. **View & Print**: View the generated timetable and print if needed

### Managing Data

- **Faculty**: Add/Edit/Delete faculty members with subject specializations
- **Rooms**: Manage classroom capacity and availability
- **Settings**: Toggle dark mode, configure schedule timings
- **Profile**: Update personal information and change password

---

## 🔧 Configuration

### Dark Mode

Dark mode is automatically saved to `localStorage` and persists across sessions. Toggle it in Settings → Preferences.

### Time Slots

Configure your institution's schedule in Settings:
- **Start Time**: When classes begin (e.g., 09:00)
- **End Time**: When classes end (e.g., 17:00)
- **Slots Per Day**: Number of class periods
- **Slot Duration**: Length of each period (minutes)
- **Break Configuration**: After which slot and duration

---

## 🧪 Development

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The optimized production build will be in `frontend/dist/`

**Backend:**
```bash
cd backend
npm start
```

### Linting

```bash
cd frontend
npm run lint
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError`

**Solution:**
- Ensure MongoDB is running: `mongod --version`
- Check the connection string in `.env`
- Verify MongoDB is accessible on port 27017

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
- Change the PORT in `backend/.env`
- Or kill the process using port 5000

### Google OAuth Not Working

- In development mode, Google OAuth is simulated and doesn't require setup
- For production, configure a real Google Client ID as described in setup

---

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/timetable` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |



