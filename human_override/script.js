// Frontend-only prototype: no storage, cookies, network requests, or external APIs are used.
const form = document.getElementById("guidance-form");
const validationSummary = document.getElementById("validation-summary");
const resultsSection = document.getElementById("urgency-results");
const resultEmpty = document.getElementById("result-empty");
const resultCard = document.getElementById("result-card");
const resultPill = document.getElementById("result-pill");
const resultTitle = document.getElementById("result-title");
const resultExplanation = document.getElementById("result-explanation");
const resultReasons = document.getElementById("result-reasons");
const resultNextSteps = document.getElementById("result-next-steps");
const resultHumanReminder = document.getElementById("result-human-reminder");
const emergencyWarning = document.getElementById("emergency-warning");
const emergencyWarningText = document.getElementById("emergency-warning-text");
const startOverButton = document.getElementById("start-over");
const mockConsultButton = document.getElementById("mock-consult-button");
const mockConsultFeedback = document.getElementById("mock-consult-feedback");
const redFlagCheckboxes = [...document.querySelectorAll('input[name="redFlags"]')];
const revealItems = document.querySelectorAll(".reveal");

const ageRangeField = document.getElementById("age-range");
const durationField = document.getElementById("duration");
const mainSymptomField = document.getElementById("main-symptom");
const severityGroup = document.getElementById("severity-group");

const RESULT_EMPTY_DEFAULT =
  "Complete the symptom checker to view Low, Moderate, or Urgent guidance.";
const RESULT_EMPTY_CHANGED =
  "Inputs changed. Run Check Urgency again to view updated simulated guidance.";

const resultContent = {
  Low: {
    title: "Low urgency guidance",
    explanation:
      "The current input did not match a red-flag warning sign and the reported severity stayed in the lower range. This does not rule out other causes or future changes.",
    nextSteps: [
      "Monitor how symptoms change over the next day or two.",
      "Consider seeking medical advice if symptoms persist, worsen, or start affecting daily activities.",
      "Review the emergency red flags if new warning signs appear."
    ],
    humanReminder:
      "If symptoms persist, worsen, or concern you, seek advice from a qualified healthcare professional."
  },
  Moderate: {
    title: "Moderate urgency guidance",
    explanation:
      "The prototype marked this as moderate because the symptoms were reported as more intense or longer-lasting. This result is based on simple prototype logic and should not be treated as medical advice, diagnosis, or treatment guidance.",
    nextSteps: [
      "Consider consulting a qualified healthcare professional soon.",
      "Monitor changes carefully and seek earlier help if symptoms worsen or daily activities become difficult.",
      "Review emergency red flags and seek urgent help if any appear."
    ],
    humanReminder:
      "A qualified healthcare professional can provide follow-up questions, examination, and safer next-step advice."
  },
  Urgent: {
    title: "Urgent guidance",
    explanation:
      "One or more red-flag symptoms were selected. Red-flag symptoms may require urgent medical attention and should not be assessed through a prototype alone.",
    nextSteps: [
      "Seek urgent medical help now if symptoms are severe, sudden, or worsening.",
      "Do not rely on this prototype alone for decision-making.",
      "Contact local emergency services or go to an urgent care setting if needed."
    ],
    humanReminder:
      "Urgent or life-threatening symptoms should be assessed by qualified healthcare professionals immediately."
  }
};

function getSeverityLevel() {
  const selected = form.querySelector('input[name="severityLevel"]:checked');
  return selected ? Number(selected.value) : null;
}

function getSelectedRedFlags() {
  return redFlagCheckboxes
    .filter((checkbox) => checkbox.checked && checkbox.value !== "None of the above")
    .map((checkbox) => checkbox.value);
}

function getValidationErrors(input) {
  const errors = [];

  if (!input.ageRange) {
    errors.push("Please select an age range.");
  }

  if (!input.mainSymptom.trim()) {
    errors.push("Please briefly describe what you are experiencing.");
  }

  if (!input.duration) {
    errors.push("Please select how long the symptoms have been present.");
  }

  if (!input.severityLevel) {
    errors.push("Please select a severity level from 1 to 5.");
  }

  return errors;
}

function resetValidation() {
  validationSummary.hidden = true;
  validationSummary.innerHTML = "";
  ageRangeField.classList.remove("is-invalid");
  durationField.classList.remove("is-invalid");
  mainSymptomField.classList.remove("is-invalid");
  severityGroup.classList.remove("fieldset-invalid");
}

function showValidation(errors) {
  validationSummary.hidden = false;
  validationSummary.innerHTML = `
    <strong>Please review a few required items before continuing.</strong>
    <ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>
  `;
}

