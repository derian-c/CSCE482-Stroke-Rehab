# CSCE482-Stroke-Rehab
This project consists of a Flask backend and a React frontend (built with Vite). The following instructions will help you install the necessary dependencies and run the app on Windows, macOS, or Linux.

---

## Prerequisites

- **Python 3.10 or higher**
- **Node.js v22.13.1 and npm**

---

## Installing Dependencies

### Backend

1. **Open a terminal and navigate to the `backend` directory:**

   ```bash
   cd backend
   ```
2. **Create and activate a virtual environment:**

On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```
On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```
3. **Install the Python dependencies:**

```bash
pip install -r requirements.txt
```

### Frontend
1. **Open a new terminal (or a new tab) and navigate to the frontend directory:**

```bash
cd ../frontend
```

2. **Install the Node dependencies:**

```bash
npm install
```

---

## Running the App
### Start the Flask Backend
**Ensure you are in the backend directory with the virtual environment activated.**

- **Run the Flask server:**

```bash
python app.py
```
The Flask server will start (by default on http://localhost:5000).

### Start the Vite React Frontend
In a separate terminal, navigate to the frontend directory (if not already there).

- **Run the Vite development server:**

```bash
npm run dev
```
The frontend will start (usually on http://localhost:5173). Vite is configured to proxy API requests (paths starting with /api) to the Flask backend.

---

## Quick Reference
### Backend directory: backend/

- Virtual environment commands (macOS/Linux):
```bash
python3 -m venv venv
source venv/bin/activate
```
- Virtual environment commands (Windows):
```bash
python -m venv venv
venv\Scripts\activate
```

- Run Flask:

```bash
python app.py
```

## Frontend directory: frontend/

- Install Node dependencies:
```bash
npm install
```

- Run Vite Server:
```bash
npm run dev
```
---

## Troubleshooting
### Proxy Issues in Vite:
Double-check your vite.config.js if API calls are not being forwarded as expected.

### Stopping the Servers:
Press Ctrl+C in the terminal where the server is running to stop it.
