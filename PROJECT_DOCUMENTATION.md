# AI Timetable Project Documentation

## 1. Project Overview

This project is a full-stack timetable generator for educational institutions.

It has three main parts:

- `frontend/`: the React application used by the user
- `backend/`: the Node.js + Express API that handles auth, persistence, and communication with the AI service
- `AI/`: the Flask-based Python microservice that generates timetable entries

At a high level, the project works like this:

1. A user signs in through the frontend.
2. The user configures faculty, rooms, and timetable settings.
3. The user enters subjects and the number of lectures required per week.
4. The frontend sends that data to the backend.
5. The backend forwards the request to the Python AI service.
6. The AI service generates timetable entries.
7. The backend stores the generated timetable in MongoDB.
8. The frontend fetches and displays saved timetables.

This means the project is a combination of:

- client-side local storage for UI configuration data
- backend database persistence for saved timetables and users
- a separate Python scheduler service for timetable generation

---

## 2. Folder Structure

### Root

- `README.md`: basic project introduction and setup notes
- `PROJECT_DOCUMENTATION.md`: this detailed technical guide
- `frontend/`: React frontend
- `backend/`: Express backend
- `AI/`: Flask AI service

### `frontend/`

Contains the user interface, navigation, forms, dashboard, timetable display, and browser-side persistence.

Important areas:

- `src/App.jsx`: route definitions
- `src/pages/`: major screens and panels
- `src/utils/`: helper modules and localStorage stores

### `backend/`

Contains the Express server, MongoDB connection, API routes, controllers, and database models.

Important areas:

- `server.js`: backend entry point
- `routes/`: API endpoints
- `controllers/`: route logic for saved timetables
- `models/`: MongoDB schemas
- `config/db.js`: database connection

### `AI/`

Contains the Python Flask service that generates the timetable.

Important areas:

- `app.py`: the full AI scheduling logic and HTTP endpoint
- `venv/`: local Python virtual environment

---

## 3. Technology Stack

### Frontend

- React
- React Router
- Vite
- plain CSS
- browser `localStorage`

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI service

- Python
- Flask
- Flask-CORS

---

## 4. End-to-End Application Flow

This is the most important flow in the project.

### Step 1: Authentication

The user lands on the frontend and is redirected based on whether a token exists in `localStorage`.

- If `token` exists, the user can access protected routes.
- If `token` does not exist, the user is redirected to `/login`.

This logic lives in:

- `frontend/src/App.jsx`

### Step 2: Dashboard

After login, the user reaches the dashboard.

The dashboard:

- shows saved timetables fetched from the backend
- shows faculty count from localStorage
- shows room count from localStorage
- lets the user switch to faculty, rooms, settings, and profile panels
- lets the user open or delete saved timetables

### Step 3: Configure Faculty, Rooms, and Settings

Before generating a timetable, the user typically configures:

- faculty members
- rooms
- institution settings
- working days and slot configuration

Important detail:

- faculty and rooms are stored only in browser localStorage
- settings are also stored only in browser localStorage
- saved timetables are stored in MongoDB

So the system uses two storage layers:

- local browser storage for UI-managed configuration
- MongoDB for persistent generated timetables and users

### Step 4: Create Timetable Input

The user goes to `/create` and fills:

- schedule title
- optional description
- subject name
- faculty name
- lectures per week

The frontend then:

1. loads current settings from localStorage
2. converts settings into generated time slot labels
3. sends the subject list, working days, and generated slots to the backend AI route

### Step 5: Backend Calls AI Service

The backend route `/api/ai/generate` receives the frontend payload and forwards it to:

- `http://127.0.0.1:5001/generate`

That is the Flask service inside `AI/app.py`.

### Step 6: AI Service Generates Timetable

The Python service creates timetable entries using a randomized scheduling algorithm.

It returns entries like:

- `subject`
- `faculty`
- `room`
- `day`
- `slot`

### Step 7: Backend Saves Generated Entries

After the backend receives the generated entries:

1. it clears the temporary `Timetable` collection
2. inserts the new entries there
3. returns the generated timetable to the frontend

Then the frontend immediately saves that generated timetable permanently by calling:

- `POST /api/timetable/save`

This creates a `SavedTimetable` document with:

- title
- description
- entries
- settings snapshot
- createdAt

### Step 8: View Timetable

The frontend navigates to `/timetable?id=<savedId>`.

