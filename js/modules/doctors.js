/**
 * CareConnect - Doctor Discovery & Healthcare Facility Directory
 * Developed by Team TECH NOVA
 */

import { HEALTHCARE_PROVIDERS, SERVICE_CATEGORIES } from "../data/doctors.js";

export class DoctorsModule {
  constructor(app) {
    this.app = app;
    this.providers = [...HEALTHCARE_PROVIDERS];
    this.activeFilters = {
      query: "",
      specialty: "All",
      facilityType: "All",
      consultationMode: "All",
      sortBy: "recommended"
    };

    this.initElements();
    this.bindEvents();
    this.renderCategories();
    this.renderDoctors();
  }

  initElements() {
    this.gridContainer = document.getElementById("doctors-grid-container");
    this.categoriesContainer = document.getElementById("categories-grid-container");
    this.countBanner = document.getElementById("doctor-results-count");
    this.searchInput = document.getElementById("doctor-search-input");
    this.specialtySelect = document.getElementById("doctor-specialty-select");
    this.facilitySelect = document.getElementById("doctor-facility-select");
    this.modeSelect = document.getElementById("doctor-mode-select");
    this.sortSelect = document.getElementById("doctor-sort-select");
    this.resetBtn = document.getElementById("btn-reset-filters");
    this.heroSearchForm = document.getElementById("hero-search-form");
    this.providerModal = document.getElementById("provider-profile-modal");
  }

