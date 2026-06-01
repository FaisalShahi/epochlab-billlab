const STORAGE_KEY = "epochlab.invoice.builder.v1";

const initialState = {
  businessName: "EpochLab",
  businessWebsite: "epochlab.in",
  logoDataUrl: "",
  logoName: "",
  brandColor: "#2f68e8",
  clientName: "Multinational Tours",
  receiptNumber: "INV1325",
  receiptDate: "2026-05-31",
  projectSummary: "Complete design, development, and deployment",
  breakdownTitle: "Project Scope & Cost Breakdown",
  items: [
    { description: "Business Website (React)\nModern responsive UI", amount: 17400 },
    { description: "Admin Panel\nBlog management (Create, Edit, Delete)\nPackage management system", amount: 12600 },
    { description: "Lead Management System\nMulti-step data capture form (3 pages)", amount: 8500 },
    { description: "Smart chatbot development", amount: 4300 }
  ],
  includedNote: "(Deployment, one month support, and minor fixes included)",
  termsText: "Payment is due within 15 days"
};

let state = loadState();

const fields = {
  businessName: document.querySelector("#businessName"),
  businessWebsite: document.querySelector("#businessWebsite"),
  brandColor: document.querySelector("#brandColor"),
  clientName: document.querySelector("#clientName"),
  receiptNumber: document.querySelector("#receiptNumber"),
  receiptDate: document.querySelector("#receiptDate"),
  projectSummary: document.querySelector("#projectSummary"),
  breakdownTitle: document.querySelector("#breakdownTitle"),
  includedNote: document.querySelector("#includedNote"),
  termsText: document.querySelector("#termsText")
};

const preview = {
  businessName: document.querySelector("#previewBusinessName"),
  businessWebsite: document.querySelector("#previewBusinessWebsite"),
  logo: document.querySelector("#previewLogo"),
  clientName: document.querySelector("#previewClientName"),
  receiptNumber: document.querySelector("#previewReceiptNumber"),
  receiptDate: document.querySelector("#previewReceiptDate"),
  projectSummary: document.querySelector("#previewProjectSummary"),
  breakdownTitle: document.querySelector("#previewBreakdownTitle"),
  items: document.querySelector("#previewItems"),
  total: document.querySelector("#previewTotal"),
  includedNote: document.querySelector("#previewIncludedNote"),
  termsText: document.querySelector("#previewTermsText")
};

const itemsEditor = document.querySelector("#itemsEditor");
const addItemButton = document.querySelector("#addItemButton");
const printButton = document.querySelector("#printButton");
const resetButton = document.querySelector("#resetButton");
const logoUpload = document.querySelector("#logoUpload");
const logoChip = document.querySelector("#logoChip");
const removeLogoButton = document.querySelector("#removeLogoButton");

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialState, ...JSON.parse(saved) } : structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}

function formatPlainAmount(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(Number(value) || 0).replaceAll(",", "");
}

function syncForm() {
  Object.entries(fields).forEach(([key, field]) => {
    field.value = state[key] ?? "";
  });
  renderItemsEditor();
}

function renderItemsEditor() {
  itemsEditor.innerHTML = "";

  state.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-editor";

    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Item description";
    const description = document.createElement("textarea");
    description.value = item.description;
    description.rows = 3;
    description.addEventListener("input", () => {
      state.items[index].description = description.value;
      update();
    });
    descriptionLabel.append(description);

    const amountLabel = document.createElement("label");
    amountLabel.textContent = "Amount";
    const amount = document.createElement("input");
    amount.type = "number";
    amount.min = "0";
    amount.step = "1";
    amount.value = item.amount;
    amount.addEventListener("input", () => {
      state.items[index].amount = Number(amount.value);
      update();
    });
    amountLabel.append(amount);

    const remove = document.createElement("button");
    remove.className = "icon-button";
    remove.type = "button";
    remove.title = "Remove item";
    remove.setAttribute("aria-label", "Remove item");
    remove.textContent = "X";
    remove.addEventListener("click", () => {
      state.items.splice(index, 1);
      renderItemsEditor();
      update();
    });

    row.append(descriptionLabel, amountLabel, remove);
    itemsEditor.append(row);
  });
}

function renderPreview() {
  document.documentElement.style.setProperty("--brand", state.brandColor || initialState.brandColor);

  preview.businessName.textContent = state.businessName;
  preview.businessWebsite.textContent = state.businessWebsite;
  preview.businessWebsite.href = normalizedWebsite(state.businessWebsite);
  preview.logo.src = state.logoDataUrl || "";
  preview.logo.alt = state.logoName ? `${state.businessName || "Business"} logo` : "";
  preview.logo.classList.toggle("has-logo", Boolean(state.logoDataUrl));
  logoChip.textContent = state.logoName || "No logo uploaded";
  preview.clientName.textContent = state.clientName;
  preview.receiptNumber.textContent = state.receiptNumber;
  preview.receiptDate.textContent = formatDate(state.receiptDate);
  preview.projectSummary.textContent = state.projectSummary;
  preview.breakdownTitle.textContent = state.breakdownTitle;
  preview.includedNote.textContent = state.includedNote;
  preview.termsText.textContent = state.termsText;

  preview.items.innerHTML = "";
  state.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "invoice-item";

    const description = document.createElement("p");
    description.textContent = item.description;

    const amount = document.createElement("p");
    amount.className = "amount";
    amount.textContent = formatPlainAmount(item.amount);

    row.append(description, amount);
    preview.items.append(row);
  });

  const total = state.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  preview.total.textContent = formatCurrency(total);
}

function normalizedWebsite(value) {
  if (!value) return "#";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function update() {
  renderPreview();
  saveState();
}

Object.entries(fields).forEach(([key, field]) => {
  field.addEventListener("input", () => {
    state[key] = field.value;
    update();
  });
});

addItemButton.addEventListener("click", () => {
  state.items.push({ description: "New service", amount: 0 });
  renderItemsEditor();
  update();
});

printButton.addEventListener("click", () => {
  window.print();
});

resetButton.addEventListener("click", () => {
  state = structuredClone(initialState);
  logoUpload.value = "";
  syncForm();
  update();
});

logoUpload.addEventListener("change", () => {
  const [file] = logoUpload.files;
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.logoDataUrl = reader.result;
    state.logoName = file.name;
    update();
  });
  reader.readAsDataURL(file);
});

removeLogoButton.addEventListener("click", () => {
  state.logoDataUrl = "";
  state.logoName = "";
  logoUpload.value = "";
  update();
});

syncForm();
update();