That page fetches the saved timetable from MongoDB and renders it in a grid view.

The user can:

- print it
- inspect cell details
- delete it
- go back and create a new one

---

## 5. Frontend Documentation

## 5.1 Frontend Entry Point

### `frontend/src/main.jsx`

This is the React bootstrap file.

Responsibilities:

- imports global CSS
- mounts the app into the root DOM element

### `frontend/src/App.jsx`

This is the main routing layer.

Responsibilities:

- wraps the app in `BrowserRouter`
- defines public and protected routes
- checks for `localStorage.getItem("token")`
- redirects unauthenticated users to `/login`

Defined routes:

- `/` -> dashboard if authenticated
- `/login` -> login page
- `/signup` -> signup page
- `/dashboard` -> dashboard
- `/create` -> timetable input page
- `/timetable` -> timetable viewer
- `/logout` -> clears auth and redirects

Important limitation:

- route protection is based only on token presence in localStorage
- there is no backend token verification on page load

## 5.2 Authentication Pages

### `frontend/src/pages/Login.jsx`

Responsibilities:

- handles email/password login
- validates inputs
- calls `POST /api/auth/login`
- stores returned token in localStorage
- supports a simulated Google sign-in development flow

Important note:

- Google sign-in is mostly mocked unless a real Google client ID is added

### `frontend/src/pages/Signup.jsx`

Responsibilities:

- handles name/email/password registration
- validates input
- calls `POST /api/auth/signup`
- supports simulated Google signup

### `frontend/src/pages/Logout.jsx`

Responsibilities:

- clears localStorage
- redirects to login
- reloads the page

## 5.3 Dashboard and Management Panels

### `frontend/src/pages/Dashboard.jsx`

This is the main post-login screen.

Responsibilities:

- fetches saved timetables from backend
- loads faculty count from localStorage
- loads room count from localStorage
- switches between internal sections:
  - dashboard
  - faculty
  - rooms
  - settings
  - profile
- handles deleting saved timetables
- navigates to create page or timetable details

Data sources used here:

- backend API for saved timetables
- localStorage stores for faculty, rooms, and settings

### `frontend/src/pages/FacultyPanel.jsx`

Responsibilities:

- add faculty members
- search faculty
- delete faculty
- persist faculty to localStorage

Faculty object structure:

- `id`
- `name`
- `department`
- `shortCode`
- `createdAt`

### `frontend/src/pages/RoomsPanel.jsx`

Responsibilities:

- add rooms
- assign room type and capacity
- search rooms
- delete rooms
- persist rooms to localStorage

Room object structure:

- `id`
- `name`
- `type`
- `capacity`
- `building`
- `createdAt`

Important note:

- rooms configured here are not actually used by the current AI service
- the AI service uses hardcoded rooms `R1` and `R2`

### `frontend/src/pages/SettingsPanel.jsx`

Responsibilities:

- edit institution details
- edit academic year and semester
- choose working days
- configure slot count, duration, start time, end time, and break info
- toggle notifications and dark mode
- save settings to localStorage
- reset settings to defaults

These settings affect time slot generation used in the timetable creation flow.

### `frontend/src/pages/ProfilePanel.jsx`

Responsibilities:

- edit user profile information locally
- save profile to localStorage
- simulate password change

Important limitation:

- profile changes are not synced with the backend user model
- password change is simulated only

## 5.4 Timetable Creation and Viewing

### `frontend/src/pages/InputPage.jsx`

This page is the main timetable creation form.

Responsibilities:

- manage the list of subject entries
- validate required input
- allow faculty selection from saved faculty list
- build dynamic slots from current settings
- send generation request to backend
- save generated timetable to backend
- redirect to timetable viewer

Generation flow in this file:

1. Validate schedule title and subject rows.
2. Load settings using `getSettings()`.
3. Build slots using `generateTimeSlots(settings)`.
4. Send payload to `POST /api/ai/generate`.
5. Receive timetable entries.
6. Save them with `POST /api/timetable/save`.
7. Navigate to `/timetable?id=<savedId>`.

Payload sent to backend AI route:

```json
{
  "subjects": [
    {
      "subject": "Mathematics",
      "faculty": "Dr. Smith",
      "lecturesPerWeek": 3
    }
  ],
  "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "slots": ["9:00AM-10:00AM", "10:00AM-11:00AM"]
}
```