  bindEvents() {
    // Search input with debounce
    let timeout;
    this.searchInput?.addEventListener("input", (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.activeFilters.query = e.target.value.trim().toLowerCase();
        this.renderDoctors();
      }, 200);
    });

    // Dropdown filters
    this.specialtySelect?.addEventListener("change", (e) => {
      this.activeFilters.specialty = e.target.value;
      this.syncCategoryPills(e.target.value);
      this.renderDoctors();
    });

    this.facilitySelect?.addEventListener("change", (e) => {
      this.activeFilters.facilityType = e.target.value;
      this.renderDoctors();
    });

    this.modeSelect?.addEventListener("change", (e) => {
      this.activeFilters.consultationMode = e.target.value;
      this.renderDoctors();
    });

    this.sortSelect?.addEventListener("change", (e) => {
      this.activeFilters.sortBy = e.target.value;
      this.renderDoctors();
    });

    // Reset button
    this.resetBtn?.addEventListener("click", () => {
      this.resetFilters();
    });

    // Hero quick search form
    this.heroSearchForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const heroQuery = document.getElementById("hero-search-query")?.value.trim().toLowerCase() || "";
      const heroSpec = document.getElementById("hero-search-specialty")?.value || "All";
      const heroMode = document.getElementById("hero-search-mode")?.value || "All";

      this.activeFilters.query = heroQuery;
      this.activeFilters.specialty = heroSpec;
      this.activeFilters.consultationMode = heroMode;

      if (this.searchInput) this.searchInput.value = heroQuery;
      if (this.specialtySelect) this.specialtySelect.value = heroSpec;
      if (this.modeSelect) this.modeSelect.value = heroMode;

      // Scroll to discovery section
      const target = document.getElementById("find-doctors");
      target?.scrollIntoView({ behavior: "smooth" });
      this.renderDoctors();
    });

    // Event delegation on doctor cards (Request Appointment & View Details)
    this.gridContainer?.addEventListener("click", (e) => {
      const bookBtn = e.target.closest(".btn-book-appointment");
      if (bookBtn) {
        const doctorId = bookBtn.dataset.doctorId;
        this.app.appointmentsModule?.openBookingModal(doctorId);
        return;
      }

      const detailsBtn = e.target.closest(".btn-view-doctor-profile");
      if (detailsBtn) {
        const doctorId = detailsBtn.dataset.doctorId;
        this.openDoctorModal(doctorId);
        return;
      }
    });
  }

  resetFilters() {
    this.activeFilters = {
      query: "",
      specialty: "All",
      facilityType: "All",
      consultationMode: "All",
      sortBy: "recommended"
    };

    if (this.searchInput) this.searchInput.value = "";
    if (this.specialtySelect) this.specialtySelect.value = "All";
    if (this.facilitySelect) this.facilitySelect.value = "All";
    if (this.modeSelect) this.modeSelect.value = "All";
    if (this.sortSelect) this.sortSelect.value = "recommended";

    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    document.querySelector('.filter-chip[data-specialty="All"]')?.classList.add("active");

    this.renderDoctors();
  }

  filterDoctors() {
    let list = this.providers.filter(p => {
      // Query search
      if (this.activeFilters.query) {
        const q = this.activeFilters.query;
        const matchesQuery = 
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.secondarySpecialty?.toLowerCase().includes(q) ||
          p.facility.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Specialty filter
      if (this.activeFilters.specialty !== "All") {
        if (p.specialty !== this.activeFilters.specialty) return false;
      }

      // Facility Type filter
      if (this.activeFilters.facilityType !== "All") {
        if (p.facilityType !== this.activeFilters.facilityType) return false;
      }

      // Consultation Mode filter
      if (this.activeFilters.consultationMode !== "All") {
        if (!p.consultationModes.includes(this.activeFilters.consultationMode)) return false;
      }

      return true;
    });

    // Sorting
    if (this.activeFilters.sortBy === "fee-low") {
      list.sort((a, b) => (a.fee.inPerson || a.fee.video) - (b.fee.inPerson || b.fee.video));
    } else if (this.activeFilters.sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.activeFilters.sortBy === "experience") {
      list.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    }

    return list;
  }

  renderDoctors() {
    if (!this.gridContainer) return;
    const filtered = this.filterDoctors();

    if (this.countBanner) {
      this.countBanner.textContent = `Showing ${filtered.length} verified healthcare provider${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-xl); border: 1px dashed var(--color-border);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: var(--font-xl); margin-bottom: 0.5rem;">No healthcare providers found</h3>
          <p style="color: var(--color-text-secondary); max-width: 480px; margin: 0 auto 1.5rem auto;">
            We couldn't find any providers matching your current filter criteria. Try adjusting your keywords, changing specialties, or clearing filters.
          </p>
          <button class="btn btn-outline" id="btn-empty-reset">Clear All Filters</button>
        </div>
      `;
      document.getElementById("btn-empty-reset")?.addEventListener("click", () => this.resetFilters());
      return;
    }

    this.gridContainer.innerHTML = filtered.map(doc => {
      const modeBadges = doc.consultationModes.map(m => 
        m === 'in-person' ? `<span class="badge badge-mode">🏥 In-Person</span>` : `<span class="badge badge-mode">💻 Video Consult</span>`
      ).join(" ");

      return `
        <article class="doctor-card fade-in" id="card-${doc.id}">
          <div class="doctor-card-header">
            <div class="doctor-avatar-wrapper">
              <img src="${doc.image}" alt="${doc.name}" class="doctor-avatar-img" onerror="this.onerror=null; this.src='assets/images/doctor_sarah_mitchell.jpg';" />
              <div class="doctor-badge-online" title="Accepting new patients"></div>
            </div>
            <div class="doctor-meta">
              <div class="flex items-center gap-2" style="flex-wrap: wrap;">
                <span class="badge badge-demo">Sample Demo Record</span>
              </div>
              <h3 class="doctor-name">${doc.name}</h3>
              <div class="doctor-specialty">${doc.specialty}</div>
              <div class="doctor-degree">${doc.degree}</div>
              <div class="doctor-ratings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>${doc.rating}</span>
                <span style="color: var(--color-text-muted); font-weight: normal;">(${doc.reviewsCount} verified reviews)</span>
              </div>
            </div>
          </div>

          <div class="doctor-card-body">
            <div class="doctor-detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <div>
                <strong>${doc.facility}</strong>
                <div style="color: var(--color-text-muted); font-size: 0.75rem;">${doc.address} • <em>${doc.distance}</em></div>
              </div>
            </div>

            <div class="flex items-center gap-2" style="flex-wrap: wrap; margin-top: 2px;">
              ${modeBadges}
            </div>

            <div class="doctor-fee-tag">
              <span>Consultation: $${doc.fee.inPerson || doc.fee.video}</span>
              <small style="color: var(--color-text-muted); font-weight: 500;">Transparent rate</small>
            </div>

            <div class="next-slot-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Next Available: ${doc.nextAvailable}</span>
            </div>
          </div>

          <div class="doctor-card-footer">
            <button class="btn btn-primary btn-sm btn-book-appointment" style="flex: 1;" data-doctor-id="${doc.id}">
              Request Appointment
            </button>
            <button class="btn btn-outline btn-sm btn-view-doctor-profile" data-doctor-id="${doc.id}" title="View Full Profile">
              View Profile
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  renderCategories() {
    if (!this.categoriesContainer) return;
    this.categoriesContainer.innerHTML = SERVICE_CATEGORIES.map(cat => `
      <div class="category-card" data-specialty="${cat.specialty}">
        <div class="category-icon">${cat.icon}</div>
        <h4 class="category-title">${cat.name}</h4>
        <p class="category-desc">${cat.desc}</p>
        <div class="category-count">
          <span>${cat.doctorCount} Specialist${cat.doctorCount > 1 ? 's' : ''}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    `).join("");

    this.categoriesContainer.querySelectorAll(".category-card").forEach(card => {
      card.addEventListener("click", () => {
        const spec = card.dataset.specialty;
        this.activeFilters.specialty = spec;
        if (this.specialtySelect) this.specialtySelect.value = spec;
        this.syncCategoryPills(spec);
        document.getElementById("find-doctors")?.scrollIntoView({ behavior: "smooth" });
        this.renderDoctors();
      });
    });
  }

  syncCategoryPills(activeSpecialty) {
    document.querySelectorAll(".filter-chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.specialty === activeSpecialty);
    });
  }

  openDoctorModal(doctorId) {
    const doc = this.providers.find(p => p.id === doctorId);
    if (!doc) return;

    const modalBody = document.getElementById("provider-profile-body");
    const modalTitle = document.getElementById("provider-profile-title");

    if (modalTitle) modalTitle.textContent = `${doc.name} — Full Profile`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <img src="${doc.image}" alt="${doc.name}" style="width: 100px; height: 100px; border-radius: var(--radius-lg); object-fit: cover; border: 2px solid var(--color-border);" onerror="this.onerror=null; this.src='assets/images/doctor_sarah_mitchell.jpg';" />
          <div style="flex: 1;">
            <div class="flex items-center gap-2" style="margin-bottom: 4px;">
              <span class="badge badge-demo">Sample Demonstration Record</span>
              <span class="badge badge-verified">Verified Provider</span>
            </div>
            <h3 style="font-size: var(--font-xl); margin-bottom: 2px;">${doc.name}</h3>
            <div style="color: var(--color-primary); font-weight: 700;">${doc.specialty} • ${doc.secondarySpecialty}</div>
            <div style="font-size: var(--font-xs); color: var(--color-text-muted); margin-bottom: 6px;">${doc.degree} • ${doc.experience}</div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: var(--font-sm); font-weight: 600;">
              <span style="color: #F59E0B;">★ ${doc.rating}</span>
              <span style="color: var(--color-text-muted); font-weight: normal;">(${doc.reviewsCount} patient reviews)</span>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <h4 style="font-size: var(--font-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-dark); margin-bottom: 0.35rem;">About Doctor</h4>
            <p style="font-size: var(--font-sm); color: var(--color-text-secondary); line-height: 1.6;">${doc.bio}</p>
          </div>

          <div style="background-color: var(--color-surface-alt); padding: 1rem; border-radius: var(--radius-md);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: var(--font-xs);">
              <div>
                <strong style="display: block; color: var(--color-text-main); margin-bottom: 2px;">Facility Location:</strong>
                <span style="color: var(--color-text-secondary);">${doc.facility}</span><br>
                <span style="color: var(--color-text-muted);">${doc.address}</span>
              </div>
              <div>
                <strong style="display: block; color: var(--color-text-main); margin-bottom: 2px;">Consultation Fees:</strong>
                <span style="color: var(--color-primary-dark); font-weight: 700;">$${doc.fee.inPerson} In-Person</span><br>
                <span style="color: var(--color-primary-dark); font-weight: 700;">$${doc.fee.video} Video Telehealth</span>
              </div>
              <div>
                <strong style="display: block; color: var(--color-text-main); margin-bottom: 2px;">Education & Training:</strong>
                <span style="color: var(--color-text-secondary);">${doc.education}</span>
              </div>
              <div>
                <strong style="display: block; color: var(--color-text-main); margin-bottom: 2px;">Hospital Affiliations:</strong>
                <span style="color: var(--color-text-secondary);">${doc.hospitalAffiliations}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style="font-size: var(--font-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-dark); margin-bottom: 0.5rem;">Accepted Insurance Plans</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${doc.acceptedInsurances.map(ins => `<span class="badge" style="background-color: #E0F2FE; color: #0369A1;">${ins}</span>`).join("")}
            </div>
          </div>

          <div style="padding-top: 1rem; border-top: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: var(--font-xs); color: var(--color-text-muted); display: block;">Next slot available</span>
              <strong style="color: var(--color-text-main); font-size: var(--font-sm);">${doc.nextAvailable}</strong>
            </div>
            <button class="btn btn-primary" id="btn-modal-book-now" data-doctor-id="${doc.id}">
              Request Appointment With ${doc.name}
            </button>
          </div>
        </div>
      `;

      document.getElementById("btn-modal-book-now")?.addEventListener("click", () => {
        this.app.closeModal("provider-profile-modal");
        this.app.appointmentsModule?.openBookingModal(doc.id);
      });
    }

    this.app.openModal("provider-profile-modal");
  }

  getDoctorById(id) {
    return this.providers.find(p => p.id === id);
  }
}
