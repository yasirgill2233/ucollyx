# Ucollyx FYP - Installation & Setup Guide

Welcome to the official installation guide for **Ucollyx**, Final Year Project (FYP)! Follow the steps below carefully to set up, configure, and run the project successfully on your local machine.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:
*   [Node.js](https://nodejs.org/) (v16.x or higher recommended)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)
*   Database (MySQL)
*   Docker

---

## Step 1: Clone the Repository

Open your terminal or command prompt and clone the Ucollyx repository:

```bash
cd ucollyx-main
```

*(Note: Replace the URL with your actual repository link if necessary.)*

---

## Step 2: Environment Variables Setup

You need to configure your environment variables before running the application.

1. Locate the `.env.example` file in the root directory (or backend folder).
2. Create a copy of it and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file in your favorite code editor (like VS Code) and fill in your configuration details:
   *   `PORT=5000` (or your preferred port)
   *   `DATABASE_URL=your_database_connection_string`
   *   `JWT_SECRET=your_jwt_secret_key`

---

## Step 3: Install Dependencies

Depending on project structure (monorepo, or separate client/server folders), install the required dependencies.

### Option A: If it's a monolithic or root-level installation
```bash
npm install
```

### Option B: If frontend and backend are separate
1. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```
2. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

## Step 4: Run the Application

Once all dependencies and environment variables are set up, you can start the project.

### Running Backend Server
Navigate to your backend directory (if separate) and start the server:
```bash
npm run dev
# or 
node server.js
```

### Running Frontend Client
Open a separate terminal window, navigate to the client directory, and start the development server:
```bash
npm start
# or
npm run dev
```

The application should now be running locally at `http://localhost:3000` (frontend) and `http://localhost:5000` (backend API).

---

## Troubleshooting

*   **Port Conflicts:** If a port is already in use, change the port number inside your `.env` file.
*   **Database Connection Error:** Ensure your local database service (MySQL) is actively running and your connection string in `.env` is correct.
*   **Missing Dependencies:** Try deleting the `node_modules` folder and `package-lock.json`, then run `npm install` again.

---

