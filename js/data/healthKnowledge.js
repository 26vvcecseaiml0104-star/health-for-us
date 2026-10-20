/**
 * CareConnect - Clinical Knowledge Engine for CareBot AI Assistant
 * Developed by Team TECH NOVA
 * 
 * DISCLAIMER: This knowledge base provides educational health information.
 * It does not furnish medical diagnoses or emergency triage.
 */

export const MEDICAL_DISCLAIMER_TEXT = 
  "CareBot is an educational health information assistant developed by Team TECH NOVA. It does not provide medical diagnoses, treatment plans, or emergency triage. For life-threatening emergencies, dial 911 (or local emergency services) or visit the nearest emergency facility immediately.";

export const SUGGESTED_PROMPT_PILLS = [
  "How can I prepare for a blood test?",
  "What is the difference between Urgent Care and the ER?",
  "Tips for managing high blood pressure at home",
  "How do I prepare for an annual physical exam?",
  "Signs of seasonal allergies vs. common cold",
  "Questions to ask my doctor during a cardiology visit",
  "How can I organize medications for an elderly parent?"
];

export const CLINICAL_TOPICS = [
  {
    id: "blood-test-prep",
    keywords: ["blood test", "lab test", "fasting", "bloodwork", "lab work", "cholesterol test"],
    title: "Preparing for a Blood or Laboratory Test",
    summary: "Proper preparation ensures accurate laboratory results and avoids the need for repeat testing.",
    keyPoints: [
      "Fasting Requirements: If fasting is ordered (common for Lipid Panels and Glucose tests), abstain from food and beverages other than plain water for 8 to 12 hours prior to the draw.",
      "Hydration: Drink plenty of plain water unless restricted. Good hydration plumps veins, making the blood draw smoother and less uncomfortable.",
      "Medication Instructions: Ask your prescribing physician whether to take morning medications before or after the test.",
      "Avoid Heavy Exercise & Alcohol: Strenuous exercise and alcohol within 24 hours can temporarily alter liver enzyme and electrolyte readings."
    ],
    doctorQuestions: [
      "Do I need to hold my blood pressure or diabetes medication before this draw?",
      "When and how will my results be communicated (patient portal or follow-up visit)?",
      "Are there specific vitamins or supplements (like Biotin) I should stop taking beforehand?"
    ],
    emergencyWarning: null,
    suggestedSpecialty: "General Medicine"
  },
  {
    id: "urgent-care-vs-er",
    keywords: ["urgent care", "emergency room", "er", "hospital", "where to go", "walk in"],
    title: "Understanding Urgent Care vs. Emergency Room (ER)",
    summary: "Choosing the appropriate care setting saves critical time, reduces out-of-pocket costs, and ensures proper medical resources are matched to your needs.",
    keyPoints: [
      "Go to the Emergency Room (ER) for: Chest pain or pressure, sudden numbness or weakness on one side of body, difficulty breathing, severe bleeding, sudden vision loss, severe head trauma, or suspected poisoning.",
      "Go to Urgent Care for: Minor cuts needing stitches, sprains and minor fractures, mild to moderate asthma flare-ups, low-grade fever with flu symptoms, ear infections, minor burns, or urinary tract discomfort.",
      "Go to Primary Care (CareConnect Portal) for: Annual physicals, ongoing chronic illness management, prescription refills, and non-urgent wellness concerns."
    ],
    doctorQuestions: [
      "Can I receive an X-ray or rapid laboratory swab at your urgent care facility?",
      "If my condition worsens after urgent care discharge, what symptoms warrant an ER visit?"
    ],
    emergencyWarning: "If you suspect a stroke (FAST signs: Face drooping, Arm weakness, Slurred speech, Time to call 911) or heart attack, call 911 immediately — never drive yourself.",
    suggestedSpecialty: "General Medicine"
  },
  {
    id: "hypertension-management",
    keywords: ["blood pressure", "hypertension", "bp", "high blood pressure", "systolic", "diastolic"],
    title: "Managing High Blood Pressure & Home Tracking",
    summary: "Consistent monitoring and sustainable lifestyle choices are foundational to cardiovascular wellness.",
    keyPoints: [
      "Accurate Home Readings: Rest quietly for 5 minutes before measuring. Keep feet flat on the floor, support your arm at heart level, and avoid caffeine or exercise 30 minutes prior.",
      "Target Ranges: For most non-pregnant adults, normal blood pressure is below 120/80 mmHg. Discuss your personal target with your physician.",
      "DASH Nutrition Pattern: Prioritize leafy vegetables, potassium-rich foods, whole grains, and lean proteins while limiting sodium to under 2,000 mg/day.",
      "Medication Consistency: Take prescribed antihypertensives at the same time daily. Use CareConnect's Medication Reminders to avoid skipped doses."
    ],
    doctorQuestions: [
      "What is my specific target blood pressure based on my age and medical history?",
      "Should I bring my home blood pressure monitor to my next visit to verify its calibration?",
      "What threshold reading should trigger an urgent call to your clinic?"
    ],
    emergencyWarning: "A blood pressure reading over 180/120 mmHg accompanied by chest pain, shortness of breath, back pain, or vision changes is a Hypertensive Crisis. Call 911 immediately.",
    suggestedSpecialty: "Cardiology"
  },
  {
    id: "annual-physical-prep",
    keywords: ["annual physical", "checkup", "routine visit", "doctor visit", "prepare for visit", "prepare for appointment"],
    title: "How to Prepare for Your Annual Physical Exam",
    summary: "Being prepared empowers you to maximize face-to-face time with your physician and address all key health goals.",
    keyPoints: [
      "Medication & Supplement Inventory: Bring an updated list of all prescriptions, over-the-counter medications, herbal remedies, and exact dosages.",
      "Prioritized Question List: Write down your top 2 or 3 health priorities or symptoms you wish to discuss first.",
      "Family Medical History: Note any new diagnoses among first-degree relatives (parents, siblings, children) such as diabetes, heart disease, or cancer.",
      "Preventive Milestones: Inquire about recommended screenings based on your age and risk factors (mammograms, colonoscopies, bone density scans, vaccines)."
    ],
    doctorQuestions: [
      "Are all my adult immunizations (Tetanus, Flu, COVID, Shingles) up to date?",
      "Based on my family history, are there additional preventive screenings I should schedule?",
      "What simple lifestyle change would have the greatest impact on my longevity?"
    ],
    emergencyWarning: null,
    suggestedSpecialty: "General Medicine"
  },
  {
    id: "allergies-vs-cold",
    keywords: ["allergy", "allergies", "cold", "flu", "cough", "sneezing", "congestion", "runny nose"],
    title: "Differentiating Seasonal Allergies from Common Cold & Flu",
    summary: "Identifying the root cause of respiratory symptoms helps you select the right relief and avoid inappropriate antibiotic use.",
    keyPoints: [
      "Itchiness: Itchy eyes, itchy palate, and itchy inner ears are hallmark symptoms of allergic rhinitis, rarely seen with viral colds.",
      "Fever: Seasonal allergies NEVER cause a fever. A fever suggests an infectious viral or bacterial process.",
      "Duration: Colds typically peak within 3-5 days and resolve in 7-10 days. Allergies persist as long as allergen exposure (pollen, dust mites, pet dander) continues.",
      "Nasal Discharge: Allergies usually produce thin, clear, watery mucus; viral colds often transition to thicker discolored secretions."
    ],
    doctorQuestions: [
      "Would non-drowsy antihistamines or a steroid nasal spray provide superior symptom control for me?",
      "Would an allergy scratch test or blood panel identify my specific environmental triggers?"
    ],
    emergencyWarning: "If breathing difficulty, wheezing, throat swelling, or facial swelling occurs, seek emergency care immediately for possible severe anaphylaxis.",
    suggestedSpecialty: "General Medicine"
  },
  {
    id: "elderly-medication-safety",
    keywords: ["organize medication", "elderly", "parent", "pill organizer", "medication schedule", "adherence", "reminders"],
    title: "Safe Medication Management for Seniors & Families",
    summary: "Organized medication routines prevent accidental duplicate dosing, drug interactions, and hospital readmissions.",
    keyPoints: [
      "Single Master List: Maintain one centralized list of all active medications with doctor names, pharmacy details, and instructions.",
      "Clear Pill Organizers: Use high-contrast, multi-compartment organizers (Morning / Noon / Evening / Bedtime) filled once weekly.",
      "Digital Reminders: Configure audio and visual alerts using CareConnect's Medication Reminders feature.",
      "Safe Storage: Keep medications in a cool, dry place away from direct bathroom humidity, and store look-alike bottles on separate shelves.",
      "Pharmacy Alignment: Request synchronized refills from your pharmacy so all maintenance medications renew on the exact same day of the month."
    ],
    doctorQuestions: [
      "Can we conduct a comprehensive 'Brown Bag' medication review to discontinue any unneeded prescriptions?",
      "Are any of these medications associated with increased fall risks or daytime sedation?"
    ],
    emergencyWarning: null,
    suggestedSpecialty: "General Medicine"
  },
  {
    id: "cardiology-visit-questions",
    keywords: ["cardiology", "heart", "cardiologist", "chest", "palpitations", "shortness of breath", "heart attack"],
    title: "Key Questions & Advice for a Cardiology Consultation",
    summary: "Your cardiovascular consultation is a pivotal opportunity to understand heart health metrics and proactive prevention.",
    keyPoints: [
      "Symptom Diary: Log exact triggers, duration, and sensations (e.g. fluttering, heaviness during stair climbing, swelling in ankles).",
      "Bring Past Cardiac Records: Bring prior ECG tracings, echocardiogram reports, or Holter monitor summaries if transferring care.",
      "Dietary Clarification: Understand sodium and fluid intake limits tailored to your heart function."
    ],
    doctorQuestions: [
      "What do my diagnostic tests indicate about my heart valve and pumping efficiency?",
      "What safe intensity of physical exercise do you advise for my condition?",
      "Are there potential interactions between my cardiac prescriptions and over-the-counter NSAIDs?"
    ],
    emergencyWarning: "Chest pain, pressure radiating to the jaw, neck, back, or left arm, accompanied by cold sweats or nausea is an emergency: call 911 immediately.",
    suggestedSpecialty: "Cardiology"
  },
  {
    id: "persistent-fever-cough",
    keywords: ["fever", "persistent cough", "pneumonia", "bronchitis", "high temperature", "chills"],
    title: "Evaluating a Persistent Cough and Fever",
    summary: "While many coughs are self-limiting, specific warning signs indicate the need for clinical auscultation and chest imaging.",
    keyPoints: [
      "Adult Fever Criteria: A persistent temperature above 102°F (38.9°C) that fails to respond to antipyretics warrants medical review.",
      "Duration: Any cough persisting longer than 3 weeks requires physician evaluation to rule out post-infectious bronchitis, asthma, or underlying conditions.",
      "Supportive Care: Rest, warm steam inhalation, honey (for individuals over 1 year of age), and adequate hydration loosen secretions."
    ],
    doctorQuestions: [
      "Do I need a chest radiograph (X-ray) or rapid respiratory pathogen PCR panel?",
      "Would a prescription inhaler help reduce airway bronchial spasms?"
    ],
    emergencyWarning: "Coughing up significant blood, experiencing severe shortness of breath, or developing blue-tinted lips/fingertips requires immediate emergency room evaluation.",
    suggestedSpecialty: "General Medicine"
  }
];

export const EMERGENCY_RED_FLAGS = [
  "chest pain", "pressure in chest", "heart attack", "stroke", "face drooping",
  "slurred speech", "cannot breathe", "severe difficulty breathing", "choking",
  "coughing up blood", "passed out", "unconscious", "anaphylaxis", "severe allergic reaction",
  "blue lips", "sudden paralysis", "worst headache of my life"
];
