/**
 * CareConnect - Appointment Request & Management Module
 * Developed by Team TECH NOVA
 */

import { storage } from "./storage.js";
import { HEALTHCARE_PROVIDERS } from "../data/doctors.js";

export class AppointmentsModule {
  constructor(app) {
    this.app = app;
    this.activeTab = "all"; // 'all', 'upcoming', 'pending', 'confirmed', 'completed', 'cancelled'
    this.selectedDoctorForBooking = null;
    this.initElements();
    this.bindEvents();
    this.renderAppointments();
  }

  initElements() {
    this.listContainer = document.getElementById("appointments-list-container");
    this.tabButtons = document.querySelectorAll(".appointment-tab-btn");
    this.bookingModal = document.getElementById("booking-modal");
    this.bookingForm = document.getElementById("booking-form");
    this.rescheduleModal = document.getElementById("reschedule-modal");
    this.rescheduleForm = document.getElementById("reschedule-form");

    // Booking modal inputs
    this.bookDoctorSelect = document.getElementById("book-doctor-select");
    this.bookDateInput = document.getElementById("book-date-input");
    this.bookSlotsContainer = document.getElementById("book-slots-container");
    this.bookModeSelect = document.getElementById("book-mode-select");
    this.bookReasonInput = document.getElementById("book-reason-input");
    this.bookSummaryFee = document.getElementById("book-summary-fee");

    // Populate doctor select
    if (this.bookDoctorSelect) {
      this.bookDoctorSelect.innerHTML = HEALTHCARE_PROVIDERS.map(doc => `
        <option value="${doc.id}">${doc.name} — ${doc.specialty} (${doc.facility})</option>
      `).join("");
    }

    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    if (this.bookDateInput) {
      this.bookDateInput.min = tomorrowStr;
      this.bookDateInput.value = tomorrowStr;
    }
  }

