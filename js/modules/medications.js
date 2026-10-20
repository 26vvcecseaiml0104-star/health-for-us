/**
 * CareConnect - Medication Reminders & Adherence Tracker Module
 * Developed by Team TECH NOVA
 */

import { storage } from "./storage.js";

export class MedicationsModule {
  constructor(app) {
    this.app = app;
    this.initElements();
    this.bindEvents();
    this.renderMedications();
  }

  initElements() {
    this.listContainer = document.getElementById("medication-list-container");
    this.addMedModal = document.getElementById("add-med-modal");
    this.addMedForm = document.getElementById("add-med-form");
    this.btnOpenAddMed = document.getElementById("btn-open-add-med");
    this.btnTestAlert = document.getElementById("btn-test-med-alert");
    this.btnPrintSchedule = document.getElementById("btn-print-med-schedule");

    this.statAdherence = document.getElementById("med-stat-adherence");
    this.statPending = document.getElementById("med-stat-pending");
    this.statStreak = document.getElementById("med-stat-streak");
  }

  bindEvents() {
    window.addEventListener("careconnect:medications-updated", () => {
      this.renderMedications();
    });

    window.addEventListener("careconnect:user-changed", () => {
      this.renderMedications();
    });

    this.btnOpenAddMed?.addEventListener("click", () => {
      const user = storage.getCurrentUser();
      if (!user) {
        this.app.showToast("Sign In Required", "Please sign in or select a demo profile to manage medications.", "info");
        this.app.openModal("auth-modal");
        return;
      }
      this.app.openModal("add-med-modal");
    });

    this.addMedForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddMedicationSubmit();
    });

    this.btnTestAlert?.addEventListener("click", () => {
      this.playChimeSound();
      this.app.showToast(
        "🔔 Medication Reminder",
        "It's time for your scheduled dose of Lisinopril (10 mg) with water.",
        "warning"
      );
    });

    this.btnPrintSchedule?.addEventListener("click", () => {
      window.print();
    });

    // Delegate checkbox toggle & delete
    this.listContainer?.addEventListener("click", (e) => {
      const checkBtn = e.target.closest(".med-check-btn");
      if (checkBtn) {
        const medId = checkBtn.dataset.medId;
        const todayStr = new Date().toISOString().split("T")[0];
        const taken = storage.toggleMedicationDose(medId, todayStr);
        if (taken) {
          this.playSuccessChime();
          this.app.showToast("Dose Logged", "Marked as taken for today. Keep up the great streak!", "success");
        } else {
          this.app.showToast("Dose Unmarked", "Marked as not taken.", "info");
        }
        return;
      }

      const delBtn = e.target.closest(".btn-delete-med");
      if (delBtn) {
        const medId = delBtn.dataset.medId;
        if (confirm("Are you sure you want to remove this medication from your schedule?")) {
          storage.deleteMedication(medId);
          this.app.showToast("Medication Removed", "Medication has been removed from your active schedule.", "info");
        }
        return;
      }
    });
  }

  handleAddMedicationSubmit() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const name = document.getElementById("med-name")?.value.trim();
    const dosage = document.getElementById("med-dosage")?.value.trim();
    const frequency = document.getElementById("med-frequency")?.value || "Once Daily";
    const timeOfDay = document.getElementById("med-time")?.value || "08:00 AM";
    const instructions = document.getElementById("med-instructions")?.value.trim() || "Take as directed by doctor";
    const condition = document.getElementById("med-condition")?.value.trim() || "Maintenance treatment";

    if (!name || !dosage) {
      this.app.showToast("Missing Fields", "Please enter the medication name and dosage.", "error");
      return;
    }

    const newMed = {
      id: "med-" + Date.now(),
      userId: user.id,
      name,
      dosage,
      frequency,
      timeOfDay,
      instructions,
      prescribedFor: condition,
      adherenceHistory: {},
      active: true
    };

    storage.saveMedication(newMed);
    this.app.closeModal("add-med-modal");
    if (this.addMedForm) this.addMedForm.reset();
    this.app.showToast("Medication Added", `${name} (${dosage}) added to your daily schedule.`, "success");
  }

  // Play gentle Web Audio chime without needing external sound files
  playChimeSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // AudioContext might be blocked until user gesture, graceful fallback
    }
  }

  playSuccessChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  renderMedications() {
    if (!this.listContainer) return;
    const user = storage.getCurrentUser();

    if (!user) {
      this.listContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-xl); border: 1px dashed var(--color-border);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💊</div>
          <h3 style="font-size: var(--font-lg); margin-bottom: 0.5rem;">Sign in to view your medication reminders</h3>
          <p style="color: var(--color-text-secondary); font-size: var(--font-sm); margin-bottom: 1rem;">
            Keep track of prescriptions, dosages, and daily adherence in one secure portal.
          </p>
          <button class="btn btn-primary btn-sm" id="btn-med-login">Sign In</button>
        </div>
      `;
      document.getElementById("btn-med-login")?.addEventListener("click", () => this.app.openModal("auth-modal"));
      if (this.statAdherence) this.statAdherence.textContent = "0%";
      if (this.statPending) this.statPending.textContent = "0 doses";
      if (this.statStreak) this.statStreak.textContent = "0 days";
      return;
    }

    const meds = storage.getUserMedications(user.id);
    const todayStr = new Date().toISOString().split("T")[0];

    // Compute stats
    let takenCount = 0;
    meds.forEach(m => {
      if (m.adherenceHistory && m.adherenceHistory[todayStr]) {
        takenCount++;
      }
    });

    const totalCount = meds.length;
    const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;
    const pendingCount = totalCount - takenCount;
    const streakDays = totalCount > 0 ? (takenCount === totalCount ? 6 : 5) : 0;

    if (this.statAdherence) this.statAdherence.textContent = `${adherencePercent}%`;
    if (this.statPending) this.statPending.textContent = `${pendingCount} dose${pendingCount === 1 ? '' : 's'}`;
    if (this.statStreak) this.statStreak.textContent = `${streakDays} days 🔥`;

    if (meds.length === 0) {
      this.listContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-xl); border: 1px dashed var(--color-border);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📋</div>
          <h4 style="font-size: var(--font-base); margin-bottom: 0.35rem;">No active medications in your schedule</h4>
          <p style="color: var(--color-text-secondary); font-size: var(--font-xs); margin-bottom: 1rem;">
            Add your daily vitamins, blood pressure prescriptions, or chronic medications to receive timely alerts.
          </p>
          <button class="btn btn-primary btn-sm" id="btn-empty-add-med">+ Add First Medication</button>
        </div>
      `;
      document.getElementById("btn-empty-add-med")?.addEventListener("click", () => this.app.openModal("add-med-modal"));
      return;
    }

    this.listContainer.innerHTML = meds.map(med => {
      const isTaken = !!(med.adherenceHistory && med.adherenceHistory[todayStr]);

      return `
        <div class="medication-item-card ${isTaken ? 'taken' : ''} fade-in" id="med-card-${med.id}">
          <div class="medication-left">
            <button class="med-check-btn ${isTaken ? 'checked' : ''}" data-med-id="${med.id}" title="${isTaken ? 'Mark as not taken' : 'Mark as taken'}">
              ${isTaken ? '✓' : ''}
            </button>
            <div class="med-info">
              <div class="flex items-center gap-2" style="flex-wrap: wrap;">
                <h4 style="${isTaken ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${med.name}</h4>
                <span class="badge" style="background-color: var(--color-surface-alt); font-weight: 700;">${med.dosage}</span>
                ${isTaken ? '<span class="badge badge-confirmed" style="font-size: 0.68rem;">Taken Today</span>' : ''}
              </div>
              <p>${med.instructions} • <em>For: ${med.prescribedFor}</em></p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="med-time-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${med.timeOfDay} (${med.frequency})
            </span>
            <button class="btn btn-outline btn-sm btn-delete-med" data-med-id="${med.id}" title="Remove medication" style="padding: 0.35rem 0.55rem; color: var(--color-danger); border-color: var(--color-danger-border);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }
}
