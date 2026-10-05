const SUPABASE_URL = "https://dwfsuitykfworisamkyo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EYQhkFZ8XeOw35JjtUO--g_WxpBNq3u";
const TABLE_NAME = "internship_vacancies";

const tableBody = document.querySelector("#jobs-table-body");
const searchInput = document.querySelector("#search-input");
const areaFilter = document.querySelector("#area-filter");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const jobForm = document.querySelector("#job-form");
const formMessage = document.querySelector("#form-message");
const backendStatus = document.querySelector("#backend-status");
const supabaseClient = window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
);
let jobs = [];

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setBackendStatus(message, isError = false) {
  backendStatus.classList.toggle("is-error", isError);
  backendStatus.replaceChildren(
    makeElement("span", "", isError ? "!" : "ⓘ"),
    document.createTextNode(` ${message}`),
  );
}

function createJobRow(job, index) {
  const row = document.createElement("tr");
  const opportunityCell = document.createElement("td");
  const opportunity = makeElement("div", "job-main");
  const initials = job.company.trim().split(/\s+/).slice(0, 2).map((word) => word[0] || "").join("").toUpperCase();
  const monogram = makeElement("span", `company-monogram tone-${index % 3}`, initials);
  monogram.setAttribute("aria-hidden", "true");
  const info = document.createElement("span");
  info.append(makeElement("strong", "", job.title), makeElement("small", "", job.company));
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

function showFormMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("is-error", isError);
}

async function loadJobs() {
  if (!supabaseClient) {
    setBackendStatus("Não foi possível iniciar o serviço de vagas. Atualize a página ou tente novamente mais tarde.", true);
    jobs = [];
    renderJobs();
    return false;
  }

  const { data, error } = await supabaseClient
    .from(TABLE_NAME)
    .select("id, title, company, area, mode, location, stipend, email, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Falha ao carregar vagas públicas:", error.message);
    setBackendStatus("A lista pública está temporariamente indisponível. Tente novamente em alguns instantes.", true);
    jobs = [];
    renderJobs();
    return false;
  }

  jobs = data || [];
  setBackendStatus("As vagas e os contatos são públicos e compartilhados entre todos os visitantes.");
  renderJobs();
  return true;
}

searchInput.addEventListener("input", renderJobs);
areaFilter.addEventListener("change", renderJobs);

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showFormMessage("");
  if (!jobForm.reportValidity()) return;
  if (!supabaseClient) {
    showFormMessage("O serviço de cadastro está indisponível no momento. Tente novamente mais tarde.", true);
    return;
  }

  const submitButton = jobForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  const formData = new FormData(jobForm);
  const newJob = {
    title: formData.get("title").trim(),
    company: formData.get("company").trim(),
    area: formData.get("area"),
    mode: formData.get("mode"),
    location: formData.get("location").trim(),
    stipend: formData.get("stipend").trim(),
    email: formData.get("email").trim(),
  };

  const { error } = await supabaseClient.from(TABLE_NAME).insert(newJob);
  submitButton.disabled = false;
  submitButton.removeAttribute("aria-busy");

  if (error) {
    console.error("Falha ao publicar vaga:", error.message);
    showFormMessage("Não foi possível publicar a vaga. Confira os dados e tente novamente.", true);
    return;
  }

  jobForm.reset();
  searchInput.value = "";
  areaFilter.value = "";
  const refreshed = await loadJobs();
  showFormMessage(refreshed
    ? "Vaga publicada! Ela já está visível para todos na tabela."
    : "Vaga enviada. A lista pública pode levar alguns instantes para atualizar.");
  document.querySelector("#vagas").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
renderJobs();
loadJobs();
