/**
 * CareConnect - Local Storage & Data Persistence Manager
 * Developed by Team TECH NOVA
 * 
 * Provides robust CRUD operations with initial realistic demonstration accounts.
 * Strictly isolates patient data per logged-in user.
 */

const STORAGE_KEYS = {
  CURRENT_USER: "careconnect_current_user_v1",
  USERS: "careconnect_users_v1",
  APPOINTMENTS: "careconnect_appointments_v1",
  MEDICATIONS: "careconnect_medications_v1",
  SETTINGS: "careconnect_settings_v1"
};

// Seed Users
const SEED_USERS = [
  {
    id: "user-sarah-jenkins",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    password: "Password123!",
    phone: "(206) 555-0182",
    location: "Seattle, WA",
    demographic: "Working Professional",
    preferences: {
      preferredMode: "video",
      notificationMethod: "email",
      language: "English",
      emergencyContactName: "David Jenkins (Spouse)",
      emergencyContactPhone: "(206) 555-0199"
    }
  },
  {
    id: "user-robert-chen",
    name: "Robert Chen",
    email: "robert.chen@example.com",
    password: "Password123!",
    phone: "(206) 555-0194",
    location: "Seattle, WA",
    demographic: "Elderly Patient & Medicare Beneficiary",
    preferences: {
      preferredMode: "in-person",
      notificationMethod: "sms",
      language: "English",
      emergencyContactName: "Linda Chen (Daughter)",
      emergencyContactPhone: "(206) 555-0177"
    }
  }
];

// Seed Appointments
const SEED_APPOINTMENTS = [
  {
    id: "apt-101",
    userId: "user-sarah-jenkins",
    doctorId: "doc-sarah-mitchell",
    doctorName: "Dr. Sarah Mitchell",
    doctorSpecialty: "General Medicine",
    doctorImage: "assets/images/doctor_sarah_mitchell.jpg",
    facility: "Seattle Metro Community Health Clinic",
    date: getFutureDate(1), // Tomorrow
    time: "09:30 AM",
    consultationType: "video",
    visitReason: "Annual preventive wellness checkup & cholesterol screening review",
    status: "Confirmed", // Statuses: "Pending Confirmation", "Confirmed", "Completed", "Cancelled"
    fee: 85,
    createdAt: new Date().toISOString(),
    notes: "Video link will be activated 10 minutes prior to call."
  },
  {
    id: "apt-102",
    userId: "user-sarah-jenkins",
    doctorId: "doc-arjun-patel",
    doctorName: "Dr. Arjun Patel",
    doctorSpecialty: "Dermatology",
    doctorImage: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    facility: "Cascadia Dermatology & Skin Clinic",
    date: getFutureDate(4),
    time: "02:00 PM",
    consultationType: "in-person",
    visitReason: "Evaluation of mild dry patch on right arm",
    status: "Pending Confirmation",
    fee: 140,
    createdAt: new Date().toISOString(),
    notes: "Clinic reviewing scheduling request."
  },
  {
    id: "apt-201",
    userId: "user-robert-chen",
    doctorId: "doc-marcus-vance",
    doctorName: "Dr. Marcus Vance",
    doctorSpecialty: "Cardiology",
    doctorImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    facility: "Northwest Heart & Vascular Institute",
    date: getFutureDate(2),
    time: "11:30 AM",
    consultationType: "in-person",
    visitReason: "Routine 6-month blood pressure and medication evaluation",
    status: "Confirmed",
    fee: 165,
    createdAt: new Date().toISOString(),
    notes: "Please bring current blood pressure tracking log."
  }
];