  bindEvents() {
    // Listen for storage appointment updates
    window.addEventListener("careconnect:appointments-updated", () => {
      this.renderAppointments();
    });

    // Listen for user changes (data isolation)
    window.addEventListener("careconnect:user-changed", () => {
      this.renderAppointments();
    });

    // Tab buttons
    this.tabButtons?.forEach(btn => {
      btn.addEventListener("click", () => {
        this.tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeTab = btn.dataset.tab;
        this.renderAppointments();
      });
    });

    // Date or Doctor change in booking form -> update time slots
    this.bookDoctorSelect?.addEventListener("change", () => {
      this.updateTimeSlots();
      this.updateBookingFee();
    });

    this.bookDateInput?.addEventListener("change", () => {
      this.updateTimeSlots();
    });

    this.bookModeSelect?.addEventListener("change", () => {
      this.updateBookingFee();
    });

    // Booking form submit
    this.bookingForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleBookingSubmit();
    });

    // Reschedule form submit
    this.rescheduleForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleRescheduleSubmit();
    });

    // Delegate appointment card actions (Simulate Confirm, Reschedule, Cancel, Calendar)
    this.listContainer?.addEventListener("click", (e) => {
      const confirmBtn = e.target.closest(".btn-simulate-confirm");
      if (confirmBtn) {
        const id = confirmBtn.dataset.aptId;
        storage.updateAppointmentStatus(id, "Confirmed", "Confirmed by clinic scheduling coordinator.");
        this.app.showToast("Appointment Confirmed", "Simulated clinic staff verification: Status changed to Confirmed.", "success");
        return;
      }

      const completeBtn = e.target.closest(".btn-simulate-complete");
      if (completeBtn) {
        const id = completeBtn.dataset.aptId;
        storage.updateAppointmentStatus(id, "Completed", "Visit completed and clinical notes archived.");
        this.app.showToast("Visit Completed", "Simulated appointment completion.", "info");
        return;
      }

      const cancelBtn = e.target.closest(".btn-cancel-appointment");
      if (cancelBtn) {
        const id = cancelBtn.dataset.aptId;
        if (confirm("Are you sure you wish to cancel this appointment request?")) {
          storage.updateAppointmentStatus(id, "Cancelled", "Cancelled upon patient request.");
          this.app.showToast("Appointment Cancelled", "Your booking request has been cancelled.", "warning");
        }
        return;
      }

      const reschedBtn = e.target.closest(".btn-open-reschedule");
      if (reschedBtn) {
        const id = reschedBtn.dataset.aptId;
        this.openRescheduleModal(id);
        return;
      }

      const calBtn = e.target.closest(".btn-download-calendar");
      if (calBtn) {
        const id = calBtn.dataset.aptId;
        this.downloadCalendarFile(id);
        return;
      }
    });
  }

  openBookingModal(preselectedDoctorId = null) {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      this.app.showToast("Sign In Required", "Please sign in or select a demo profile to request an appointment.", "info");
      this.app.openModal("auth-modal");
      return;
    }

    if (preselectedDoctorId && this.bookDoctorSelect) {
      this.bookDoctorSelect.value = preselectedDoctorId;
    }

    this.updateTimeSlots();
    this.updateBookingFee();
    this.app.openModal("booking-modal");
  }

  updateBookingFee() {
    const docId = this.bookDoctorSelect?.value;
    const mode = this.bookModeSelect?.value || "in-person";
    const doc = HEALTHCARE_PROVIDERS.find(p => p.id === docId);
    if (doc && this.bookSummaryFee) {
      const fee = mode === "video" ? doc.fee.video : doc.fee.inPerson;
      this.bookSummaryFee.textContent = `$${fee} (${mode === 'video' ? 'Video Telehealth' : 'In-Person Consultation'})`;
    }
  }

  updateTimeSlots() {
    if (!this.bookSlotsContainer) return;
    const docId = this.bookDoctorSelect?.value;
    const selectedDate = this.bookDateInput?.value;
    const doc = HEALTHCARE_PROVIDERS.find(p => p.id === docId) || HEALTHCARE_PROVIDERS[0];

    const slots = doc.timeSlots || ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM"];

    this.bookSlotsContainer.innerHTML = slots.map((slot, idx) => {
      const isBooked = storage.isSlotBooked(doc.id, selectedDate, slot);
      return `
        <label class="slot-pill-label ${isBooked ? 'disabled' : ''}">
          <input type="radio" name="booking-slot" value="${slot}" ${idx === 0 && !isBooked ? 'checked' : ''} ${isBooked ? 'disabled' : ''} />
          <span>${slot} ${isBooked ? '(Booked)' : ''}</span>
        </label>
      `;
    }).join("");
  }

  handleBookingSubmit() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      this.app.showToast("Authentication Error", "You must be signed in to submit an appointment request.", "error");
      return;
    }

    const docId = this.bookDoctorSelect?.value;
    const date = this.bookDateInput?.value;
    const selectedSlotRadio = document.querySelector('input[name="booking-slot"]:checked');
    const time = selectedSlotRadio?.value;
    const consultationType = this.bookModeSelect?.value || "in-person";
    const reason = this.bookReasonInput?.value.trim() || "General Consultation / Routine Follow-up";

    if (!docId || !date || !time) {
      this.app.showToast("Incomplete Form", "Please select a date and an available time slot.", "error");
      return;
    }

    // Double check conflict
    if (storage.isSlotBooked(docId, date, time)) {
      this.app.showToast("Slot Unavailable", "This time slot has just been reserved. Please select another slot.", "error");
      this.updateTimeSlots();
      return;
    }

    const doc = HEALTHCARE_PROVIDERS.find(p => p.id === docId);
    const fee = consultationType === "video" ? doc.fee.video : doc.fee.inPerson;

    // Create appointment with STRICT initial status: "Pending Confirmation"
    const newAppointment = {
      id: "apt-" + Date.now(),
      userId: currentUser.id,
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialty,
      doctorImage: doc.image,
      facility: doc.facility,
      date,
      time,
      consultationType,
      visitReason: reason,
      status: "Pending Confirmation", // Explicitly requested by project requirements
      fee,
      createdAt: new Date().toISOString(),
      notes: "Request submitted to clinic coordinator. Status will be updated once reviewed."
    };

    storage.saveAppointment(newAppointment);
    this.app.closeModal("booking-modal");
    if (this.bookingForm) this.bookingForm.reset();

    // Show toast and navigate to appointments section
    this.app.showToast(
      "Appointment Request Submitted",
      `Your request with ${doc.name} for ${date} at ${time} is now Pending Confirmation by clinic staff.`,
      "warning"
    );

    // Scroll to appointments view
    document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" });
  }

  openRescheduleModal(appointmentId) {
    const user = storage.getCurrentUser();
    if (!user) return;
    const apts = storage.getUserAppointments(user.id);
    const apt = apts.find(a => a.id === appointmentId);
    if (!apt) return;

    const modal = document.getElementById("reschedule-modal");
    const title = document.getElementById("reschedule-modal-title");
    const docInfo = document.getElementById("reschedule-doctor-info");
    const dateInput = document.getElementById("reschedule-date-input");
    const slotContainer = document.getElementById("reschedule-slots-container");
    const aptIdHidden = document.getElementById("reschedule-apt-id");

    if (title) title.textContent = `Reschedule Appointment — ${apt.doctorName}`;
    if (aptIdHidden) aptIdHidden.value = apt.id;
    if (docInfo) {
      docInfo.innerHTML = `
        <strong>${apt.doctorName}</strong> (${apt.doctorSpecialty})<br>
        Currently booked: <em>${apt.date} at ${apt.time}</em>
      `;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateInput) {
      dateInput.min = tomorrow.toISOString().split("T")[0];
      dateInput.value = tomorrow.toISOString().split("T")[0];
    }

    const doc = HEALTHCARE_PROVIDERS.find(p => p.id === apt.doctorId) || HEALTHCARE_PROVIDERS[0];
    const slots = doc.timeSlots || ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM"];

    const updateRescheduleSlots = () => {
      const curDate = dateInput.value;
      slotContainer.innerHTML = slots.map((s, idx) => {
        const booked = storage.isSlotBooked(doc.id, curDate, s);
        return `
          <label class="slot-pill-label ${booked ? 'disabled' : ''}">
            <input type="radio" name="reschedule-slot" value="${s}" ${idx === 0 && !booked ? 'checked' : ''} ${booked ? 'disabled' : ''} />
            <span>${s} ${booked ? '(Unavailable)' : ''}</span>
          </label>
        `;
      }).join("");
    };

    dateInput.onchange = updateRescheduleSlots;
    updateRescheduleSlots();

    this.app.openModal("reschedule-modal");
  }

  handleRescheduleSubmit() {
    const aptId = document.getElementById("reschedule-apt-id")?.value;
    const newDate = document.getElementById("reschedule-date-input")?.value;
    const selectedSlot = document.querySelector('input[name="reschedule-slot"]:checked')?.value;

    if (!aptId || !newDate || !selectedSlot) {
      this.app.showToast("Incomplete Form", "Please choose a new date and time slot.", "error");
      return;
    }

    storage.rescheduleAppointment(aptId, newDate, selectedSlot);
    this.app.closeModal("reschedule-modal");
    this.app.showToast("Reschedule Requested", `Appointment rescheduled to ${newDate} at ${selectedSlot}. Pending confirmation.`, "warning");
  }

  downloadCalendarFile(appointmentId) {
    const user = storage.getCurrentUser();
    if (!user) return;
    const apt = storage.getUserAppointments(user.id).find(a => a.id === appointmentId);
    if (!apt) return;

    // Generate .ics standard file content
    const dateFormatted = apt.date.replace(/-/g, "");
    // Approximate start time
    const [timeStr, meridian] = apt.time.split(" ");
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours);
    if (meridian === "PM" && h < 12) h += 12;
    if (meridian === "AM" && h === 12) h = 0;
    const hh = String(h).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");

    const startTime = `${dateFormatted}T${hh}${mm}00Z`;
    const endTime = `${dateFormatted}T${String(h + 1).padStart(2, "0")}${mm}00Z`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CareConnect//Healthcare Portal//EN",
      "BEGIN:VEVENT",
      `UID:${apt.id}@careconnect.portal`,
      `DTSTAMP:${dateFormatted}T000000Z`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:Medical Appointment: ${apt.doctorName} (${apt.doctorSpecialty})`,
      `DESCRIPTION:CareConnect Appointment: ${apt.visitReason}\\nMode: ${apt.consultationType}\\nFacility: ${apt.facility}`,
      `LOCATION:${apt.facility}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CareConnect_${apt.doctorName.replace(/\s+/g, "_")}_${apt.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.app.showToast("Calendar Exported", "Appointment file downloaded (.ics). Open it to add to Apple, Google, or Outlook Calendar.", "info");
  }

  renderAppointments() {
    if (!this.listContainer) return;
    const currentUser = storage.getCurrentUser();

    if (!currentUser) {
      this.listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-xl); border: 1px dashed var(--color-border);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔒</div>
          <h3 style="font-size: var(--font-xl); margin-bottom: 0.5rem;">Sign In to View Your Appointments</h3>
          <p style="color: var(--color-text-secondary); max-width: 440px; margin: 0 auto 1.5rem auto;">
            Patient records and appointment schedules are protected and private. Please sign in or load a demo account to manage your bookings.
          </p>
          <button class="btn btn-primary" id="btn-empty-auth">Sign In / Choose Demo Profile</button>
        </div>
      `;
      document.getElementById("btn-empty-auth")?.addEventListener("click", () => this.app.openModal("auth-modal"));
      return;
    }

    const allAppointments = storage.getUserAppointments(currentUser.id);

    // Update tab counts
    this.updateTabCounters(allAppointments);

    // Filter by active tab
    let filtered = allAppointments.filter(apt => {
      if (this.activeTab === "all") return true;
      if (this.activeTab === "upcoming") {
        return (apt.status === "Confirmed" || apt.status === "Pending Confirmation") && apt.date >= new Date().toISOString().split("T")[0];
      }
      if (this.activeTab === "pending") return apt.status === "Pending Confirmation";
      if (this.activeTab === "confirmed") return apt.status === "Confirmed";
      if (this.activeTab === "completed") return apt.status === "Completed";
      if (this.activeTab === "cancelled") return apt.status === "Cancelled";
      return true;
    });

    if (filtered.length === 0) {
      this.listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-xl); border: 1px dashed var(--color-border);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📅</div>
          <h3 style="font-size: var(--font-xl); margin-bottom: 0.5rem;">No ${this.activeTab === 'all' ? '' : this.activeTab} appointments found</h3>
          <p style="color: var(--color-text-secondary); max-width: 440px; margin: 0 auto 1.5rem auto;">
            You have no appointments in this category right now. You can discover a doctor and request a visit anytime.
          </p>
          <a href="#find-doctors" class="btn btn-primary nav-hash-trigger">Discover Doctors</a>
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = filtered.map(apt => {
      let statusBadgeClass = "badge-pending";
      let statusIcon = "⏳";
      if (apt.status === "Confirmed") {
        statusBadgeClass = "badge-confirmed";
        statusIcon = "✅";
      } else if (apt.status === "Completed") {
        statusBadgeClass = "badge-completed";
        statusIcon = "✔️";
      } else if (apt.status === "Cancelled") {
        statusBadgeClass = "badge-cancelled";
        statusIcon = "❌";
      }

      return `
        <article class="appointment-item-card fade-in" id="item-${apt.id}">
          <div class="appointment-header-row">
            <div class="appointment-doctor-info">
              <img src="${apt.doctorImage}" alt="${apt.doctorName}" class="appointment-doctor-avatar" onerror="this.onerror=null; this.src='assets/images/doctor_sarah_mitchell.jpg';" />
              <div class="appointment-doctor-details">
                <h4>${apt.doctorName}</h4>
                <p>${apt.doctorSpecialty}</p>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">${apt.facility}</div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="badge ${statusBadgeClass}">
                ${statusIcon} ${apt.status}
              </span>
              <span class="badge badge-mode">
                ${apt.consultationType === 'video' ? '💻 Video Consult' : '🏥 In-Person'}
              </span>
            </div>
          </div>

          <div class="appointment-meta-grid">
            <div>
              <div class="meta-col-label">Date & Time</div>
              <div class="meta-col-value">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${apt.date} • ${apt.time}
              </div>
            </div>
            <div>
              <div class="meta-col-label">Visit Reason</div>
              <div class="meta-col-value" style="font-size: 0.75rem; font-weight: normal; color: var(--color-text-secondary);">
                ${apt.visitReason}
              </div>
            </div>
            <div>
              <div class="meta-col-label">Consultation Fee</div>
              <div class="meta-col-value" style="color: var(--color-primary-dark); font-weight: 700;">
                $${apt.fee}
              </div>
            </div>
            <div>
              <div class="meta-col-label">Coordinator Notes</div>
              <div class="meta-col-value" style="font-size: 0.72rem; font-weight: normal; color: var(--color-text-muted);">
                ${apt.notes || 'No special notes'}
              </div>
            </div>
          </div>

          <div class="appointment-actions-row">
            <div class="flex items-center gap-2">
              <button class="btn btn-outline btn-sm btn-download-calendar" data-apt-id="${apt.id}" title="Add to calendar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Calendar (.ics)
              </button>
              ${apt.status !== 'Cancelled' && apt.status !== 'Completed' ? `
                <button class="btn btn-subtle btn-sm btn-open-reschedule" data-apt-id="${apt.id}">
                  Reschedule
                </button>
                <button class="btn btn-danger-outline btn-sm btn-cancel-appointment" data-apt-id="${apt.id}">
                  Cancel
                </button>
              ` : ''}
            </div>

            <!-- Clinic Coordinator Simulation Controls for Genuine MVP Testing -->
            <div class="flex items-center gap-1" style="background: #FFFBEB; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid #FDE68A;">
              <span style="font-size: 0.7rem; color: #92400E; font-weight: 600;">Clinic Simulation:</span>
              ${apt.status === 'Pending Confirmation' ? `
                <button class="btn btn-success btn-sm btn-simulate-confirm" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;" data-apt-id="${apt.id}">
                  ✓ Confirm Slot
                </button>
              ` : ''}
              ${apt.status === 'Confirmed' ? `
                <button class="btn btn-subtle btn-sm btn-simulate-complete" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;" data-apt-id="${apt.id}">
                  Mark Completed
                </button>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  updateTabCounters(allAppointments) {
    const todayStr = new Date().toISOString().split("T")[0];
    const upcomingCount = allAppointments.filter(a => (a.status === "Confirmed" || a.status === "Pending Confirmation") && a.date >= todayStr).length;
    const pendingCount = allAppointments.filter(a => a.status === "Pending Confirmation").length;
    const confirmedCount = allAppointments.filter(a => a.status === "Confirmed").length;
    const completedCount = allAppointments.filter(a => a.status === "Completed").length;
    const cancelledCount = allAppointments.filter(a => a.status === "Cancelled").length;

    document.getElementById("count-tab-all") && (document.getElementById("count-tab-all").textContent = allAppointments.length);
    document.getElementById("count-tab-upcoming") && (document.getElementById("count-tab-upcoming").textContent = upcomingCount);
    document.getElementById("count-tab-pending") && (document.getElementById("count-tab-pending").textContent = pendingCount);
    document.getElementById("count-tab-confirmed") && (document.getElementById("count-tab-confirmed").textContent = confirmedCount);
    document.getElementById("count-tab-completed") && (document.getElementById("count-tab-completed").textContent = completedCount);
    document.getElementById("count-tab-cancelled") && (document.getElementById("count-tab-cancelled").textContent = cancelledCount);
  }
}
