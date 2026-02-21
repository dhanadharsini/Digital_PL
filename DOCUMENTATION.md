# Digital PL - Hostel Management System
## Complete Project Documentation

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [User Roles & Access](#user-roles--access)
6. [Core Features](#core-features)
7. [Email Features](#email-features)
8. [UI Dashboard Features](#ui-dashboard-features)
9. [API Endpoints](#api-endpoints)
10. [Database Schema](#database-schema)

---

## Project Overview

**Digital PL** is a comprehensive Hostel Management System designed to streamline permission letter and outpass management for hostel residents. The system facilitates communication between students, parents, wardens, and administrators through a modern web-based interface.

### Key Objectives:
- Digitize permission letter (PL) request and approval process
- Generate QR-coded outpasses for quick hostel exit/entry tracking
- Automated email notifications for all stakeholders
- Real-time permission and request management
- Comprehensive attendance and delayed student tracking

---

## Features

### 1. Authentication & Security
- **Multi-role login system** (Student, Parent, Warden, Admin)
- **JWT-based authentication** with 30-day token expiry
- **Forgot Password flow** with temporary passwords sent via email
- **Change Password** functionality (with and without current password verification)
- **Role-based access control** for all endpoints

### 2. Permission Letter Management
- **Students** can request permission letters with:
  - Place and reason of visit
  - Departure and arrival date/time
- **Parents** approve/reject requests via email and dashboard
- **Wardens** review and approve final requests
- **QR Code generation** for each approved permission letter
- **PDF download** capability for approved PLs
- **Status tracking**: Pending → Parent Approved → Warden Approved → Expired

### 3. Outpass Management
- **4-hour validity** outpasses for short trips
- **QR Code generation** embedded in each outpass
- **Exit & Entry logging** via QR code scanning
- **Automatic delay detection** and recording
- **PDF download** support for outpass history

### 4. Email Notifications
- **Permission Letter Requests** sent to parents
- **Approval Notifications** for students and parents
- **Outpass Confirmations** and status updates
- **Delayed Student Alerts** for wardens
- **Password Reset Emails** with temporary password
- **HTML-formatted emails** with professional branding

### 5. Warden Features
- **QR Code scanning** for entry/exit tracking
- **Delayed student monitoring** with automatic alerts
- **Permission letter approval** with QR generation
- **Student list management** by hostel
- **Vacation status tracking** for students
- **Attendance marking** capabilities

### 6. Admin Features
- **User management** (Add/Edit/Delete students, parents, wardens)
- **System configuration** and monitoring
- **Report generation** capabilities
- **Bulk operations** support

### 7. Automated Scheduler
- **Hourly PL expiry check** automatic update
- **Delayed student detection** background process
- **Automatic status updates** without manual intervention

---

## Technology Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling and responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **nodemailer** - Email service
- **node-cron** - Job scheduling

### Development Tools
- **ESLint** - Code linting
- **dotenv** - Environment configuration

---

## System Architecture

### Client-Server Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌──────────────┬───────────────┬─────────────┬────────────┐ │
│  │   Student    │   Parent      │   Warden    │   Admin    │ │
│  │  Dashboard   │   Dashboard   │ Dashboard   │ Dashboard  │ │
│  └──────────────┴───────────────┴─────────────┴────────────┘ │
│                    (Port: 3000)                               │
└──────────────────────────────────────┬──────────────────────┘
                                       │ HTTPS/REST API
                    ┌──────────────────┴──────────────────┐
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Routes                                │ │
│  │  • /api/auth (Login, Forgot Password)                 │ │
│  │  • /api/student (Request PL, Outpass)                 │ │
│  │  • /api/parent (Approve Requests)                     │ │
│  │  • /api/warden (QR Scanning, Approval)                │ │
│  │  • /api/admin (User Management)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                    (Port: 5000)                              │
└──────────────────────────────────────┬──────────────────────┘
                                       │ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Database                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Collections:                                          │   │
│  │ • Users (Admin)         • Students                    │   │
│  │ • Parents              • Wardens                      │   │
│  │ • PermissionLetters    • EntryExitLogs               │   │
│  │ • Outpasses            • Attendance                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Roles & Access

### 1. Student
- **Dashboard**: View stats and quick actions
- **Request PL**: Create new permission letter requests
- **Request Outpass**: Generate 4-hour outpasses with QR
- **PL History**: View all permission letter requests and status
- **Outpass History**: View and manage outpass records
- **Profile**: View and edit personal information
- **Change Password**: Update password anytime

### 2. Parent
- **Dashboard**: View stats on pending/approved/rejected requests
- **PL Requests**: View and approve/reject student requests
- **Request History**: Track all previous requests
- **Email Notifications**: Automatic updates on child's requests
- **Change Password**: Update password anytime

### 3. Warden
- **Dashboard**: Overview of hostel activities
- **QR Scanner**: Scan QR codes for entry/exit logging
- **Pending Requests**: Approve/reject permission letter requests
- **Delayed Students**: Monitor students exceeding arrival time
- **Students List**: View all students in assigned hostel
- **Attendance**: Mark daily attendance
- **Change Password**: Update password anytime

### 4. Admin
- **Dashboard**: System overview and statistics
- **Add Student**: Create new student accounts
- **Add Parent**: Create parent accounts
- **Add Warden**: Create warden accounts
- **User Lists**: View and manage all users
- **System Settings**: Configure system parameters
- **Change Password**: Update password anytime

---

## Core Features

### 1. Permission Letter (PL) Flow

#### Step 1: Student Creates Request
- Fill form with:
  - Place and reason of visit
  - Departure and arrival date/time
  - Auto-filled: Name, Room, Hostel, Year, Department, RegNo
- Submit request

#### Step 2: Parent Receives Email
- Email notification with request details
- Approve/Reject via dashboard
- Status: **PARENT APPROVED** or **REJECTED**

#### Step 3: Warden Reviews
- View pending requests on dashboard
- Approve request (generates QR code)
- Status: **APPROVED**

#### Step 4: Student Uses PL
- Download approved PL as PDF
- View QR code before exit
- Share QR with warden for scanning

#### Step 5: Exit/Entry Logging
- **Exit**: Warden scans QR → Records exit time
- **Entry**: Warden scans QR → Records entry time
- **Status**: **EXPIRED** after entry logged

### 2. Outpass (4-Hour Pass) Flow

#### Step 1: Student Creates Outpass
- Enter place of visit
- Auto-generated QR code created
- Valid for 4 hours from exit time

#### Step 2: Show to Warden
- **At Exit**: Warden scans QR, records exit time
- **At Entry**: Warden scans QR within 4 hours, records entry time
- If delayed: System records delay duration in minutes

#### Step 3: Automatic Completion
- Once entry logged → Outpass marked complete
- Student marked as "In Hostel"
- Notification sent to student if delayed

### 3. QR Code Technology

**Features:**
- Embedded student and outpass/PL information
- Contains:
  - Student name and registration number
  - Type (Outpass/Permission Letter)
  - Departure and arrival times
  - Exit and entry timestamps
- Scannable multiple times for exit and entry

**Generation:**
- Automatic QR generation for approved PLs
- Automatic QR generation for outpass requests
- High-resolution, printable QR codes

### 4. Delayed Student Tracking

**Automatic Detection:**
- Student exceeds arrival time
- System checks exit log vs arrival time
- Calculates delay in minutes

**Warden Notifications:**
- Real-time alert on "Delayed Students" page
- Sort by delay duration (most delayed first)
- Student details and delay information

**Management:**
- Warden can mark entry manually if needed
- System auto-updates on QR scan

---

## Email Features

### 1. Email Configuration
- **Service**: Nodemailer
- **Provider**: Gmail SMTP (configurable)
- **Format**: HTML-formatted emails
- **Automatic Sending**: Triggered by system events

### 2. Email Templates

#### Permission Letter Request Email
```
TO: Parent
SUBJECT: Permission Letter Request from Your Child

CONTAINS:
- Student name
- Place of visit
- Reason for visit
- Departure date/time
- Arrival date/time
- Approval/Rejection buttons
- Action deadline
```

#### Permission Letter Approval Email
```
TO: Student
SUBJECT: Your Permission Letter Has Been Approved

CONTAINS:
- PL approval confirmation
- Full details of approved request
- Link to download PL card
- QR code information
- Instructions for exit/entry
```

#### Password Reset Email
```
TO: User
SUBJECT: Password Reset - Hostel Management System

CONTAINS:
- Temporary password (12-character alphanumeric)
- Login instructions
- Security warning
- 24-hour expiry notice
- Link to login page
```

#### Outpass Confirmation Email
```
TO: Student
SUBJECT: Outpass Created Successfully

CONTAINS:
- Outpass confirmation
- 4-hour validity period
- QR code details
- Exit/entry instructions
- Emergency contact info
```

#### Delayed Student Alert Email
```
TO: Warden
SUBJECT: Student Delayed - PL Expiry Alert

CONTAINS:
- Student name and room number
- Expected arrival time
- Current delay duration
- Action required message
```

### 3. Email Delivery Assurance
- Non-blocking email sending (doesn't fail main request)
- Retry logic for failed attempts
- Error logging for debugging
- HTML and plain-text fallback

---

## UI Dashboard Features

### 1. Login Page
**Design**: Professional Navy Blue Theme
- Split-screen layout (Branding left, Login right)
- 4-role selector tabs with color coding
- Email and password fields with SVG icons
- Password visibility toggle
- "Remember Me" checkbox
- "Forgot Password?" link
- Beautiful animated background
- Responsive mobile design
- Professional button styling

### 2. Student Dashboard

**Dashboard Page:**
- Welcome message with student name
- Quick action buttons:
  - Request Permission Letter
  - Request Outpass (4hrs)
  - View PL History
  - View Outpass History
- Responsive card layout
- Mobile-friendly navigation

**Request Permission Letter Page:**
- Pre-filled fields (Name, Room, Hostel, Year, Department, RegNo)
- Input fields:
  - Place of Visit
  - Reason for Visit
  - Departure Date/Time
  - Arrival Date/Time
- Success/Error message display
- Form validation
- Submit button with loading state

**Request Outpass Page:**
- Place of visit input
- Important information box:
  - 4-hour validity
  - QR code generation info
  - Warden scanning instructions
  - Late return consequences
- Generate button with loading state
- Success confirmation

**PL History Page:**
- Data table with columns:
  - Place of Visit
  - Reason for Visit
  - Departure Date/Time
  - Arrival Date/Time
  - Status (color-coded badges)
- Action buttons:
  - View PL Card (if approved)
  - Download PDF (if approved)
  - Delete (if pending)
- Status guide explaining all statuses
- Empty state message
- Responsive table design

**PL Card Page:**
- Full permission letter details
- Student information display
- Visit details display
- QR code image (large)
- Download PDF button
- Security warning about QR code usage
- Professional card layout
- Loading and error states

**Outpass History Page:**
- List of all outpass records
- For each outpass:
  - Place of visit
  - Status (Active/Completed)
  - Exit time (if logged)
  - Entry time (if logged)
  - Delay duration (if applicable)
- Action buttons:
  - View QR Code
  - Download PDF
- Responsive list layout

### 3. Parent Dashboard

**Dashboard Page:**
- Welcome message with parent name
- Stats cards showing:
  - Pending Requests count
  - Approved by You count
  - Rejected by You count
- Quick action buttons:
  - View Pending Requests
  - View Request History
- Professional layout

**PL Requests Page:**
- List of pending permission letter requests
- For each request:
  - Student name
  - Place of visit
  - Departure and arrival times
  - Approve button (green)
  - Reject button (red)
- Real-time update after approval/rejection
- Empty state when no pending requests
- Mobile-friendly design

**Request History Page:**
- Historical view of all requests
- Filter options (pending, approved, rejected)
- Details for each request
- Status indicators
- Date tracking
- Print-friendly layout

### 4. Warden Dashboard

**Dashboard Page:**
- Hostel name display
- Stats overview:
  - Total students in hostel
  - Students on vacation
  - Pending approvals
  - Delayed students
- Quick access buttons:
  - QR Scanner
  - Pending Requests
  - Delayed Students
  - Students List

**QR Scanner Page:**
- Camera/QR input interface
- Real-time scanning capability
- Scan results display:
  - Student name
  - Registration number
  - Action performed (Exit/Entry)
  - Timestamp
  - Delay information (if applicable)
- Success confirmation message
- Error handling for invalid QR codes
- Responsive design for mobile scanning

**Pending Requests Page:**
- Table of pending permission letters
- Columns:
  - Student name
  - Place and reason
  - Departure/Arrival times
  - Approve button
  - Reject button
- Approval triggers QR generation
- Real-time list updates
- Mobile-friendly display

**Delayed Students Page:**
- List of students exceeding arrival time
- For each student:
  - Name and room number
  - Place of visit
  - Expected arrival vs actual delay
  - Delay duration in minutes
  - Student status indicator
- Sorted by delay duration (highest first)
- Mark entry action button
- Professional alert styling
- Mobile-friendly layout

**Students List Page:**
- All students in assigned hostel
- Student details:
  - Name, room number, hostel
  - Department, year of study
  - Registration number
  - On vacation status
- Search/filter functionality
- Contact information display
- Responsive grid layout

### 5. Admin Dashboard

**Dashboard Page:**
- System overview statistics
- User count cards:
  - Total students
  - Total parents
  - Total wardens
  - Total admins
- Recent activities
- System health indicators
- Quick action buttons

**Add Student Page:**
- Form fields:
  - Name, email, password
  - Room number, hostel name
  - Department, year of study
  - Registration number
- Input validation
- Success/error notifications
- Auto-generated password option

**Add Parent Page:**
- Form fields:
  - Name, email, password
  - Student registration number (linking)
- Parent linking to student
- Validation and error handling
- Confirmation messages

**Add Warden Page:**
- Form fields:
  - Name, email, password
  - Assigned hostel name
- Hostel assignment
- Input validation
- Success notifications

**User Lists Page:**
- Separate tabs for each user type
- User data tables:
  - Name, email
  - Contact information
  - Status indicator
- Action buttons:
  - Edit user
  - Delete user
  - Reset password
- Search functionality
- Responsive design

### 6. Common UI Components

**Navbar:**
- User name display
- Logout button
- Page title
- Dark theme styling
- Mobile responsive

**Sidebar:**
- Role-based menu items
- Navigation links
- Hamburger menu for mobile
- Smooth animations
- Overlay for mobile

**Status Badges:**
- Color-coded statuses:
  - Pending: Yellow
  - Parent Approved: Blue
  - Approved: Green
  - Rejected: Red
  - Expired: Gray
- Professional styling
- Uppercase text

**Form Elements:**
- Input fields with icons
- Date/time pickers
- Text areas for reasons
- Validation error messages
- Success confirmations
- Loading states on buttons

**Responsive Design:**
- Mobile-first approach
- Tablet-friendly layouts
- Desktop optimization
- Touch-friendly buttons
- Adaptive navigation

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login for all roles |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with token |
| POST | `/change-password` | Change password (authenticated) |

### Student Routes (`/api/student`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get student statistics |
| GET | `/details` | Get student profile |
| POST | `/request-pl` | Submit permission letter request |
| GET | `/pl-requests` | Get all PL requests |
| GET | `/pl-card/:id` | Get approved PL card |
| POST | `/request-outpass` | Create outpass |
| GET | `/outpass-history` | Get outpass records |
| GET | `/active-outpass` | Get current active outpass |

### Parent Routes (`/api/parent`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get parent statistics |
| GET | `/pl-requests` | Get pending PL requests |
| POST | `/approve/:id` | Approve permission letter |
| POST | `/reject/:id` | Reject permission letter |
| GET | `/request-history` | Get request history |

### Warden Routes (`/api/warden`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pending-requests` | Get pending approvals |
| POST | `/approve/:id` | Approve PL request |
| POST | `/reject/:id` | Reject PL request |
| POST | `/log-action` | Log exit/entry via QR |
| GET | `/students` | Get hostel students |
| GET | `/delayed-students` | Get delayed vacation students |
| POST | `/mark-attendance` | Mark attendance |
| GET | `/attendance/:date` | Get attendance record |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add-student` | Create new student |
| POST | `/add-parent` | Create new parent |
| POST | `/add-warden` | Create new warden |
| GET | `/students` | List all students |
| GET | `/parents` | List all parents |
| GET | `/wardens` | List all wardens |
| PUT | `/users/:id` | Update user details |
| DELETE | `/users/:id` | Delete user account |

---

## Database Schema

### User Collection
```json
{
  "_id": "ObjectId",
  "email": "String (unique, lowercase)",
  "password": "String (hashed)",
  "role": "String (admin/student/parent/warden)",
  "resetToken": "String",
  "resetTokenExpiry": "Date",
  "timestamps": true
}
```

### Student Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique, lowercase)",
  "password": "String (hashed)",
  "regNo": "String (unique)",
  "roomNo": "String",
  "hostelName": "String",
  "department": "String",
  "yearOfStudy": "Number",
  "isOnVacation": "Boolean",
  "resetToken": "String",
  "resetTokenExpiry": "Date",
  "timestamps": true
}
```

### Parent Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique, lowercase)",
  "password": "String (hashed)",
  "studentRegNo": "String (foreign key)",
  "resetToken": "String",
  "resetTokenExpiry": "Date",
  "timestamps": true
}
```

### Warden Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique, lowercase)",
  "password": "String (hashed)",
  "hostelName": "String",
  "resetToken": "String",
  "resetTokenExpiry": "Date",
  "timestamps": true
}
```

### PermissionLetter Collection
```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId (foreign key)",
  "regNo": "String",
  "name": "String",
  "email": "String",
  "roomNo": "String",
  "hostelName": "String",
  "department": "String",
  "yearOfStudy": "Number",
  "placeOfVisit": "String",
  "reasonOfVisit": "String",
  "departureDateTime": "Date",
  "arrivalDateTime": "Date",
  "status": "String (pending/parent-approved/approved/rejected/expired)",
  "wardenStatus": "String",
  "qrCode": "String (base64 encoded)",
  "approvedAt": "Date",
  "isFullyUsed": "Boolean",
  "usedAt": "Date",
  "timestamps": true
}
```

### EntryExitLog Collection
```json
{
  "_id": "ObjectId",
  "permissionLetterId": "ObjectId (foreign key)",
  "studentId": "ObjectId (foreign key)",
  "exitTime": "Date",
  "entryTime": "Date",
  "timestamps": true
}
```

### Outpass Collection
```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId (foreign key)",
  "name": "String",
  "regNo": "String",
  "department": "String",
  "yearOfStudy": "Number",
  "roomNo": "String",
  "hostelName": "String",
  "placeOfVisit": "String",
  "qrCode": "String (base64 encoded)",
  "status": "String (active/completed)",
  "exitTime": "Date",
  "actualReturnTime": "Date",
  "expectedReturnTime": "Date",
  "timestamps": true
}
```

---

## Security Features

1. **Password Security**
   - bcryptjs hashing (10 salt rounds)
   - Minimum 6 characters
   - Temporary passwords for reset flow

2. **JWT Authentication**
   - 30-day token expiry
   - Role-based claims
   - Token validation on protected routes

3. **CORS Security**
   - Origin verification
   - Credentials allowed
   - Configurable allowed origins

4. **Data Validation**
   - Input sanitization
   - Email format validation
   - Date/time validation
   - Required field checks

5. **Access Control**
   - Route protection middleware
   - Role-based authorization
   - User ownership verification

---

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with backend URL
npm run dev
```

### Environment Variables
**Backend (.env):**
```
MONGODB_URI=mongodb://...
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

---

## Future Enhancements

1. **Mobile App** - React Native application
2. **Push Notifications** - Real-time alerts
3. **Analytics Dashboard** - Admin insights
4. **Biometric Exit/Entry** - Enhanced security
5. **File Upload** - Document attachments
6. **Multi-language Support** - Internationalization
7. **SMS Notifications** - Additional alerting
8. **Integration APIs** - Third-party systems

---

## Support & Contact

For technical support or feature requests, contact the development team.

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready

---

*This documentation is subject to updates as the system evolves.*
