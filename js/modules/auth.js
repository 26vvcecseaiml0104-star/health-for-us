/**
 * CareConnect - Authentication & Profile Management
 * Developed by Team TECH NOVA
 */

import { storage } from "./storage.js";

export class AuthModule {
  constructor(app) {
    this.app = app;
    this.currentUser = storage.getCurrentUser();
    this.initElements();
    this.bindEvents();
    this.updateNavUI();
  }

  initElements() {
    this.navAuthContainer = document.getElementById("nav-auth-container");
    this.authModal = document.getElementById("auth-modal");
    this.profileModal = document.getElementById("profile-modal");
    this.loginForm = document.getElementById("login-form");
    this.registerForm = document.getElementById("register-form");
    this.profileForm = document.getElementById("profile-form");
    this.authTabBtns = document.querySelectorAll(".auth-tab-btn");
    this.authForms = document.querySelectorAll(".auth-form-panel");
  }

  bindEvents() {
    // Listen for custom storage user changes
    window.addEventListener("careconnect:user-changed", (e) => {
      this.currentUser = e.detail;
      this.updateNavUI();
      this.populateProfileForm();
    });

    // Tab switching inside auth modal (Sign In vs Register)
    this.authTabBtns?.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        this.authTabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.authForms.forEach(form => {
          form.classList.toggle("active", form.id === target);
        });
      });
    });

    // Handle Login submission
    this.loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email")?.value.trim();
      const password = document.getElementById("login-password")?.value.trim();

      const user = storage.findUserByEmail(email);
      if (user && user.password === password) {
        storage.setCurrentUser(user);
        this.app.closeModal("auth-modal");
        this.app.showToast("Signed in successfully", `Welcome back, ${user.name}!`, "success");
      } else {
        const errorEl = document.getElementById("login-error");
        if (errorEl) {
          errorEl.textContent = "Invalid email or password. You can also click a quick demo account.";
          errorEl.classList.add("visible");
        }
      }
    });

    // Handle Registration submission
    this.registerForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name")?.value.trim();
      const email = document.getElementById("reg-email")?.value.trim();
      const password = document.getElementById("reg-password")?.value.trim();
      const phone = document.getElementById("reg-phone")?.value.trim() || "";
      const location = document.getElementById("reg-location")?.value.trim() || "Seattle, WA";

      if (!name || !email || !password) {
        this.app.showToast("Missing Fields", "Please enter your name, email, and password.", "error");
        return;
      }

      if (storage.findUserByEmail(email)) {
        const errorEl = document.getElementById("reg-error");
        if (errorEl) {
          errorEl.textContent = "An account with this email already exists.";
          errorEl.classList.add("visible");
        }
        return;
      }

      const newUser = {
        id: "user-" + Date.now(),
        name,
        email,
        password,
        phone,
        location,
        demographic: "Patient",
        preferences: {
          preferredMode: "video",
          notificationMethod: "email",
          language: "English"
        }
      };

      storage.saveUser(newUser);
      storage.setCurrentUser(newUser);
      this.app.closeModal("auth-modal");
      this.app.showToast("Account Created", `Welcome to CareConnect, ${newUser.name}!`, "success");
    });

    // Handle Quick Demo Account buttons
    document.querySelectorAll(".demo-login-btn")?.forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.demoEmail;
        const user = storage.findUserByEmail(email);
        if (user) {
          storage.setCurrentUser(user);
          this.app.closeModal("auth-modal");
          this.app.showToast("Demo Profile Loaded", `Switched to ${user.name} (${user.demographic})`, "info");
        }
      });
    });

    // Profile update form submission
    this.profileForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!this.currentUser) return;

      const updated = {
        ...this.currentUser,
        name: document.getElementById("profile-name")?.value.trim() || this.currentUser.name,
        phone: document.getElementById("profile-phone")?.value.trim() || "",
        location: document.getElementById("profile-location")?.value.trim() || "",
        preferences: {
          ...this.currentUser.preferences,
          preferredMode: document.getElementById("profile-pref-mode")?.value || "in-person",
          notificationMethod: document.getElementById("profile-pref-notify")?.value || "email",
          emergencyContactName: document.getElementById("profile-emergency-name")?.value.trim() || "",
          emergencyContactPhone: document.getElementById("profile-emergency-phone")?.value.trim() || ""
        }
      };

      storage.saveUser(updated);
      this.app.closeModal("profile-modal");
      this.app.showToast("Profile Updated", "Your personal healthcare preferences have been saved.", "success");
    });
  }

  updateNavUI() {
    if (!this.navAuthContainer) return;

    if (this.currentUser) {
      const initials = this.currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
      this.navAuthContainer.innerHTML = `
        <div class="user-menu-wrapper" id="user-menu-wrapper">
          <button class="user-avatar-btn" id="user-menu-toggle" aria-expanded="false" title="User Menu">
            <div class="user-avatar-circle">${initials}</div>
            <span style="font-size: var(--font-sm); font-weight: 600; color: var(--color-text-main);">${this.currentUser.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="user-dropdown-menu" id="user-dropdown-menu">
            <div class="user-menu-header">
              <div class="user-menu-name">${this.currentUser.name}</div>
              <div class="user-menu-email">${this.currentUser.email}</div>
              <span class="badge badge-verified" style="font-size: 0.65rem; margin-top: 4px;">${this.currentUser.demographic || 'Patient'}</span>
            </div>
            <button class="user-menu-item" id="btn-open-profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              My Profile & Preferences
            </button>
            <a href="#appointments" class="user-menu-item nav-hash-trigger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              My Appointments
            </a>
            <a href="#medications" class="user-menu-item nav-hash-trigger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
              Medication Schedule
            </a>
            <div class="user-menu-divider"></div>
            <div style="padding: 0.25rem 0.85rem; font-size: 0.7rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase;">Switch Demo Account</div>
            <button class="user-menu-item demo-switch-btn" data-email="sarah.jenkins@example.com">
              👤 Sarah Jenkins (Professional)
            </button>
            <button class="user-menu-item demo-switch-btn" data-email="robert.chen@example.com">
              👴 Robert Chen (Elderly Patient)
            </button>
            <div class="user-menu-divider"></div>
            <button class="user-menu-item" id="btn-sign-out" style="color: var(--color-danger);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </button>
          </div>
        </div>
      `;

      // Bind user dropdown menu triggers
      const toggleBtn = document.getElementById("user-menu-toggle");
      const dropdown = document.getElementById("user-dropdown-menu");
      toggleBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("active");
      });

      document.addEventListener("click", () => {
        dropdown?.classList.remove("active");
      });

      document.getElementById("btn-open-profile")?.addEventListener("click", () => {
        dropdown.classList.remove("active");
        this.populateProfileForm();
        this.app.openModal("profile-modal");
      });

      document.querySelectorAll(".demo-switch-btn")?.forEach(btn => {
        btn.addEventListener("click", () => {
          dropdown.classList.remove("active");
          const email = btn.dataset.email;
          const user = storage.findUserByEmail(email);
          if (user) {
            storage.setCurrentUser(user);
            this.app.showToast("Account Switched", `Now viewing as ${user.name}`, "info");
          }
        });
      });

      document.getElementById("btn-sign-out")?.addEventListener("click", () => {
        dropdown.classList.remove("active");
        storage.clearCurrentUser();
        this.app.showToast("Signed Out", "You have been signed out.", "info");
      });
    } else {
      this.navAuthContainer.innerHTML = `
        <button class="btn btn-outline btn-sm" id="btn-nav-login">Sign In</button>
        <button class="btn btn-primary btn-sm" id="btn-nav-register">Register</button>
      `;

      document.getElementById("btn-nav-login")?.addEventListener("click", () => {
        this.app.openModal("auth-modal");
        this.authTabBtns[0]?.click();
      });

      document.getElementById("btn-nav-register")?.addEventListener("click", () => {
        this.app.openModal("auth-modal");
        this.authTabBtns[1]?.click();
      });
    }
  }

  populateProfileForm() {
    if (!this.currentUser) return;
    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");
    const locationInput = document.getElementById("profile-location");
    const modeSelect = document.getElementById("profile-pref-mode");
    const notifySelect = document.getElementById("profile-pref-notify");
    const emergName = document.getElementById("profile-emergency-name");
    const emergPhone = document.getElementById("profile-emergency-phone");

    if (nameInput) nameInput.value = this.currentUser.name || "";
    if (emailInput) emailInput.value = this.currentUser.email || "";
    if (phoneInput) phoneInput.value = this.currentUser.phone || "";
    if (locationInput) locationInput.value = this.currentUser.location || "";
    if (modeSelect) modeSelect.value = this.currentUser.preferences?.preferredMode || "in-person";
    if (notifySelect) notifySelect.value = this.currentUser.preferences?.notificationMethod || "email";
    if (emergName) emergName.value = this.currentUser.preferences?.emergencyContactName || "";
    if (emergPhone) emergPhone.value = this.currentUser.preferences?.emergencyContactPhone || "";
  }
}