// Seed Medications
const SEED_MEDICATIONS = [
  {
    id: "med-1",
    userId: "user-sarah-jenkins",
    name: "Lisinopril",
    dosage: "10 mg",
    frequency: "Once Daily",
    timeOfDay: "08:00 AM",
    instructions: "Take in the morning with a full glass of water",
    prescribedFor: "Blood pressure regulation",
    adherenceHistory: {}, // { "2026-10-20": true }
    active: true
  },
  {
    id: "med-2",
    userId: "user-sarah-jenkins",
    name: "Vitamin D3",
    dosage: "2000 IU",
    frequency: "Once Daily",
    timeOfDay: "08:00 AM",
    instructions: "Take with breakfast or meal containing healthy fats",
    prescribedFor: "Bone health & immune support",
    adherenceHistory: {},
    active: true
  },
  {
    id: "med-3",
    userId: "user-robert-chen",
    name: "Metformin ER",
    dosage: "500 mg",
    frequency: "Twice Daily",
    timeOfDay: "08:00 AM & 06:00 PM",
    instructions: "Take with meals to minimize gastrointestinal discomfort",
    prescribedFor: "Blood glucose management",
    adherenceHistory: {},
    active: true
  },
  {
    id: "med-4",
    userId: "user-robert-chen",
    name: "Atorvastatin",
    dosage: "20 mg",
    frequency: "Once Daily",
    timeOfDay: "09:00 PM",
    instructions: "Take at bedtime",
    prescribedFor: "Cholesterol & cardiovascular health",
    adherenceHistory: {},
    active: true
  }
];

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    // Seed default data if not present
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(SEED_MEDICATIONS));
    }
    // Set default active demo user if none set
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
    }
  }

  // Current User Session
  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : SEED_USERS[0];
    } catch (e) {
      return SEED_USERS[0];
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("careconnect:user-changed", { detail: user }));
  }

  clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new CustomEvent("careconnect:user-changed", { detail: null }));
  }

  // Users Management
  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch (e) {
      return [];
    }
  }

  findUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  saveUser(user) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (this.getCurrentUser()?.id === user.id) {
      this.setCurrentUser(user);
    }
    return user;
  }

  // Appointments (Filtered by Active User)
  getUserAppointments(userId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
      return all.filter(a => a.userId === userId);
    } catch (e) {
      return [];
    }
  }

  saveAppointment(appointment) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
    // Ensure unique ID
    if (!appointment.id) {
      appointment.id = "apt-" + Date.now();
    }
    if (!appointment.createdAt) {
      appointment.createdAt = new Date().toISOString();
    }
    all.unshift(appointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("careconnect:appointments-updated"));
    return appointment;
  }

  updateAppointmentStatus(id, newStatus, extraNotes = "") {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
    const index = all.findIndex(a => a.id === id);
    if (index >= 0) {
      all[index].status = newStatus;
      if (extraNotes) {
        all[index].notes = extraNotes;
      }
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent("careconnect:appointments-updated"));
      return all[index];
    }
    return null;
  }

  rescheduleAppointment(id, newDate, newTime) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
    const index = all.findIndex(a => a.id === id);
    if (index >= 0) {
      all[index].date = newDate;
      all[index].time = newTime;
      all[index].status = "Pending Confirmation"; // Return to pending on reschedule
      all[index].notes = "Reschedule requested by patient. Awaiting clinic reconfirmation.";
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent("careconnect:appointments-updated"));
      return all[index];
    }
    return null;
  }

  // Check booking conflict for doctor on date & time
  isSlotBooked(doctorId, date, time) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
    return all.some(a => 
      a.doctorId === doctorId && 
      a.date === date && 
      a.time === time && 
      a.status !== "Cancelled"
    );
  }

  // Medications (Filtered by Active User)
  getUserMedications(userId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) || [];
      return all.filter(m => m.userId === userId && m.active !== false);
    } catch (e) {
      return [];
    }
  }

  saveMedication(med) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) || [];
    if (!med.id) {
      med.id = "med-" + Date.now();
    }
    if (!med.adherenceHistory) {
      med.adherenceHistory = {};
    }
    all.push(med);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("careconnect:medications-updated"));
    return med;
  }

  toggleMedicationDose(medId, dateStr = new Date().toISOString().split("T")[0]) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) || [];
    const med = all.find(m => m.id === medId);
    if (med) {
      if (!med.adherenceHistory) med.adherenceHistory = {};
      med.adherenceHistory[dateStr] = !med.adherenceHistory[dateStr];
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent("careconnect:medications-updated"));
      return med.adherenceHistory[dateStr];
    }
    return false;
  }

  deleteMedication(medId) {
    let all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) || [];
    all = all.filter(m => m.id !== medId);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("careconnect:medications-updated"));
  }

  // Reset to original demo data
  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(SEED_MEDICATIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
    window.location.reload();
  }
}

export const storage = new StorageManager();