### `frontend/src/pages/TimetablePage.jsx`

Responsibilities:

- fetch a saved timetable by ID
- render timetable grid
- display subject/faculty per cell
- show a detail panel when a filled cell is clicked
- allow print, delete, and edit navigation

Important detail:

- the page uses a hardcoded display day list of Monday to Friday
- settings may allow Saturday or Sunday, but this page currently renders only Monday to Friday

## 5.5 Frontend Utility Modules

### `frontend/src/utils/facultyStore.js`

localStorage helper for faculty records.

Exports:

- `getFaculty()`
- `saveFaculty(list)`
- `addFaculty(faculty)`
- `updateFaculty(id, updates)`
- `removeFaculty(id)`

### `frontend/src/utils/roomStore.js`

localStorage helper for room records.

Exports:

- `getRooms()`
- `saveRooms(list)`
- `addRoom(room)`
- `updateRoom(id, updates)`
- `removeRoom(id)`

### `frontend/src/utils/settingsStore.js`

localStorage helper for application settings.

Default settings include:

- institution name
- academic year
- semester
- working days
- slots per day
- slot duration
- start time
- end time
- break timing
- theme
- notifications

Exports:

- `getSettings()`
- `saveSettings(settings)`
- `resetSettings()`

### `frontend/src/utils/timetableUtils.js`

Contains `generateTimeSlots(settings)`.

Responsibilities:

- convert settings into human-readable time ranges
- apply slot duration
- insert a break after a chosen slot

Example:

- start time: `09:00`
- slot duration: `60`
- break after slot: `3`
- break duration: `15`

Possible output:

- `9:00AM-10:00AM`
- `10:00AM-11:00AM`
- `11:00AM-12:00PM`
- break inserted
- `12:15PM-1:15PM`

---

## 6. Backend Documentation

## 6.1 Backend Entry Point

### `backend/server.js`

This is the backend application entry file.

Responsibilities:

- loads environment variables with `dotenv`
- connects to MongoDB
- enables CORS
- enables JSON request parsing
- registers API routes
- starts the Express server

Registered routes:

- `/test`
- `/api/timetable`
- `/api/ai`
- `/api/auth`

## 6.2 Database Connection

### `backend/config/db.js`

Responsibilities:

- connect to MongoDB using `process.env.MONGO_URI`
- log success or exit on failure

Required environment variable:

- `MONGO_URI`

## 6.3 Authentication

### `backend/routes/authRoutes.js`

Responsibilities:

- signup route
- login route

#### `POST /api/auth/signup`

Flow:

1. Read `name`, `email`, `password`.
2. Check whether a user already exists.
3. Hash the password with bcrypt.
4. Create the user in MongoDB.
5. Return success.

#### `POST /api/auth/login`

Flow:

1. Read `email`, `password`.
2. Find user by email.
3. Compare password with bcrypt hash.
4. Create JWT token.
5. Return token.

Important limitation:

- JWT secret is hardcoded as `"secret123"` instead of using `.env`
- there is no auth middleware protecting backend routes

## 6.4 AI Route

### `backend/routes/aiRoutes.js`

Responsibilities:

- receives generation requests from frontend
- forwards them to the Python AI service
- stores the returned entries in the `Timetable` collection
- returns the generated entries to the frontend

#### `POST /api/ai/generate`

Flow:

1. Receive frontend payload.
2. Call Python endpoint `http://127.0.0.1:5001/generate`.
3. Read generated timetable JSON.
4. Delete all existing temporary `Timetable` records.
5. Insert the new generated entries.
6. Return the timetable to the frontend.

Important note:

- this route uses the global `fetch` available in modern Node.js

## 6.5 Timetable Save Routes

### `backend/routes/timetableRoutes.js`

This file wires route paths to controller methods.

Routes:

- `POST /api/timetable/save`
- `GET /api/timetable`
- `GET /api/timetable/:id`
- `DELETE /api/timetable/:id`

### `backend/controllers/timetableController.js`

Responsibilities:

- save generated timetables permanently
- list saved timetables
- fetch one saved timetable by ID
- delete a saved timetable

#### `createTimetable`

Creates a `SavedTimetable` document from:

- `title`
- `description`
- `entries`
- `settings`

#### `getSavedTimetables`

Returns all saved timetables sorted newest first.

#### `getTimetableById`

Returns one saved timetable by MongoDB ID.

