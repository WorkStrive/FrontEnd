<div align="center">
  <img src="C:/Users/user1/.gemini/antigravity/brain/3f507296-d9aa-4eb8-bd0f-ae5ceb1c40d3/workstrive_hero_mockup_1777319103164.png" width="100%" alt="WorkStrive Hero" />
  
  # 🚀 WorkStrive Frontend
  
  **Empowering Productivity with AI-Driven Project Management**
  
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  [Features](#-key-features) • [Installation](#-getting-started) • [Tech Stack](#-technology-stack) • [Structure](#-project-structure)
</div>

---

## 🌟 Overview

**WorkStrive** is a premium, high-performance project management frontend built for modern teams. It combines a sleek, glassmorphic design with powerful features like AI-powered task suggestions, real-time progress tracking, and collaborative project workspaces.

## ✨ Key Features

- **🤖 AI Task Engine**: Leverage intelligent suggestions to automatically generate relevant tasks for your projects.
- **💎 Premium Aesthetics**: A stunning dark-mode interface with glassmorphism, smooth micro-animations, and a responsive layout.
- **📊 Dynamic Dashboard**: Get a bird's-eye view of all your projects, progress metrics, and upcoming deadlines.
- **🤝 Team Collaboration**: Invite members, assign roles (Admin/Member), and manage your team seamlessly.
- **🔐 Secure Access**: Robust authentication flow with JWT persistence, password recovery, and protected routing.
- **⚡ Lightning Fast**: Built with Vite 8 for instant HMR and optimized production bundles.

## 🛠️ Technology Stack

- **Core**: [React 19](https://reactjs.org/) (Functional Components, Hooks)
- **Styling**: Vanilla CSS with Modern Variables & Glassmorphism
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)

---

## 📁 Project Structure

```text
src/
├── api/             # Axios client and API interceptors
├── assets/          # Static assets (images, svgs)
├── components/      # Reusable UI components (Navbar, Layouts)
├── context/         # React Context for global state management
├── pages/           # Page-level components
│   ├── Dashboard/   # Main project overview
│   ├── Project/     # Detailed task & member management
│   └── Auth/        # Login, Register, Forgot Password
├── App.jsx          # Root component & Routing
└── main.jsx         # Entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend**: Ensure the [WorkStrive Backend](https://github.com/WorkStrive/Backend) is running at `http://localhost:3000`.

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/WorkStrive/FrontEnd.git
   cd FrontEnd
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 🔌 API Configuration

The application expects a RESTful API at `http://localhost:3000/api/v1`. You can modify the base URL in `src/api/client.js`.

| Feature | Endpoint |
| :--- | :--- |
| Auth | `/auth/login`, `/auth/register` |
| Projects | `/projects`, `/projects/:id` |
| Tasks | `/tasks`, `/tasks/projects/:id/tasks` |
| AI | `/projects/:id/suggest-tasks` |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p>Built with ❤️ by the WorkStrive Team</p>
</div>
