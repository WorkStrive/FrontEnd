# 🎨 WorkStrive Frontend

WorkStrive Frontend is a modern, responsive React application built with Vite. It provides an intuitive interface for managing projects, tracking task progress, and interacting with AI-powered task suggestions.

---

## ✨ Features

- **⚡ Modern Tech Stack**:
  - React 18+ for a reactive UI.
  - Vite for lightning-fast development and optimized builds.
- **🔐 Secure Authentication**:
  - Persistent JWT-based session management.
  - Automatic redirect to login on session expiry.
- **📊 Interactive Dashboard**:
  - Real-time overview of active projects.
  - Progress metrics (completion percentage, task counts).
- **📝 Comprehensive Task management**:
  - Detailed project views with task breakdowns.
  - Intuitive status tracking.
- **🤖 AI Task Integration**:
  - Seamless interface to view and accept AI-powered task suggestions.
- **📱 Responsive Design**:
  - Clean, professional UI that works across devices.

---

## 🛠️ Installation

### Prerequisites

- Node.js (v18+)
- Backend server running (default: `http://localhost:3000`)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/WorkStrive/FrontEnd.git
   cd FrontEnd
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Development**:
   Start the development server:
   ```bash
   npm run dev
   ```

---

## 🚀 Scripts

- `npm install`: Install project dependencies.
- `npm run dev`: Start the local development server with HMR.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint to ensure code quality.
- `npm run preview`: Locally preview the production build.

---

## 🔌 API Integration

The frontend communicates with the WorkStrive Backend via Axios.

- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: JWT tokens are stored in `localStorage` and sent in the `Authorization` header for all requests.

---

## 🤝 Git Workflow & Collaboration

1. **Feature Branches**: Use `feature/ui-update` naming convention.
2. **Component Reuse**: Check `src/components` before creating new UI elements.
3. **API Alignment**: Ensure any changes to the backend API are reflected in `src/api/client.js`.
4. **Linting**: Run `npm run lint` before committing your changes.

---

## 📝 Contribution Guide

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingUI`).
3. Commit your changes (`git commit -m 'Add some AmazingUI'`).
4. Push to the branch (`git push origin feature/AmazingUI`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License.
