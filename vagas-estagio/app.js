const STORAGE_KEY = "primeiro-passo-vagas-v1";

const exampleJobs = [
  {
    id: "exemplo-marketing",
    title: "Estágio em Marketing Digital",
    company: "Agência Criativa (exemplo)",
    area: "Marketing",
    mode: "Híbrido",
    location: "Fortaleza, CE",
    stipend: "R$ 1.200 / mês",
    email: "talentos@example.com",
    example: true,
  },
  {
    id: "exemplo-desenvolvimento",
    title: "Estágio em Desenvolvimento Web",
    company: "Estúdio Tech (exemplo)",
    area: "Tecnologia",
    mode: "Remoto",
    location: "Brasil",
    stipend: "R$ 1.500 / mês",
    email: "estagios@example.com",
    example: true,
  },
  {
    id: "exemplo-design",
    title: "Estágio em Design Gráfico",
    company: "Marca Viva (exemplo)",
    area: "Design",
    mode: "Presencial",
    location: "Recife, PE",
    stipend: "R$ 1.000 / mês",
    email: "pessoas@example.com",
    example: true,
  },
];

const tableBody = document.querySelector("#jobs-table-body");
const searchInput = document.querySelector("#search-input");
const areaFilter = document.querySelector("#area-filter");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const jobForm = document.querySelector("#job-form");
const formMessage = document.querySelector("#form-message");
let jobs = loadJobs();

function loadJobs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [...exampleJobs];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...exampleJobs];
  } catch {
    return [...exampleJobs];
  }
}

function saveJobs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    return true;
  } catch {
    return false;
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createJobRow(job, index) {
  const row = document.createElement("tr");
  const opportunityCell = document.createElement("td");
  const opportunity = makeElement("div", "job-main");
  const initials = job.company.trim().split(/\s+/).slice(0, 2).map((word) => word[0] || "").join("").toUpperCase();
  const monogram = makeElement("span", `company-monogram tone-${index % 3}`, initials);
  monogram.setAttribute("aria-hidden", "true");
  const info = document.createElement("span");
  const title = makeElement("strong", "", job.title);
  if (job.example) {
    const badge = makeElement("span", "example-pill", "Exemplo");
    badge.setAttribute("aria-label", "vaga ilustrativa");
    title.append(badge);
  }
  info.append(title, makeElement("small", "", job.company));
  opportunity.append(monogram, info);
  opportunityCell.append(opportunity);

  const areaCell = document.createElement("td");
  areaCell.append(makeElement("span", "area-pill", job.area));
  const modeCell = document.createElement("td");
  modeCell.append(makeElement("span", "mode-pill", job.mode));
  const locationCell = makeElement("td", "", job.location);
  const stipendCell = makeElement("td", "stipend-cell", job.stipend);

  const contactCell = makeElement("td", "contact-cell");
  const contactLink = makeElement("a", "contact-link", "Entrar em contato ↗");
  contactLink.href = `mailto:${job.email}`;
  contactLink.setAttribute("aria-label", `Entrar em contato com ${job.company} pelo e-mail ${job.email}`);
  contactCell.append(contactLink);
  const removeButton = makeElement("button", "delete-job", "Remover vaga");
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remover a vaga ${job.title} de ${job.company}`);
  removeButton.addEventListener("click", () => removeJob(job.id));
  contactCell.append(removeButton);

  row.append(opportunityCell, areaCell, modeCell, locationCell, stipendCell, contactCell);
  return row;
}

function renderJobs() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const selectedArea = areaFilter.value;
  const visibleJobs = jobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.area} ${job.location} ${job.mode}`.toLocaleLowerCase("pt-BR");
    return searchable.includes(query) && (!selectedArea || job.area === selectedArea);
  });

  tableBody.replaceChildren(...visibleJobs.map((job, index) => createJobRow(job, index)));
  emptyState.hidden = visibleJobs.length > 0;
  resultsCount.innerHTML = `<strong>${visibleJobs.length}</strong> ${visibleJobs.length === 1 ? "oportunidade" : "oportunidades"} encontrada${visibleJobs.length === 1 ? "" : "s"}`;
}

function removeJob(id) {
  jobs = jobs.filter((job) => job.id !== id);
  saveJobs();
  renderJobs();
}

function showFormMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("is-error", isError);
}

searchInput.addEventListener("input", renderJobs);
areaFilter.addEventListener("change", renderJobs);

jobForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!jobForm.reportValidity()) return;

  const data = new FormData(jobForm);
  const newJob = {
    id: `vaga-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: data.get("title").trim(),
    company: data.get("company").trim(),
    area: data.get("area"),
    mode: data.get("mode"),
    location: data.get("location").trim(),
    stipend: data.get("stipend").trim(),
    email: data.get("email").trim(),
    example: false,
  };

  jobs.unshift(newJob);
  searchInput.value = "";
  areaFilter.value = "";
  renderJobs();
  const saved = saveJobs();
  jobForm.reset();
  showFormMessage(saved
    ? "Vaga publicada e adicionada à tabela. Ela ficará salva neste navegador."
    : "Vaga adicionada à tabela desta sessão, mas não foi possível salvá-la neste navegador.");
  document.querySelector("#vagas").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
renderJobs();
