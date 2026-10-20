/**
 * CareConnect - Accessibility & Inclusivity Module
 * Developed by Team TECH NOVA
 * 
 * Supports elderly, visually impaired, and mobile users with:
 * - Font scaling (Standard, Large, Extra Large)
 * - High Contrast WCAG AAA mode
 * - Persistent accessibility preferences
 */

export class AccessibilityModule {
  constructor(app) {
    this.app = app;
    this.currentFontSize = localStorage.getItem("careconnect_a11y_font") || "standard";
    this.isHighContrast = localStorage.getItem("careconnect_a11y_contrast") === "true";
    this.init();
  }

  init() {
    this.applyPreferences();
    this.bindEvents();
  }

  applyPreferences() {
    const root = document.documentElement;

    // Font size
    root.setAttribute("data-font-size", this.currentFontSize);
    document.querySelectorAll(".a11y-font-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.size === this.currentFontSize);
    });

    // High contrast
    if (this.isHighContrast) {
      root.setAttribute("data-contrast", "high");
    } else {
      root.removeAttribute("data-contrast");
    }

    const contrastBtn = document.getElementById("btn-toggle-contrast");
    if (contrastBtn) {
      contrastBtn.classList.toggle("active", this.isHighContrast);
      contrastBtn.setAttribute("aria-pressed", this.isHighContrast ? "true" : "false");
    }
  }

  bindEvents() {
    // Font size buttons
    document.querySelectorAll(".a11y-font-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const size = btn.dataset.size;
        this.currentFontSize = size;
        localStorage.setItem("careconnect_a11y_font", size);
        this.applyPreferences();
        this.app.showToast("Display Adjusted", `Font size set to ${size.toUpperCase()}`, "info");
      });
    });

    // High contrast toggle
    document.getElementById("btn-toggle-contrast")?.addEventListener("click", () => {
      this.isHighContrast = !this.isHighContrast;
      localStorage.setItem("careconnect_a11y_contrast", this.isHighContrast ? "true" : "false");
      this.applyPreferences();
      this.app.showToast("Contrast Mode", this.isHighContrast ? "High Contrast Enabled" : "Normal Contrast Restored", "info");
    });
  }
}
