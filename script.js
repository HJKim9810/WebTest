const STORAGE_KEYS = {
  wrongIds: "ipe_wrong_ids",
  stats: "ipe_stats",
};

const state = {
  mode: null,
  subject: null,
  questions: [],
  renderedChoices: [],
  currentIndex: 0,
  correct: 0,
  answers: [],
};

const CHOICE_LABELS = ["①", "②", "③", "④"];

const els = {
  dashboard: document.querySelector("#dashboard"),
  conceptStudy: document.querySelector("#concept-study"),
  quizScreen: document.querySelector("#quiz-screen"),
  resultScreen: document.querySelector("#result-screen"),
  subjectSelect: document.querySelector("#subject-select"),
  conceptSubjectSelect: document.querySelector("#concept-subject-select"),
  conceptList: document.querySelector("#concept-list"),
  wrongCount: document.querySelector("#wrong-count"),
  wrongModeButton: document.querySelector("#wrong-mode-button"),
  bankCount: document.querySelector("#bank-count"),
  totalSolved: document.querySelector("#total-solved"),
  totalAccuracy: document.querySelector("#total-accuracy"),
  savedWrong: document.querySelector("#saved-wrong"),
  backButton: document.querySelector("#back-button"),
  sessionMode: document.querySelector("#session-mode"),
  sessionTitle: document.querySelector("#session-title"),
  questionPosition: document.querySelector("#question-position"),
  liveScore: document.querySelector("#live-score"),
  progressFill: document.querySelector("#progress-fill"),
  subjectName: document.querySelector("#subject-name"),
  topicName: document.querySelector("#topic-name"),
  questionText: document.querySelector("#question-text"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  nextButton: document.querySelector("#next-button"),
  resultSummary: document.querySelector("#result-summary"),
  subjectResults: document.querySelector("#subject-results"),
  retryButton: document.querySelector("#retry-button"),
  homeButton: document.querySelector("#home-button"),
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getWrongIds() {
  return readJson(STORAGE_KEYS.wrongIds, []);
}

function setWrongIds(ids) {
  writeJson(STORAGE_KEYS.wrongIds, [...new Set(ids)]);
}

function getStats() {
  return readJson(STORAGE_KEYS.stats, {
    solved: 0,
    correct: 0,
    subjects: {},
  });
}

function saveAnswerStats(question, isCorrect) {
  const stats = getStats();
  const subject = stats.subjects[question.subject] ?? { solved: 0, correct: 0 };
  stats.solved += 1;
  if (isCorrect) stats.correct += 1;
  subject.solved += 1;
  if (isCorrect) subject.correct += 1;
  stats.subjects[question.subject] = subject;
  writeJson(STORAGE_KEYS.stats, stats);
}

function shuffle(items) {
  return [...items]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function sample(items, count) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

function questionsBySubject(subjectId) {
  return window.QUESTION_BANK.filter((question) => question.subject === subjectId);
}

function buildExamSet() {
  return window.SUBJECTS.flatMap((subject) => sample(questionsBySubject(subject.id), 20));
}

function buildSubjectSet(subjectId) {
  return sample(questionsBySubject(subjectId), 20);
}

function buildRandomSet() {
  return sample(window.QUESTION_BANK, 20);
}

function buildWrongSet() {
  const wrongIds = new Set(getWrongIds());
  return shuffle(window.QUESTION_BANK.filter((question) => wrongIds.has(question.id)));
}

function startMode(mode) {
  state.mode = mode;
  state.subject = els.subjectSelect.value;
  state.currentIndex = 0;
  state.correct = 0;
  state.answers = [];

  if (mode === "exam") state.questions = shuffle(buildExamSet());
  if (mode === "subject") state.questions = buildSubjectSet(state.subject);
  if (mode === "random") state.questions = buildRandomSet();
  if (mode === "wrong") state.questions = buildWrongSet();

  if (state.questions.length === 0) {
    alert("저장된 오답이 없습니다.");
    renderDashboard();
    return;
  }

  els.dashboard.classList.add("hidden");
  els.conceptStudy.classList.add("hidden");
  els.resultScreen.classList.add("hidden");
  els.quizScreen.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const choices = shuffle(question.choices);
  state.renderedChoices = choices.map((choice, index) => ({
    choice,
    label: CHOICE_LABELS[index],
  }));

  els.sessionMode.textContent = getModeLabel();
  els.sessionTitle.textContent = getSessionTitle();
  els.questionPosition.textContent = `${state.currentIndex + 1} / ${state.questions.length}`;
  els.liveScore.textContent = `정답 ${state.correct}`;
  els.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
  els.subjectName.textContent = question.subjectName;
  els.topicName.textContent = question.topic;
  els.questionText.textContent = question.question;
  els.choices.innerHTML = "";
  els.feedback.className = "feedback hidden";
  els.feedback.textContent = "";
  els.nextButton.disabled = true;
  els.nextButton.textContent = state.currentIndex === state.questions.length - 1 ? "결과 보기" : "다음 문제";

  state.renderedChoices.forEach(({ choice, label }) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.innerHTML = `<span class="choice-label">${label}</span><span>${choice}</span>`;
    button.dataset.choice = choice;
    button.addEventListener("click", () => selectAnswer(question, choice));
    els.choices.appendChild(button);
  });
}

function selectAnswer(question, selectedChoice) {
  const isCorrect = selectedChoice === question.answer;
  const buttons = [...els.choices.querySelectorAll(".choice")];
  const wrongIds = getWrongIds();

  buttons.forEach((button) => {
    button.disabled = true;
    if (button.dataset.choice === question.answer) button.classList.add("correct");
    if (button.dataset.choice === selectedChoice && !isCorrect) button.classList.add("wrong");
  });

  if (isCorrect) {
    state.correct += 1;
    setWrongIds(wrongIds.filter((id) => id !== question.id));
  } else {
    setWrongIds([...wrongIds, question.id]);
  }

  state.answers.push({ question, selectedChoice, isCorrect });
  saveAnswerStats(question, isCorrect);
  els.liveScore.textContent = `정답 ${state.correct}`;
  els.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  els.feedback.innerHTML = buildFeedbackHtml(question, selectedChoice, isCorrect);
  els.nextButton.disabled = false;
  renderDashboardStats();
}

function buildFeedbackHtml(question, selectedChoice, isCorrect) {
  const choiceNotes = state.renderedChoices
    .map(({ choice, label }) => {
      const concept = getChoiceConcept(question.subject, choice);
      if (!concept) return "";
      const marker = choice === question.answer ? "정답" : choice === selectedChoice ? "내 선택" : "다른 보기";
      return `<li><strong>${label} ${marker}</strong><span>${concept.term}: ${concept.description}</span></li>`;
    })
    .filter(Boolean)
    .join("");

  return `
    <strong>${isCorrect ? "정답" : "오답"}</strong>
    <span>${question.explanation}</span>
    <div class="choice-explanations">
      <p>선택지 해설</p>
      <ul>${choiceNotes}</ul>
    </div>
  `;
}

function getChoiceConcept(subject, choice) {
  return (
    window.CONCEPTS.find(
      (concept) => concept.subject === subject && (concept.term === choice || concept.description === choice)
    ) ||
    window.CONCEPTS.find((concept) => concept.term === choice || concept.description === choice)
  );
}

function getModeLabel() {
  return {
    exam: "실전 100문제",
    subject: "과목별 집중",
    random: "랜덤 연습",
    wrong: "오답 복습",
  }[state.mode];
}

function getSessionTitle() {
  if (state.mode !== "subject") return "문제 풀이";
  const subject = window.SUBJECTS.find((item) => item.id === state.subject);
  return `${subject.name} 집중 풀이`;
}

function renderResult() {
  els.progressFill.style.width = "100%";
  els.quizScreen.classList.add("hidden");
  els.conceptStudy.classList.add("hidden");
  els.resultScreen.classList.remove("hidden");

  const total = state.questions.length;
  const accuracy = Math.round((state.correct / total) * 100);
  const subjectSummary = summarizeBySubject();
  const failedSubjects = subjectSummary.filter((item) => item.score < 40);
  const examPassed = state.mode === "exam" && accuracy >= 60 && failedSubjects.length === 0;

  if (state.mode === "exam") {
    els.resultSummary.textContent = `${total}문제 중 ${state.correct}문제 정답, 평균 ${accuracy}점입니다. ${
      examPassed ? "실전 기준 합격권입니다." : "실전 기준으로는 보완이 필요합니다."
    }`;
  } else {
    els.resultSummary.textContent = `${total}문제 중 ${state.correct}문제를 맞혔고 정답률은 ${accuracy}%입니다.`;
  }

  els.subjectResults.innerHTML = "";
  subjectSummary.forEach((item) => {
    const card = document.createElement("div");
    card.className = `subject-result ${item.score < 40 ? "danger" : ""}`;
    card.innerHTML = `<strong>${item.name}</strong><span>${item.correct}/${item.total} 정답 · ${item.score}점</span>`;
    els.subjectResults.appendChild(card);
  });
}

function summarizeBySubject() {
  const map = new Map();
  state.answers.forEach(({ question, isCorrect }) => {
    const current = map.get(question.subject) ?? {
      name: question.subjectName,
      total: 0,
      correct: 0,
    };
    current.total += 1;
    if (isCorrect) current.correct += 1;
    map.set(question.subject, current);
  });

  return [...map.values()].map((item) => ({
    ...item,
    score: Math.round((item.correct / item.total) * 100),
  }));
}

function renderDashboard() {
  els.quizScreen.classList.add("hidden");
  els.resultScreen.classList.add("hidden");
  els.dashboard.classList.remove("hidden");
  els.conceptStudy.classList.remove("hidden");
  renderDashboardStats();
}

function renderDashboardStats() {
  const stats = getStats();
  const wrongIds = getWrongIds();
  const accuracy = stats.solved === 0 ? 0 : Math.round((stats.correct / stats.solved) * 100);

  els.bankCount.textContent = window.QUESTION_BANK.length;
  els.totalSolved.textContent = stats.solved;
  els.totalAccuracy.textContent = `${accuracy}%`;
  els.savedWrong.textContent = wrongIds.length;
  els.wrongCount.textContent = wrongIds.length;
  els.wrongModeButton.disabled = wrongIds.length === 0;
}

function initSubjectSelect() {
  els.subjectSelect.innerHTML = "";
  els.conceptSubjectSelect.innerHTML = "";
  window.SUBJECTS.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    els.subjectSelect.appendChild(option);

    const conceptOption = document.createElement("option");
    conceptOption.value = subject.id;
    conceptOption.textContent = subject.name;
    els.conceptSubjectSelect.appendChild(conceptOption);
  });
}

function renderConceptList() {
  const subject = els.conceptSubjectSelect.value;
  const concepts = window.CONCEPTS.filter((concept) => concept.subject === subject);
  els.conceptList.innerHTML = "";

  concepts.forEach((concept) => {
    const item = document.createElement("article");
    item.className = "concept-item";
    item.innerHTML = `<h3>${concept.term}</h3><p>${concept.description}</p>`;
    els.conceptList.appendChild(item);
  });
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => startMode(button.dataset.mode));
});

els.nextButton.addEventListener("click", () => {
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) {
    renderResult();
  } else {
    renderQuestion();
  }
});

els.backButton.addEventListener("click", renderDashboard);
els.homeButton.addEventListener("click", renderDashboard);
els.retryButton.addEventListener("click", () => startMode(state.mode));
els.conceptSubjectSelect.addEventListener("change", renderConceptList);

initSubjectSelect();
renderConceptList();
renderDashboard();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Local file previews do not support service workers. GitHub Pages does.
    });
  });
}
