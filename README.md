# 🏥 Health For Us — CareConnect Smart Healthcare Access Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Status: Active](https://img.shields.io/badge/Status-Completed-success.svg)]()
[![Platform: Web](https://img.shields.io/badge/Platform-Web%20Application-blue.svg)]()

> Developed by **Team TECH NOVA** (VVCE CSE AIML)

**CareConnect** is a healthcare access portal engineered to bridge the gap between patients, verified medical practitioners, and health resources. Featuring real-time appointment scheduling, smart medication reminders, an emergency-aware AI triage assistant (CareBot), and accessibility controls.

---

## ✨ Key Features

- **🩺 Verified Doctor Directory & Filtering**:
  - Search and filter by specialty (Cardiology, Pediatrics, Neurology, Dermatology, Orthopedics, General Medicine).
  - Telehealth vs In-Person consultation indicators with real-time availability slots.
  - Complete doctor profiles with qualifications, hospital affiliations, patient reviews, and consultation fees.

- **📅 Interactive Appointment Booking Engine**:
  - Intuitive multi-step scheduling with calendar date picker and time-slot selection.
  - Patient history tracking with cancellation and rescheduling options.
  - Downloadable appointment confirmations.

- **💊 Medication Management & Refill Tracking**:
  - Digital prescription organizer with dosage schedules, frequency alerts, and remaining pill trackers.
  - One-click prescription refill requests.

- **🤖 CareBot AI Intelligent Health Assistant**:
  - Context-aware health inquiry triage with rapid symptom assessments.
  - Built-in emergency keywords detection that prompts instant emergency helpline contacts (911 / 112).
  - Pre-programmed guidance for common health conditions and wellness queries.

- **♿ Universal Accessibility & Senior-Friendly Design**:
  - Instant text resizing (`A` standard, `A+` large, `A++` extra-large) designed for seniors and visually impaired users.
  - High-contrast toggle for enhanced visibility and readability.
  - Keyboard accessible navigation and WCAG AA color contrast compliant.
  - Prominent emergency hotbar on all screens.

- **💾 Local-First Persistence**:
  - Resilient browser LocalStorage state management for appointments, active medications, user preferences, and theme settings.

---

## 🛠️ Technology Stack

- **Frontend Core**: Semantic HTML5, Vanilla JavaScript (ES6+ Modules)
- **Styling**: Modular Vanilla CSS3 (Custom design tokens, glassmorphism, responsive CSS Grid & Flexbox)
- **Typography**: Inter & Plus Jakarta Sans via Google Fonts
- **Icons & Graphics**: Inline Scalable Vector Graphics (SVG)
- **Local Server**: Lightweight native PowerShell HTTP Server (`server.ps1`)

---

## 📁 Project Structure

```text
health-for-us/
├── assets/
│   └── images/                # Medical banner and doctor profile assets
├── css/
│   ├── base.css               # Reset, typography, and base layout rules
│   ├── components.css         # Buttons, cards, modals, form controls
│   ├── sections.css           # Hero, directory, dashboard, CareBot UI styles
│   └── variables.css          # Design tokens (colors, typography, spacing, shadows)
├── js/
│   ├── data/
│   │   ├── doctors.js         # Verified medical specialists mock dataset
│   │   └── healthKnowledge.js # CareBot symptom & health QA knowledge base
│   ├── modules/
│   │   ├── accessibility.js   # Font scaling and high-contrast logic
│   │   ├── appointments.js    # Appointment booking & scheduling system
│   │   ├── auth.js            # User profile and session management
│   │   ├── carebot.js         # CareBot AI conversation & triage engine
│   │   ├── doctors.js         # Doctor search, filters, and rendering
│   │   ├── medications.js     # Medication tracker & dosage manager
│   │   └── storage.js         # LocalStorage persistence layer
│   └── app.js                 # Core application entry point & event bus
├── index.html                 # Main single-page application entry
├── server.ps1                 # Local static HTTP server script
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Option 1: Using the PowerShell Local Server (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/26vvcecseaiml0104-star/health-for-us.git
   cd health-for-us
   ```
2. Launch the local server:
   ```powershell
   .\server.ps1
   ```
3. Open your browser and navigate to `http://localhost:8080`.

### Option 2: Live Server / Direct Browser
Open `index.html` directly in any modern web browser or use the VS Code "Live Server" extension.

---

## 👥 Authors & Acknowledgments

- **Team TECH NOVA** — Department of Computer Science & Engineering (AI & ML), Vidyavardhaka College of Engineering (VVCE).
- Designed for community healthcare access and patient empowerment.
