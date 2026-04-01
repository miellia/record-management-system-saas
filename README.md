# New Era Record Management System

A professional, full-stack internal record management system built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS. This system allows administrators to manage property survey records efficiently with CRUD operations, advanced search, and PDF report generation.

## 🌟 Features

- **Secure Admin Authentication**: Protected dashboard accessible only to authorized administrators via MongoDB-backed login.
- **Comprehensive Record Management**: Full CRUD (Create, Read, Update) capabilities for detailed property survey records.
- **Advanced Global Search**: Instantly filter records across all 20+ fields including nested properties like checkbox values.
- **PDF Export via `react-to-pdf`**: Generate clean, professional, and well-structured PDF reports for any specific record directly from the browser.
- **Modern UI/UX**: High-end aesthetic featuring glassmorphism elements, custom scrollbars, cohesive color palettes, responsive modal forms, and hover micro-interactions.
- **Pagination**: Efficiently browse records with built-in pagination on the dashboard.

## 🛠️ Technology Stack

- **Frontend**: 
  - React (managed via Vite)
  - Tailwind CSS v3 (for utility-first styling)
  - React Router DOM (for secure routing logic)
  - Axios (for API requests)
  - React Icons (for modern UI iconography)
  - Date-fns (for reliable date formatting)
  - React-to-pdf (for generating on-the-fly PDF reports)

- **Backend**:
  - Node.js & Express.js (RESTful API architecture)
  - MongoDB Atlas & Mongoose (NoSQL Database and ODM)
  - CORS & Dotenv (environment configuration and cross-origin resource sharing)

## 📁 Project Structure

```text
internal-system/
├── client/                 # Frontend React application (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (RecordForm, PDFExport)
│   │   ├── pages/          # Full page views (Login, Dashboard)
│   │   ├── App.jsx         # Main application component & routing
│   │   ├── index.css       # Global styles and Tailwind directives
│   │   └── main.jsx        # App entry point
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── package.json        
└── server/                 # Backend Express application
    ├── controllers/        # Request handlers (recordController)
    ├── models/             # Mongoose schemas (adminModel, recordModel)
    ├── routes/             # Express API routes (authRoutes, recordRoutes)
    ├── server.js           # Server initialization and DB connection
    └── package.json        
```

## 🚀 Getting Started

Ensure you have Node.js and npm installed on your local machine. 

### 1. Database Setup

The backend connects to a MongoDB Atlas cluster. A connection URI should be provided in a `.env` file in the `server` directory (or it will fall back to the default URI provided in `server.js`).

### 2. Backend Installation & Startup

Open a terminal and execute the following:

```bash
cd server
npm install
node server.js
```
*The server runs on port `5000` by default. Upon starting, it will automatically seed the initial admin accounts into the database.*

### 3. Frontend Installation & Startup

Open a new terminal and execute the following:

```bash
cd client
npm install
npm run dev
```
*The React app runs on port `5173`. Open `http://localhost:5173` in your browser.*

### 4. Admin Credentials



## 📋 Data Schema

The `Record` model uses a flexible schema where all fields are optional, enabling the system to gracefully handle incomplete records.
Fields include:
- `serialNumber`, `requestDate`, `referenceNumber`
- `requestReceivedBy` (Email, Phone, WhatsApp, Other)
- **Requester details**: `name`, `position`, `landline`, `mobile`, `email`, `address`, `requestingAgency`, `branchOffice`
- **Property & Survey details**: `titleCustomer`, `propertyDetails`, `propertyOwner`, `contactPerson`, `contactNumber`, `surveyorName`, `dateOfSurvey`, `dateOfReport`
- **Report & Dispatch details**: `reportStatus`, `dispatchedOn` (WhatsApp, Email, Courier)
- **Financial details**: `fsv`, `market`, `invoiceAmount`, `paid`, `date`

## 🤝 Contribution Guidelines

This project was built for the specific needs of an internal evaluation flow. To contribute, submit pull requests modifying the models and React view components keeping the Tailwind standard in mind. Ensure you do not remove the base `index.css` global styles (custom scrollbars, background).

---
*Developed for New Era Record Systems.*
