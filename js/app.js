/**
 * CareConnect - Smart Healthcare Access Portal
 * Developed by Team TECH NOVA
 * Main Application Orchestrator
 */

import { storage } from "./modules/storage.js";
import { AuthModule } from "./modules/auth.js";
import { DoctorsModule } from "./modules/doctors.js";
import { AppointmentsModule } from "./modules/appointments.js";
import { MedicationsModule } from "./modules/medications.js";
import { CareBotModule } from "./modules/carebot.js";
import { AccessibilityModule } from "./modules/accessibility.js";

class CareConnectApp {
  constructor() {
    this.toastContainer = null;
    this.init();
  }

  init() {
    this.initToastContainer();
    this.bindGlobalEvents();

    // Initialize modules
    this.accessibilityModule = new AccessibilityModule(this);
    this.authModule = new AuthModule(this);
    this.doctorsModule = new DoctorsModule(this);
    this.appointmentsModule = new AppointmentsModule(this);
    this.medicationsModule = new MedicationsModule(this);
    this.careBotModule = new CareBotModule(this);

    // Initial check for active hash route
    this.handleHashChange();

    console.log("CareConnect Portal initialized successfully by Team TECH NOVA.");
  }

  initToastContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  bindGlobalEvents() {
    // Mobile navigation toggle
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const navLinks = document.getElementById("nav-links");
    mobileToggle?.addEventListener("click", () => {
      navLinks?.classList.toggle("active");
    });

    // Close mobile menu when clicking any nav link
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navLinks?.classList.remove("active");
      });
    });

    // Modal Close Buttons and Backdrop Click
    document.querySelectorAll(".modal-close, .modal-close-trigger").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-backdrop");
        if (modal) this.closeModal(modal.id);
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          this.closeModal(backdrop.id);
        }
      });
    });

    // Escape key closes open modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.active").forEach(m => {
          this.closeModal(m.id);
        });
      }
    });

    // Hash change routing
    window.addEventListener("hashchange", () => this.handleHashChange());

    // Reset Demo Data trigger in footer
    document.getElementById("btn-reset-demo-data")?.addEventListener("click", () => {
      if (confirm("Reset all appointment requests, medication records, and user preferences back to initial demonstration state?")) {
        storage.resetDemoData();
      }
    });

    // Medical disclaimer modal trigger
    document.getElementById("btn-footer-disclaimer")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openModal("disclaimer-modal");
    });

    // Privacy policy modal trigger
    document.getElementById("btn-footer-privacy")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openModal("privacy-modal");
    });
  }

  handleHashChange() {
    const hash = window.location.hash || "#home";
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === hash);
    });

    if (hash === "#find-doctors") {
      document.getElementById("find-doctors")?.scrollIntoView({ behavior: "smooth" });
    } else if (hash === "#appointments") {
      document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" });
    } else if (hash === "#medications") {
      document.getElementById("medications")?.scrollIntoView({ behavior: "smooth" });
    } else if (hash === "#carebot") {
      document.getElementById("carebot")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  showToast(title, message, type = "info") {
    if (!this.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "error") icon = "❌";

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector(".toast-close")?.addEventListener("click", () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 200);
    });

    this.toastContainer.appendChild(toast);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        setTimeout(() => toast.remove(), 200);
      }
    }, 4500);
  }
}

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.careConnectApp = new CareConnectApp();
});