#### `deleteTimetable`

Deletes one saved timetable by MongoDB ID.

## 6.6 Backend Models

### `backend/models/User.js`

MongoDB schema for registered users.

Fields:

- `name`
- `email`
- `password`

### `backend/models/Timetable.js`

Temporary timetable-entry schema.

Fields:

- `subject`
- `faculty`
- `room`
- `day`
- `slot`

This collection is used by the AI generation route before permanent saving.

### `backend/models/SavedTimetable.js`

Permanent timetable storage schema.

Top-level fields:

- `title`
- `description`
- `createdAt`
- `entries`
- `settings`

Each entry contains:

- `subject`
- `faculty`
- `room`
- `day`
- `slot`

Settings snapshot contains:

- `institutionName`
- `academicYear`
- `semester`
- `startTime`
- `slotDuration`
- `slotsPerDay`
- `breakAfterSlot`
- `breakDuration`

Saving settings inside the document is useful because it preserves the timetable context exactly as it was generated.

---

## 7. AI Service Documentation

### `AI/app.py`

This file contains the timetable generation microservice.

It runs a Flask server on port `5001`.

Responsibilities:

- accept subject and scheduling input over HTTP
- generate a timetable
- return JSON entries

### Constants

- `DAYS`: default days if frontend does not provide custom days
- `SLOTS`: default time slots if frontend does not provide custom slots
- `ROOMS`: hardcoded room list used by AI
- `MAX_LECTURES_PER_DAY = 2`
- `MAX_ATTEMPTS = 1000`

### Main function: `generate_timetable(subjects, days, slots)`

This is the core algorithm.

It is a randomized greedy scheduler.

For each subject:

1. Read `lecturesPerWeek`.
2. Randomly choose a day.
3. Randomly choose a slot.
4. Randomly choose a room.
5. Check constraints.
6. If valid, place the lecture.
7. Repeat until the required number of lectures is placed or attempts run out.

Constraints enforced:

- a faculty member cannot teach two classes in the same day/slot
- a room cannot be occupied by two classes in the same day/slot
- a faculty member cannot exceed 2 lectures in a single day

Internal tracking structures:

- `occupied_faculty`: set of `(day, slot, faculty)`
- `occupied_room`: set of `(day, slot, room)`
- `daily_load`: map of `(day, faculty)` -> count

### Route: `POST /generate`

Accepts JSON input:

```json
{
  "subjects": [
    {
      "subject": "Physics",
      "faculty": "Dr. Kumar",
      "lecturesPerWeek": 3
    }
  ],
  "days": ["Monday", "Tuesday"],
  "slots": ["9:00AM-10:00AM", "10:00AM-11:00AM"]
}
```

Returns:

```json
[
  {
    "subject": "Physics",
    "faculty": "Dr. Kumar",
    "room": "R1",
    "day": "Monday",
    "slot": "9:00AM-10:00AM"
  }
]
```

### Current algorithm limitations

- it is random, so the exact timetable changes across runs
- it does not backtrack
- it does not guarantee a complete timetable even if a valid one exists
- it does not use frontend room data
- it does not detect all possible institutional constraints
- it can silently return fewer entries than requested if attempts are exhausted

---

## 8. Data Storage Strategy

The project stores data in multiple places.

### MongoDB

Used for:

- users
- temporary AI-generated entries
- permanently saved timetables

### localStorage

Used for:

- auth token
- faculty list
- room list
- settings
- profile data
- simulated Google user data

### Why this matters

If two users open the app on different browsers:

- they will not share faculty, room, settings, or profile data
- but they will share backend saved timetables if connected to the same database

That is because localStorage is browser-local, while MongoDB is shared backend storage.

---

## 9. API Reference

## Backend API

### `GET /test`

Returns:

- `"Backend is running"`

### `POST /api/auth/signup`

Request:

```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "secret123"
}
```