function validateForm({ shouldScroll = true } = {}) {
  resetValidation();
  const input = buildInputState();
  const errors = getValidationErrors(input);

  if (!input.ageRange) {
    ageRangeField.classList.add("is-invalid");
  }

  if (!input.mainSymptom.trim()) {
    mainSymptomField.classList.add("is-invalid");
  }

  if (!input.duration) {
    durationField.classList.add("is-invalid");
  }

  if (!input.severityLevel) {
    severityGroup.classList.add("fieldset-invalid");
  }

  if (errors.length) {
    showValidation(errors);
    if (shouldScroll) {
      validationSummary.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    return false;
  }

  return true;
}

function getUrgencyLevel({ redFlags, severityLevel, duration }) {
  if (redFlags.length > 0) {
    return "Urgent";
  }

  if (severityLevel >= 4 || duration === "More than 1 week") {
    return "Moderate";
  }

  return "Low";
}

function getResultReasons({ redFlags, severityLevel, duration }) {
  if (redFlags.length > 0) {
    return [
      `Red-flag symptoms selected: ${redFlags.join(", ")}.`,
      "Any red-flag selection is treated as urgent in this prototype."
    ];
  }

  const reasons = [];

  if (severityLevel >= 4) {
    reasons.push(`Severity was marked at ${severityLevel} out of 5.`);
  }

  if (duration === "More than 1 week") {
    reasons.push("Symptoms were reported as lasting more than one week.");
  }

  if (!reasons.length) {
    reasons.push(
      "No red-flag symptoms were selected and the reported severity stayed in the lower range."
    );
    reasons.push("The duration selected was still within a shorter monitoring window.");
  }

  return reasons;
}

function evaluateGuidance(input) {
  const urgencyLevel = getUrgencyLevel(input);
  const content = resultContent[urgencyLevel];

  return {
    urgencyLevel,
    title: content.title,
    explanation: content.explanation,
    nextSteps: content.nextSteps,
    humanReminder: content.humanReminder,
    reasons: getResultReasons(input),
    showEmergencyWarning: input.redFlags.length > 0
  };
}

function renderList(listElement, items) {
  listElement.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderResult(input) {
  const guidance = evaluateGuidance(input);

  resultPill.className = "urgency-pill";
  resultPill.classList.add(`urgency-pill-${guidance.urgencyLevel.toLowerCase()}`);
  resultPill.textContent = guidance.title;

  resultCard.classList.remove(
    "result-card-low",
    "result-card-moderate",
    "result-card-urgent"
  );
  resultCard.classList.add(`result-card-${guidance.urgencyLevel.toLowerCase()}`);

  resultTitle.textContent = guidance.title;
  resultExplanation.textContent = guidance.explanation;
  resultHumanReminder.textContent = guidance.humanReminder;

  renderList(resultReasons, guidance.reasons);
  renderList(resultNextSteps, guidance.nextSteps);

  if (guidance.showEmergencyWarning) {
    emergencyWarning.hidden = false;
    emergencyWarningText.textContent = `${input.redFlags.join(
      ", "
    )} can require urgent medical attention. This message does not identify a cause.`;
  } else {
    emergencyWarning.hidden = true;
    emergencyWarningText.textContent = "";
  }

  resultEmpty.hidden = true;
  resultCard.hidden = false;
  resultCard.focus();
}

function clearResult(message = RESULT_EMPTY_DEFAULT) {
  resultCard.hidden = true;
  resultEmpty.hidden = false;
  resultEmpty.textContent = message;
  emergencyWarning.hidden = true;
  emergencyWarningText.textContent = "";
  resultCard.classList.remove(
    "result-card-low",
    "result-card-moderate",
    "result-card-urgent"
  );
}

function resetExperience(shouldScroll) {
  form.reset();
  resetValidation();
  clearResult();
  mockConsultFeedback.textContent = "";

  if (shouldScroll) {
    document
      .getElementById("symptom-checker")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function buildInputState() {
  return {
    ageRange: ageRangeField.value,
    mainSymptom: mainSymptomField.value.trim(),
    duration: durationField.value,
    severityLevel: getSeverityLevel(),
    redFlags: getSelectedRedFlags(),
    additionalNotes: form.elements.additionalNotes.value.trim()
  };
}

function handleFormMutation() {
  if (!resultCard.hidden) {
    clearResult(RESULT_EMPTY_CHANGED);
  }

  if (!validationSummary.hidden) {
    validateForm({ shouldScroll: false });
  }
}

redFlagCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (event) => {
    if (event.target.value === "None of the above" && event.target.checked) {
      redFlagCheckboxes.forEach((item) => {
        if (item !== event.target) {
          item.checked = false;
        }
      });
      return;
    }

    if (event.target.checked && event.target.value !== "None of the above") {
      const noneOption = redFlagCheckboxes.find(
        (item) => item.value === "None of the above"
      );
      if (noneOption) {
        noneOption.checked = false;
      }
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    clearResult();
    return;
  }

  const input = buildInputState();
  renderResult(input);
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

form.addEventListener("input", handleFormMutation);
form.addEventListener("change", handleFormMutation);

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    resetValidation();
    clearResult();
    mockConsultFeedback.textContent = "";
  }, 0);
});

startOverButton.addEventListener("click", () => {
  resetExperience(true);
});

mockConsultButton.addEventListener("click", () => {
  mockConsultFeedback.textContent =
    "Prototype only: no real appointment is booked. In a live service, this action would direct users toward qualified healthcare support.";
});

window.CareGuideAI = {
  getValidationErrors,
  evaluateGuidance
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

clearResult();
