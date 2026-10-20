/**
 * CareConnect - AI Health Information Assistant (CareBot)
 * Developed by Team TECH NOVA
 */

import { CLINICAL_TOPICS, EMERGENCY_RED_FLAGS, SUGGESTED_PROMPT_PILLS, MEDICAL_DISCLAIMER_TEXT } from "../data/healthKnowledge.js";

export class CareBotModule {
  constructor(app) {
    this.app = app;
    this.messages = [];
    this.synth = window.speechSynthesis || null;
    this.initElements();
    this.bindEvents();
    this.initWelcomeMessage();
    this.renderPromptPills();
  }

  initElements() {
    this.chatContainer = document.getElementById("carebot-messages");
    this.chatForm = document.getElementById("carebot-form");
    this.chatInput = document.getElementById("carebot-input");
    this.pillsContainer = document.getElementById("carebot-prompt-pills");
    this.btnClearChat = document.getElementById("btn-clear-chat");
    this.btnStopSpeech = document.getElementById("btn-stop-speech");
  }

  bindEvents() {
    this.chatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = this.chatInput?.value.trim();
      if (!text) return;
      this.handleUserMessage(text);
      if (this.chatInput) this.chatInput.value = "";
    });

    this.btnClearChat?.addEventListener("click", () => {
      if (confirm("Reset conversation history with CareBot?")) {
        this.messages = [];
        this.stopSpeech();
        this.initWelcomeMessage();
      }
    });

    this.btnStopSpeech?.addEventListener("click", () => {
      this.stopSpeech();
    });

    // Delegate message action buttons (Read Aloud, Copy, Find Specialist)
    this.chatContainer?.addEventListener("click", (e) => {
      const speechBtn = e.target.closest(".btn-speech-read");
      if (speechBtn) {
        const textToRead = decodeURIComponent(speechBtn.dataset.readText);
        this.speakText(textToRead);
        return;
      }

      const copyBtn = e.target.closest(".btn-copy-chat");
      if (copyBtn) {
        const rawText = decodeURIComponent(copyBtn.dataset.copyText);
        navigator.clipboard?.writeText(rawText);
        this.app.showToast("Copied to Clipboard", "Health information copied to your clipboard.", "info");
        return;
      }

      const specialistBtn = e.target.closest(".btn-carebot-find-specialist");
      if (specialistBtn) {
        const spec = specialistBtn.dataset.specialty;
        if (this.app.doctorsModule) {
          this.app.doctorsModule.activeFilters.specialty = spec;
          if (this.app.doctorsModule.specialtySelect) this.app.doctorsModule.specialtySelect.value = spec;
          this.app.doctorsModule.syncCategoryPills(spec);
          this.app.doctorsModule.renderDoctors();
        }
        document.getElementById("find-doctors")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    });
  }

  initWelcomeMessage() {
    if (!this.chatContainer) return;

    this.chatContainer.innerHTML = "";
    const welcomeHtml = `
      <div class="chat-bubble bot fade-in">
        <div class="bubble-content">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary); color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">🤖</div>
            <strong style="color: var(--color-primary-dark); font-size: var(--font-sm);">CareBot — Smart Health Information Assistant</strong>
          </div>
          <p style="margin-bottom: 8px;">
            Hello! I am CareBot, developed by <strong>Team TECH NOVA</strong>. I'm here to help you navigate medical guidelines, prepare for doctor visits, understand lab tests, and manage wellness schedules.
          </p>
          <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; padding: 8px 12px; border-radius: var(--radius-md); font-size: 0.75rem; color: #92400E; margin-bottom: 8px;">
            ⚠️ <strong>Medical Disclaimer:</strong> CareBot provides general educational information and cannot replace clinical judgment from a physician. If experiencing an emergency, dial 911 immediately.
          </div>
          <p style="margin-bottom: 4px; font-weight: 600; font-size: var(--font-xs); color: var(--color-text-main);">
            Try selecting a common question below or type your health question:
          </p>
        </div>
        <span class="chat-timestamp">${this.formatTime(new Date())}</span>
      </div>
    `;

    this.chatContainer.innerHTML = welcomeHtml;
  }

  renderPromptPills() {
    if (!this.pillsContainer) return;
    this.pillsContainer.innerHTML = SUGGESTED_PROMPT_PILLS.map(prompt => `
      <button class="carebot-prompt-pill" data-prompt="${prompt}">
        ${prompt}
      </button>
    `).join("");

    this.pillsContainer.querySelectorAll(".carebot-prompt-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const text = pill.dataset.prompt;
        this.handleUserMessage(text);
      });
    });
  }

  handleUserMessage(userText) {
    this.stopSpeech();

    // 1. Append user message bubble
    const userBubble = `
      <div class="chat-bubble user fade-in">
        <div class="bubble-content">${this.escapeHtml(userText)}</div>
        <span class="chat-timestamp">${this.formatTime(new Date())}</span>
      </div>
    `;
    this.chatContainer.insertAdjacentHTML("beforeend", userBubble);
    this.scrollToBottom();

    // 2. Show typing indicator
    const typingId = "typing-" + Date.now();
    const typingBubble = `
      <div class="chat-bubble bot fade-in" id="${typingId}">
        <div class="bubble-content" style="display: flex; gap: 4px; align-items: center; padding: 0.85rem 1.25rem;">
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">CareBot is analyzing evidence-based health guidelines...</div>
        </div>
      </div>
    `;
    this.chatContainer.insertAdjacentHTML("beforeend", typingBubble);
    this.scrollToBottom();

    // 3. Process query with intelligent knowledge matcher
    setTimeout(() => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      const response = this.generateResponse(userText);
      this.appendBotResponse(response);
    }, 450);
  }

  generateResponse(query) {
    const q = query.toLowerCase();

    // Check emergency red flags first
    const emergencyMatch = EMERGENCY_RED_FLAGS.find(flag => q.includes(flag));
    if (emergencyMatch) {
      return {
        isEmergency: true,
        title: "URGENT MEDICAL ALERT",
        summary: `Your message mentions '${emergencyMatch}', which can represent a serious or life-threatening medical emergency.`,
        keyPoints: [
          "Do NOT wait for online replies or delay seeking medical care.",
          "Call 911 (or your local emergency services) immediately.",
          "If you are alone, unlock your front door so emergency responders can enter.",
          "Do not attempt to drive yourself to the hospital if experiencing chest pain, dizziness, or severe breathlessness."
        ],
        emergencyWarning: "Call 911 immediately or go to the nearest emergency room.",
        suggestedSpecialty: "General Medicine"
      };
    }

    // Match topics by keywords
    let bestMatch = null;
    let highestScore = 0;

    for (const topic of CLINICAL_TOPICS) {
      let score = 0;
      for (const kw of topic.keywords) {
        if (q.includes(kw)) score += 3;
      }
      if (topic.title.toLowerCase().split(" ").some(word => word.length > 3 && q.includes(word))) {
        score += 2;
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = topic;
      }
    }

    if (bestMatch && highestScore > 0) {
      return {
        ...bestMatch,
        isEmergency: false
      };
    }

    // Fallback response with helpful structure
    return {
      isEmergency: false,
      title: "General Healthcare Guidance",
      summary: `Thank you for asking about: "${query}". Here is general guidance based on clinical standards:`,
      keyPoints: [
        "Track Your Symptoms: Write down when symptoms began, their severity on a 1-10 scale, and what factors relieve or aggravate them.",
        "Consult a Verified Physician: Personalized medical evaluation is essential for accurate diagnostics. You can use CareConnect's Find Doctors directory to book an in-person or telehealth visit.",
        "Hydration & Rest: For non-acute physical symptoms, maintain proper hydration and adequate sleep while monitoring for any changes."
      ],
      doctorQuestions: [
        "What could be causing these symptoms given my medical background?",
        "Are there specific diagnostic tests you recommend?",
        "What warning symptoms should prompt me to contact you immediately?"
      ],
      emergencyWarning: "If you develop sudden chest pain, shortness of breath, high fever above 103°F, or sudden confusion, seek emergency care immediately.",
      suggestedSpecialty: "General Medicine"
    };
  }

  appendBotResponse(resp) {
    const pointsHtml = resp.keyPoints ? resp.keyPoints.map(p => `<li>${p}</li>`).join("") : "";
    const doctorQuestionsHtml = resp.doctorQuestions && resp.doctorQuestions.length > 0 ? `
      <h5>❓ Questions to Ask Your Doctor:</h5>
      <ul>
        ${resp.doctorQuestions.map(q => `<li>${q}</li>`).join("")}
      </ul>
    ` : "";

    const emergencyBanner = resp.emergencyWarning ? `
      <div class="carebot-emergency-alert">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <div>${resp.emergencyWarning}</div>
      </div>
    ` : "";

    const specialistAction = resp.suggestedSpecialty ? `
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 0.75rem; color: var(--color-text-secondary);">Need dedicated consultation?</span>
        <button class="btn btn-outline btn-sm btn-carebot-find-specialist" data-specialty="${resp.suggestedSpecialty}">
          Find ${resp.suggestedSpecialty} Specialists →
        </button>
      </div>
    ` : "";

    // Text representation for audio speech
    const plainTextForAudio = `${resp.title}. ${resp.summary}. Key Points: ${resp.keyPoints.join(". ")}`;

    const botBubble = `
      <div class="chat-bubble bot fade-in">
        <div class="bubble-content carebot-structured-response ${resp.isEmergency ? 'style="border-color: #EF4444;"' : ''}">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 4px;">
            <div style="font-weight: 700; color: ${resp.isEmergency ? 'var(--color-danger)' : 'var(--color-primary-dark)'}; font-size: var(--font-sm);">
              ${resp.isEmergency ? '🚨 ' : '🩺 '}${resp.title}
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <button class="btn btn-subtle btn-sm btn-speech-read" data-read-text="${encodeURIComponent(plainTextForAudio)}" title="Listen to answer (Read Aloud)">
                🔊 Read Aloud
              </button>
              <button class="btn btn-subtle btn-sm btn-copy-chat" data-copy-text="${encodeURIComponent(plainTextForAudio)}" title="Copy response">
                📋 Copy
              </button>
            </div>
          </div>

          <p style="margin-bottom: 8px; font-weight: 500;">${resp.summary}</p>

          <h5>📋 Key Clinical Information:</h5>
          <ul>
            ${pointsHtml}
          </ul>

          ${doctorQuestionsHtml}
          ${emergencyBanner}
          ${specialistAction}
        </div>
        <span class="chat-timestamp">${this.formatTime(new Date())}</span>
      </div>
    `;

    this.chatContainer.insertAdjacentHTML("beforeend", botBubble);
    this.scrollToBottom();
  }

  speakText(text) {
    if (!this.synth) {
      this.app.showToast("Speech Unavailable", "Text-to-speech is not supported on this browser.", "info");
      return;
    }
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    this.synth.speak(utterance);
    this.app.showToast("Speaking", "Playing audio reading...", "info");
  }

  stopSpeech() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
