<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/activity.svg" alt="FollowFlow Logo" width="120" />
  <h1>FollowFlow CRM</h1>
  <p><strong>A Modern, High-Performance Customer Relationship Management Platform</strong></p>

  <p>
    <a href="https://follow-flow.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/Live_Deployment-Vercel-000000?style=for-the-badge&logo=vercel" alt="Live Deployment" />
    </a>
    <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render Backend" />
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
    <img src="https://img.shields.io/badge/DRF-A30000?style=for-the-badge&logo=django&logoColor=white" alt="DRF" />
  </p>
</div>

<br />

## 📖 Overview

**FollowFlow** is a comprehensive, full-stack Customer Relationship Management (CRM) application designed to streamline customer interactions, task tracking, and business operational workflows. Architected with modern web technologies and scalable infrastructure, this application delivers a seamless and highly responsive user experience. 

Built to solve the complexity of managing client lifecycles and business tracking, FollowFlow acts as a centralized dashboard offering robust data handling, rich visual analytics, and intuitive interface design.

**🌐 Live Application:** [https://follow-flow.vercel.app/](https://follow-flow.vercel.app/)

---

## 🎯 Problems Solved & Key Features

As a Senior Full-Stack Engineer, I approached this project to address several core enterprise challenges:

### 1. Unified Customer & Task Management
* **The Problem:** Businesses often fragment customer data and actionable tasks across multiple disjointed tools (spreadsheets, emails, task trackers).
* **The Solution:** FollowFlow provides a single source of truth. Users can manage customer profiles and link them directly to tasks, deadlines, and timelines—all visible from a centralized, high-performance **Dashboard**.

### 2. High-Fidelity User Experience & Responsiveness
* **The Problem:** Traditional CRMs can feel clunky, slow, and non-intuitive, leading to poor user adoption.
* **The Solution:** Built a highly polished, interactive UI using **React, Tailwind CSS, and Framer Motion**. The app incorporates micro-interactions, responsive fluid layouts, and an accessible design system following the 60/30/10 design principle to guarantee a premium "SaaS" feel.

### 3. Secure & Scalable Authentication
* **The Problem:** Managing sessions securely across a decoupled architecture (Frontend/Backend) is prone to vulnerabilities.
* **The Solution:** Implemented robust security standards using **Django Rest Framework (DRF)** and **SimpleJWT** for stateless JWT (JSON Web Token) based authentication. Enforced private routing and context-based state management on the client side.

### 4. Seamless Full-Stack Deployment Strategy
* **The Problem:** Ensuring zero-downtime deployments with proper environment variable management across separate infrastructures.
* **The Solution:** Successfully engineered a CI/CD pipeline and deployment strategy:
  * **Frontend:** Deployed on **Vercel** for global CDN delivery, fast edge routing, and instant cache invalidation.
  * **Backend:** Deployed on **Render** utilizing Gunicorn, effectively handling WSGI requests and abstracting scaling complexity.

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
* **Core:** React 19, TypeScript (TSX)
* **Build Tool:** Vite (Optimized for lightning-fast HMR and bundling)
* **Styling:** Tailwind CSS, PostCSS (Utility-first CSS framework for rapid UI development)
* **Animations:** Framer Motion
* **Routing:** React Router v6
* **State Management/API:** Axios, React Context API
* **Icons:** Lucide React

### Backend (Server-Side & API)
* **Framework:** Django 6.x, Python
* **API Architecture:** Django Rest Framework (DRF)
* **Authentication:** djangorestframework-simplejwt (JWT)
* **CORS Management:** django-cors-headers
* **Web Server:** Gunicorn

---

## 📂 System Architecture & Modules

* **Dashboard (`/`):** A high-level overview featuring aggregate statistics, recent customer activity, and upcoming priority tasks.
* **Customers (`/customers`):** Full CRUD capabilities for client management.
* **Tasks (`/tasks`):** Kanban or list-style task tracking linked to specific customers.
* **Timeline (`/timeline`):** An interactive visual representation of business events and milestones.
* **Notifications (`/notifications`):** Real-time alerting system for system and user-generated events.
* **Profile & Settings (`/profile`):** User preference management, including theming.
* **Authentication (`/login`, `/register`):** Secure entry points utilizing a modern "ghost-button" UI and stateful validations.

---

## 🚀 Getting Started (Local Development)

To run the FollowFlow platform locally, you need both the Django backend and the React frontend running concurrently.

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* PostgreSQL / SQLite (Default)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies (using npm, yarn, or pnpm)
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy/connect to the backend API at `http://localhost:8000`.

---

## 💡 Engineering Mindset & Best Practices Applied

* **Clean Code & Componentization:** The frontend is strictly divided into logical components (`/pages`, `/components`, `/context`, `/api`), ensuring DRY principles and high maintainability.
* **Strict Typing & Linting:** Enforced rigorous ESLint rules and TypeScript definitions to catch bugs at compile-time rather than runtime.
* **Environment Configuration:** Secure handling of secrets and API URLs using `.env` files and deployment environment variables.
* **Responsive First:** The entire application is designed to be fully fluid, supporting mobile, tablet, and ultra-wide desktop displays natively.

---

<div align="center">
  <p><i>Developed with passion for modern web architecture and seamless user experiences.</i></p>
</div>