### `POST /api/auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "..."
}
```

### `POST /api/ai/generate`

Request:

```json
{
  "subjects": [
    {
      "subject": "Math",
      "faculty": "Dr. A",
      "lecturesPerWeek": 3
    }
  ],
  "days": ["Monday", "Tuesday", "Wednesday"],
  "slots": ["9:00AM-10:00AM", "10:00AM-11:00AM"]
}
```

Response:

```json
{
  "message": "Timetable generated",
  "timetable": [
    {
      "subject": "Math",
      "faculty": "Dr. A",
      "room": "R1",
      "day": "Monday",
      "slot": "9:00AM-10:00AM"
    }
  ]
}
```

### `POST /api/timetable/save`

Request:

```json
{
  "title": "Semester 1",
  "description": "Generated AI Schedule",
  "entries": [],
  "settings": {}
}
```

### `GET /api/timetable`

Returns all saved timetables.

### `GET /api/timetable/:id`

Returns one saved timetable.

### `DELETE /api/timetable/:id`

Deletes one saved timetable.

## AI API

### `POST /generate`

Internal service endpoint used by the backend.

Runs on:

- `http://127.0.0.1:5001/generate`

---

## 10. How to Run the Project

## Prerequisites

- Node.js
- npm
- MongoDB
- Python

## Backend

From `backend/`:

```bash
npm install
npm run dev
```

Expected port:

- `5000`

You also need a `.env` file with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/timetable
JWT_SECRET=your_secret_here
```

Note:

- the current code does not yet use `JWT_SECRET` from `.env` in `authRoutes.js`

## Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Expected port:

- `5173`

## AI Service

From `AI/`:

```bash
python app.py
```

Expected port:

- `5001`

For the full system to work, all three must be running:

- frontend on `5173`
- backend on `5000`
- AI service on `5001`

---

## 11. Important Design Decisions

### 1. Separate AI microservice

The scheduling logic is split into a Python service instead of being implemented inside Node.js.

Why this is useful:

- keeps scheduling logic isolated
- makes it easier to experiment with Python-based algorithms
- lets backend and AI evolve separately

Tradeoff:

- one more service must be started
- failure in the AI service breaks generation

### 2. localStorage for faculty/rooms/settings

This keeps the UI simple and fast.

Tradeoff:

- data is not shared across browsers or users
- data can be lost if the browser storage is cleared

### 3. Save settings snapshot with each timetable

This is a good design choice.

Why:

- older timetables still display correctly even if settings later change

---

## 12. Current Gaps and Risks

These are the most important things a future developer should know.

### Functional gaps

- AI rooms are hardcoded and ignore frontend room management
- timetable display is hardcoded to Monday-Friday
- profile updates are not connected to backend user records
- password change is simulated only
- Google auth is mostly development-only

### Security gaps

- JWT secret is hardcoded in backend auth routes
- protected routes on frontend rely only on token presence
- backend routes are not protected by auth middleware

### Data consistency gaps

- faculty and room data are local to a browser, not stored centrally
- users can save timetables without any ownership relationship
- temporary `Timetable` collection is cleared on every generation

### Algorithm gaps

- no backtracking
- no guarantee of complete assignment
- no advanced conflict handling
- no support for room capacity, faculty preferences, or subject priority

---

## 13. Recommended Improvements

If someone continues this project, these are the most valuable next steps.

### High priority

- move JWT secret to environment variables
- add backend auth middleware
- connect faculty and room management to MongoDB
- make AI use actual room data from frontend/backend
- make timetable display use dynamic working days

### Medium priority

- add ownership so users only see their own timetables
- add edit/update routes for saved timetables
- add better error reporting when AI cannot place all lectures
- validate request payloads on backend

### Advanced improvements

- replace random greedy scheduler with constraint solving or backtracking
- support room capacity and room type constraints
- support faculty availability rules
- support breaks, labs, and multi-slot sessions directly in AI logic

---

## 14. Quick Mental Model for New Developers

If you want to understand this project fast, remember this:

- `frontend/` collects user input and displays results
- `backend/` is the coordinator and database layer
- `AI/` is the scheduler

And this is the single most important request path:

`InputPage -> backend /api/ai/generate -> Flask /generate -> backend saves -> frontend /timetable`

That path explains the core product.

---

## 15. Best Starting Points for Reading the Code

If someone is new to the project, read files in this order:

1. `frontend/src/App.jsx`
2. `frontend/src/pages/Dashboard.jsx`
3. `frontend/src/pages/InputPage.jsx`
4. `frontend/src/pages/TimetablePage.jsx`
5. `backend/server.js`
6. `backend/routes/aiRoutes.js`
7. `backend/controllers/timetableController.js`
8. `backend/models/SavedTimetable.js`
9. `AI/app.py`

That order gives the clearest understanding of the product flow from UI to scheduling to persistence.
