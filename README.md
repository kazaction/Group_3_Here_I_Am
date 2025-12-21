# Here I Am - Personal Assistant Web Application

A full-stack web application for managing events, generating CVs, and organizing files with automated email notifications.

## 📋 Overview

**Here I Am** functions as a web-based application designed for personal productivity and organization. The system integrates event management (for creating and scheduling events with reminders), file upload functionality (for storing and accessing user files), and email services (for sending notifications and confirmations). These features are implemented through a RESTful Flask API backend connected to a SQLite database, with email notifications handled via SMTP. The application provides users with a centralized platform for managing their calendar, generating CVs, uploading files, and receiving automated email reminders, all accessible through an intuitive React-based web interface with secure user authentication.

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) with SQLite extension

### 1. Clone the Repository

```bash
git clone https://github.com/kazaction/Group_3_Here_I_Am.git
cd Group_3_Here_I_Am
```

### 2. Backend Setup

#### Navigate to backend directory:
```bash
cd here_i_am/backend
```

#### Create Virtual Environment

**For Windows:**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

**For macOS/Linux:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

> **Note:** You should see `(venv)` at the beginning of your command prompt when the virtual environment is activated.

#### Install Python Dependencies

With the virtual environment activated, install all required packages:

```bash
pip install -r requirements.txt
```

This will install:
- Flask 3.1.2 (Web framework)
- Flask-CORS 6.0.1 (Cross-origin resource sharing)
- yagmail (Email service)
- reportlab (PDF generation for CVs)
- Werkzeug (WSGI utilities)
- And all other dependencies

#### Initialize the Database

```bash
cd db
python init_db.py
cd ..
```

This creates the `database.db` file with the necessary tables and a test user account.

### 3. Frontend Setup

Open a **new terminal** window and navigate to the frontend directory:

```bash
cd here_i_am
```

#### Install Node.js Dependencies

```bash
npm install
```

This will install:
- React and React DOM
- React Router DOM
- Axios
- React Icons
- And all other frontend dependencies

### 4. Running the Application

You need **two separate terminal windows** running simultaneously:

#### Terminal 1 - Backend Server

```bash
cd here_i_am/backend

# Activate virtual environment first
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run the Flask server
python app.py
```

The backend server will start on **http://localhost:3001**

#### Terminal 2 - Frontend Development Server

```bash
cd here_i_am

# Start React development server
npm start
```

The application will automatically open in your browser at **http://localhost:3000**

### 5. Test Login Credentials

Use these credentials to test the application:

- **Username:** `TR_Meowth`
- **Email:** `meowth@teamrocket.com`
- **Password:** `JessieJamesMeowth`

> You can find these credentials in `backend/db/init_db.py`

## 📦 Project Structure

```
Group_3_Here_I_Am/
├── README.md
├── NOTES.txt
└── here_i_am/
    ├── package.json              # Frontend dependencies
    ├── public/                   # Static assets
    ├── src/                      # React source code
    │   ├── components/          # React components
    │   ├── css/                 # Component styles
    │   ├── App.js               # Main app component
    │   └── index.js             # Entry point
    └── backend/
        ├── requirements.txt      # Python dependencies
        ├── app.py               # Main Flask application
        ├── cv_routes.py         # CV generation routes
        ├── cvprogram.py         # CV validation logic
        ├── email_services.py    # Email notification services
        ├── upload_services.py   # File upload handling
        ├── db/
        │   ├── init_db.py       # Database initialization
        │   ├── events_db.py     # Event operations
        │   └── file_upload_db.py # File operations
        ├── Pictures/            # Profile pictures storage
        └── uploads/             # Uploaded files storage
```

## 🛠️ Technologies Used

### Frontend
- React 19.2.0
- React Router DOM 7.9.5
- Axios 1.13.2
- React Icons / React Feather

### Backend
- Flask 3.1.2
- Flask-CORS 6.0.1
- Yagmail (SMTP email)
- ReportLab (PDF generation)
- SQLite3 (Database)

## 📝 Features

- ✅ User authentication (login, register, password reset)
- ✅ Event management with calendar view
- ✅ Email notifications and reminders
- ✅ CV generation with PDF export
- ✅ File upload and management
- ✅ User profile management
- ✅ Profile picture upload

## 🔧 Troubleshooting

### Virtual Environment Issues

**If activation fails on Windows:**
```bash
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy RemoteSigned
```

**If you can't find python command:**
- Windows: Use `python` or `py`
- macOS/Linux: Use `python3`

### Port Already in Use

If port 3000 or 3001 is already in use:
- Stop other applications using these ports
- Or modify the port in the respective configuration files

### Database Errors

If you encounter database errors:
```bash
# Delete the existing database and reinitialize
cd backend/db
rm database.db  # or delete manually
python init_db.py
```

## 👥 Development Team

Team 3 - Group_3_Here_I_Am

## 📄 License

Educational project for academic purposes.