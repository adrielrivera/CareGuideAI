const form = document.getElementById("intake-form");
const resultSection = document.getElementById("result");
const resultSummary = document.getElementById("result-summary");
const copySummaryButton = document.getElementById("copy-summary");
const editIntakeButton = document.getElementById("edit-intake");
const copyFeedback = document.getElementById("copy-feedback");
const severityInput = form.elements.severity;
const severityOutput = document.getElementById("severity-output");

const summaryIdentity = document.getElementById("summary-identity");
const summaryMainConcern = document.getElementById("summary-main-concern");
const summarySymptoms = document.getElementById("summary-symptoms");
const summaryContext = document.getElementById("summary-context");
const summaryAlerts = document.getElementById("summary-alerts");

function selectedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(
    (input) => input.value
  );
}

function valueOrFallback(value, fallback) {
  return value && value.trim() ? value.trim() : fallback;
}

function joinContent(parts, fallback) {
  const cleanParts = parts.filter(Boolean);
  return cleanParts.length ? cleanParts.join(" | ") : fallback;
}

function updateSeverityLabel() {
  severityOutput.textContent = `${severityInput.value}/10`;
}

function renderAlerts(alerts) {
  summaryAlerts.innerHTML = "";

  if (!alerts.length) {
    const muted = document.createElement("p");
    muted.className = "muted";
    muted.textContent = "No urgent symptom flags selected.";
    summaryAlerts.appendChild(muted);
    return;
  }

  alerts.forEach((alert) => {
    const chip = document.createElement("div");
    chip.className = "alert-chip";
    chip.textContent = alert;
    summaryAlerts.appendChild(chip);
  });
}

function buildSummaryText() {
  const firstName = form.elements.firstName.value.trim();
  const lastName = form.elements.lastName.value.trim();
  const age = form.elements.age.value.trim();
  const pronouns = form.elements.pronouns.value.trim();
  const email = form.elements.email.value.trim();
  const phone = form.elements.phone.value.trim();
  const pregnancyStatus = form.elements.pregnancyStatus.value;
  const mainConcern = form.elements.mainConcern.value.trim();
  const duration = form.elements.duration.value;
  const severity = form.elements.severity.value;
  const temperature = form.elements.temperature.value.trim();
  const symptoms = selectedValues("symptoms");
  const redFlags = selectedValues("redFlags");
  const symptomDetails = form.elements.symptomDetails.value.trim();
  const allergies = form.elements.allergies.value.trim();
  const medications = form.elements.medications.value.trim();
  const conditions = form.elements.conditions.value.trim();
  const visitGoals = form.elements.visitGoals.value.trim();

  const patientLine = joinContent(
    [
      [firstName, lastName].filter(Boolean).join(" "),
      age ? `Age ${age}` : "",
      pronouns,
      email,
      phone,
    ],
    "Patient details incomplete"
  );

  const contextLine = joinContent(
    [
      allergies ? `Allergies: ${allergies}` : "",
      medications ? `Medications: ${medications}` : "",
      conditions ? `History: ${conditions}` : "",
      pregnancyStatus ? `Pregnancy status: ${pregnancyStatus}` : "",
    ],
    "No medical context entered."
  );

  const symptomLine = symptoms.length ? symptoms.join(", ") : "No symptom tags selected.";
  const alertLine = redFlags.length
    ? `Urgent review flags: ${redFlags.join(", ")}.`
    : "Urgent review flags: none reported.";

  return [
    "CAREGUIDEAI CLINICIAN REVIEW SUMMARY",
    "",
    `Patient: ${patientLine}`,
    `Main concern: ${valueOrFallback(mainConcern, "Not entered")}`,
    `Duration: ${valueOrFallback(duration, "Not entered")}`,
    `Severity: ${severity}/10`,
    `Temperature: ${valueOrFallback(temperature, "Not provided")}`,
    `Symptoms reported: ${symptomLine}`,
    alertLine,
    "",
    "Patient description:",
    valueOrFallback(symptomDetails, "No symptom narrative entered."),
    "",
    "Medical context:",
    contextLine,
    "",
    "Visit goals:",
    valueOrFallback(visitGoals, "No visit goals entered."),
    "",
    "Safety note:",
    "This summary is informational intake material for a licensed clinician. It does not contain a diagnosis, treatment plan, or medication recommendation.",
  ].join("\n");
}

function updateLiveSummary() {
  const fullName = [form.elements.firstName.value, form.elements.lastName.value]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  const age = form.elements.age.value.trim();
  const email = form.elements.email.value.trim();
  const phone = form.elements.phone.value.trim();
  const mainConcern = form.elements.mainConcern.value.trim();
  const duration = form.elements.duration.value;
  const symptoms = selectedValues("symptoms");
  const redFlags = selectedValues("redFlags");
  const allergies = form.elements.allergies.value.trim();
  const medications = form.elements.medications.value.trim();
  const conditions = form.elements.conditions.value.trim();
  const mainConcernParts = [];

  if (mainConcern) {
    mainConcernParts.push(mainConcern);
  }

  if (duration) {
    mainConcernParts.push(`Duration: ${duration}`);
  }

  if (mainConcern || duration || symptoms.length) {
    mainConcernParts.push(`Severity: ${form.elements.severity.value}/10`);
  }

  summaryIdentity.textContent = joinContent(
    [fullName, age ? `Age ${age}` : "", email, phone],
    "No patient details entered yet."
  );

  summaryMainConcern.textContent = joinContent(
    mainConcernParts,
    "Describe the primary concern to build the visit summary."
  );

  summarySymptoms.textContent = symptoms.length
    ? symptoms.join(", ")
    : "No symptom tags selected yet.";

  summaryContext.textContent = joinContent(
    [
      allergies ? `Allergies: ${allergies}` : "",
      medications ? `Meds: ${medications}` : "",
      conditions ? `History: ${conditions}` : "",
    ],
    "Allergies, medications, and relevant history will appear here."
  );

  renderAlerts(redFlags);
}

function validateForm() {
  if (!form.reportValidity()) {
    return false;
  }

  return true;
}

form.addEventListener("input", () => {
  updateSeverityLabel();
  updateLiveSummary();
  copyFeedback.textContent = "";
});

form.addEventListener("change", updateLiveSummary);

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    severityInput.value = "4";
    updateSeverityLabel();
    updateLiveSummary();
    resultSection.hidden = true;
    copyFeedback.textContent = "";
  }, 0);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const summary = buildSummaryText();
  resultSummary.textContent = summary;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

copySummaryButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultSummary.textContent);
    copyFeedback.textContent = "Summary copied to clipboard.";
  } catch (error) {
    copyFeedback.textContent = "Clipboard access was not available in this browser.";
  }
});

editIntakeButton.addEventListener("click", () => {
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

updateSeverityLabel();
updateLiveSummary();
