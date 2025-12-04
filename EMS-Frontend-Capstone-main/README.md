# 💻 EMS Portal - Frontend

This repository contains the **Frontend** application for the Employee Management System (EMS). Built with **React.js**, it features a modern, high-performance **Dark Mode UI** using **Glassmorphism** design principles.

The application provides two distinct interfaces: one for **HR Administrators** to manage the workforce and analytics, and one for **Employees** to view their profiles and team directory.

---

## 🛠️ Tech Stack & UI Library

* **Framework:** [React.js v18+](https://reactjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom configurations for Glassmorphism & Dark Theme)
* **Routing:** React Router DOM v6
* **Data Visualization:** [Recharts](https://recharts.org/) (For Admin Analytics)
* **Icons:** React Icons (Feather Icons / `fi`)
* **State Management:** React Context API (AuthProvider)
* **HTTP Client:** Axios (with Interceptors for JWT handling)

---

## 🌟 Key Features & User Roles

### 🛡️ 1. Authentication Module
* **Dual Login System:** Separate login pages for **Users** and **Admins** with distinct visual cues.
* **JWT Handling:** Automatic token storage in LocalStorage and attachment to API requests via Axios interceptors.
* **Forgot Password Flow:**
    * Users can request a password reset.
    * **Security Check:** Requires verification via a composite Security Key (`Username` + `Birth Year`).
* **Protected Routes:** Prevents unauthorized access (e.g., Users cannot access `/admin-dashboard`).

### 👨‍💼 2. Admin Dashboard (HR Portal)
* **Workforce Analytics:** A rich visual dashboard powered by `Recharts`.
    * **Real-time Counters:** Total Employees, Average Salary, Highest Salary, Unique Roles.
    * **Charts:**
        * *Bar Chart:* Employees per Designation.
        * *Pie Chart:* Salary Distribution (<50k, 50-100k, >100k).
        * *Area Chart:* Employee Age Groups.
* **Employee Management (CRUD):**
    * **Add Employee:** Form to onboard users with auto-email triggers (handled by backend).
    * **Edit Employee:** Update designation, salary, and personal details.
    * **Delete Employee:** Remove records with confirmation prompts.
* **Credential Management:**
    * **Reset Password:** Admin can reset an employee's password to the default format (`username$$DD`) with a single click.
* **Advanced Search:** Real-time filtering of the employee list by Name, Email, or Designation.

### 👤 3. User Dashboard (Employee Portal)
* **My Profile:** A detailed, glass-morphism card view of the logged-in user's data (ID, Role, Salary, Status).
* **Team Directory:** A read-only view of all colleagues with search functionality.
* **Mobile Responsive:** Includes a slide-out sidebar menu and backdrop overlay for mobile devices.

---

## 🎨 UI/UX Highlights

* **Glassmorphism:** Extensive use of `backdrop-blur`, semi-transparent backgrounds (`bg-white/5`), and subtle borders to create a premium, modern feel.
* **Responsive Design:**
    * **Desktop:** Full sidebar and grid layouts.
    * **Mobile:** Collapsible Sidebar with Hamburger menu (`FiMenu`), responsive tables with scroll overflow, and stacked grid layouts for analytics.
* **Animations:** Smooth transitions for hover effects, toast notifications, and sidebar toggling.
* **Toast Notifications:** Custom notification system for success/error feedback.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js** and **npm** installed on your machine.

### 2. Clone & Install
```bash
# Navigate to the folder
cd ems-frontend

# Install dependencies
npm install