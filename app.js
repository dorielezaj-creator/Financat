const STORAGE_KEY = "financat-e-mia:v2";
const BANKS_KEY = "financat-e-mia:banks:v1";
const LEGACY_SAVINGS_KEY = "financat-e-mia:savings";
const BACKUP_KEY = "financat-e-mia:auto-backup";
const EXCHANGE_RATE_KEY = "financat-e-mia:eur-all-rate:v1";
const LIMITS_KEY = "financat-e-mia:monthly-limits:v1";
const THEME_KEY = "financat-e-mia:theme:v1";
const RECEIPT_AI_ENDPOINT_KEY = "financat-e-mia:receipt-ai-endpoint:v1";
const RECEIPT_AI_TOKEN_KEY = "financat-e-mia:receipt-ai-token:v1";
const LEGACY_STORAGE_KEYS = ["financat-e-mia:v1"];
const DEFAULT_LIMITS = {
  expenseALL: 150000,
  expenseEUR: 1000,
  incomeALL: 150000,
  incomeEUR: 1000,
};
const DEFAULT_EUR_TO_ALL_RATE = 93.36;
const BANK_OF_ALBANIA_RATE_URL = "https://www.bankofalbania.org/Markets/Official_exchange_rate/";
const EXPENSE_PREVIEW_LIMIT = 10;

const categories = {
  expense: ["Ushqim", "Transport", "Shtëpi", "Fatura", "Argëtim", "Shëndet", "Tjetër"],
  income: ["Rrogë", "Punë ekstra", "Biznes", "Dhuratë", "Tjetër"],
};

const colors = ["#1d1d1f", "#6e6e73", "#8e8e93", "#aeaeb2", "#c7c7cc", "#d1d1d6", "#3a3a3c"];
const monthNames = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];

const state = {
  type: "expense",
  editingEntryId: "",
  visibleLists: {
    expenses: true,
    income: true,
    accounts: true,
  },
  dailyCurrency: "TOTAL",
  selectedDailyDate: "",
  theme: loadTheme(),
  exchangeRate: loadExchangeRate(),
  limits: loadLimits(),
  entries: loadEntries(),
  banks: loadBanks(),
};

const els = {
  balanceValue: document.querySelector("#balanceValue"),
  balanceAlt: document.querySelector("#balanceAlt"),
  incomeValue: document.querySelector("#incomeValue"),
  incomeAlt: document.querySelector("#incomeAlt"),
  expenseValue: document.querySelector("#expenseValue"),
  expenseAlt: document.querySelector("#expenseAlt"),
  spendingRateValue: document.querySelector("#spendingRateValue"),
  savingsRateValue: document.querySelector("#savingsRateValue"),
  spendingRateBar: document.querySelector("#spendingRateBar"),
  savingsRateBar: document.querySelector("#savingsRateBar"),
  expenseEuroRateBar: document.querySelector("#expenseEuroRateBar"),
  incomeLekRateBar: document.querySelector("#incomeLekRateBar"),
  incomeEuroRateBar: document.querySelector("#incomeEuroRateBar"),
  gaugeIncomeValue: document.querySelector("#gaugeIncomeValue"),
  gaugeIncomeAlt: document.querySelector("#gaugeIncomeAlt"),
  gaugeArc: document.querySelector("#gaugeArc"),
  addEntryBtn: document.querySelector("#addEntryBtn"),
  entryOverlay: document.querySelector("#entryOverlay"),
  cancelEntryBtn: document.querySelector("#cancelEntryBtn"),
  accountsOverlay: document.querySelector("#accountsOverlay"),
  openAccountsBtn: document.querySelector("#openAccountsBtn"),
  closeAccountsBtn: document.querySelector("#closeAccountsBtn"),
  accountEditorOverlay: document.querySelector("#accountEditorOverlay"),
  accountEditorTitle: document.querySelector("#accountEditorTitle"),
  accountForm: document.querySelector("#accountForm"),
  accountIdInput: document.querySelector("#accountIdInput"),
  accountNameInput: document.querySelector("#accountNameInput"),
  accountCurrencyInput: document.querySelector("#accountCurrencyInput"),
  accountBalanceInput: document.querySelector("#accountBalanceInput"),
  accountDefaultInput: document.querySelector("#accountDefaultInput"),
  newAccountBtn: document.querySelector("#newAccountBtn"),
  newAccountBtnModal: document.querySelector("#newAccountBtnModal"),
  cancelAccountBtn: document.querySelector("#cancelAccountBtn"),
  deleteAccountBtn: document.querySelector("#deleteAccountBtn"),
  saveAccountBtn: document.querySelector("#saveAccountBtn"),
  accountList: document.querySelector("#accountList"),
  accountListModal: document.querySelector("#accountListModal"),
  accountsLekValue: document.querySelector("#accountsLekValue"),
  accountsEuroValue: document.querySelector("#accountsEuroValue"),
  accountsLekModalValue: document.querySelector("#accountsLekModalValue"),
  accountsEuroModalValue: document.querySelector("#accountsEuroModalValue"),
  currentExpenseMonth: document.querySelector("#currentExpenseMonth"),
  currentIncomeMonth: document.querySelector("#currentIncomeMonth"),
  openLimitsBtn: document.querySelector("#openLimitsBtn"),
  limitsOverlay: document.querySelector("#limitsOverlay"),
  limitsForm: document.querySelector("#limitsForm"),
  cancelLimitsBtn: document.querySelector("#cancelLimitsBtn"),
  expenseLimitLekInput: document.querySelector("#expenseLimitLekInput"),
  expenseLimitEuroInput: document.querySelector("#expenseLimitEuroInput"),
  incomeLimitLekInput: document.querySelector("#incomeLimitLekInput"),
  incomeLimitEuroInput: document.querySelector("#incomeLimitEuroInput"),
  expenseLimitLekValue: document.querySelector("#expenseLimitLekValue"),
  expenseLimitEuroValue: document.querySelector("#expenseLimitEuroValue"),
  incomeLimitLekValue: document.querySelector("#incomeLimitLekValue"),
  incomeLimitEuroValue: document.querySelector("#incomeLimitEuroValue"),
  toggleExpensesBtn: document.querySelector("#toggleExpensesBtn"),
  toggleIncomeBtn: document.querySelector("#toggleIncomeBtn"),
  toggleAccountsBtn: document.querySelector("#toggleAccountsBtn"),
  monthIncomeValue: document.querySelector("#monthIncomeValue"),
  monthIncomeAlt: document.querySelector("#monthIncomeAlt"),
  expensePreviewList: document.querySelector("#expensePreviewList"),
  incomePreviewList: document.querySelector("#incomePreviewList"),
  expenseArchiveOverlay: document.querySelector("#expenseArchiveOverlay"),
  closeExpenseArchiveBtn: document.querySelector("#closeExpenseArchiveBtn"),
  expenseArchiveList: document.querySelector("#expenseArchiveList"),
  todaySpent: document.querySelector("#todaySpent"),
  todaySpentAlt: document.querySelector("#todaySpentAlt"),
  monthSpent: document.querySelector("#monthSpent"),
  monthSpentAlt: document.querySelector("#monthSpentAlt"),
  dailyAverage: document.querySelector("#dailyAverage"),
  dailyAverageAlt: document.querySelector("#dailyAverageAlt"),
  dailyPeriodInput: document.querySelector("#dailyPeriodInput"),
  dailyMinValue: document.querySelector("#dailyMinValue"),
  dailyAvgValue: document.querySelector("#dailyAvgValue"),
  dailyMaxValue: document.querySelector("#dailyMaxValue"),
  dailySpendChart: document.querySelector("#dailySpendChart"),
  dailySelectedValue: document.querySelector("#dailySelectedValue"),
  eurToLekRateInput: document.querySelector("#eurToLekRateInput"),
  exchangeRateRow: document.querySelector("#exchangeRateRow"),
  refreshRateBtn: document.querySelector("#refreshRateBtn"),
  exchangeRateStatus: document.querySelector("#exchangeRateStatus"),
  entryForm: document.querySelector("#entryForm"),
  amountInput: document.querySelector("#amountInput"),
  currencyInput: document.querySelector("#currencyInput"),
  bankInput: document.querySelector("#bankInput"),
  noteInput: document.querySelector("#noteInput"),
  categoryInput: document.querySelector("#categoryInput"),
  dateInput: document.querySelector("#dateInput"),
  receiptAiTools: document.querySelector("#receiptAiTools"),
  receiptImageInput: document.querySelector("#receiptImageInput"),
  receiptAiStatus: document.querySelector("#receiptAiStatus"),
  submitLabel: document.querySelector("#submitLabel"),
  entryList: document.querySelector("#entryList"),
  categoryList: document.querySelector("#categoryList"),
  categoryChart: document.querySelector("#categoryChart"),
  monthFilter: document.querySelector("#monthFilter"),
  clearBtn: document.querySelector("#clearBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  themeToggle: document.querySelector("#themeToggle"),
  importInput: document.querySelector("#importInput"),
  restoreBackupBtn: document.querySelector("#restoreBackupBtn"),
  emptyTemplate: document.querySelector("#emptyTemplate"),
};

els.dateInput.value = todayIso();
els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
applyTheme();
syncTypeControls();
render();

document.querySelectorAll("[data-type]").forEach((button) => {
  button.addEventListener("click", () => {
    state.type = button.dataset.type;
    syncTypeControls();
  });
});

els.currencyInput.addEventListener("change", renderBankOptions);
els.receiptImageInput.addEventListener("change", handleReceiptImage);

els.addEntryBtn.addEventListener("click", () => openEntryEditor("expense"));
els.openLimitsBtn.addEventListener("click", openLimitsEditor);
els.cancelLimitsBtn.addEventListener("click", closeLimitsEditor);
els.limitsOverlay.addEventListener("click", (event) => {
  if (event.target === els.limitsOverlay) closeLimitsEditor();
});
els.limitsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.limits = {
    expenseALL: Math.max(Number(els.expenseLimitLekInput.value) || 0, 0),
    expenseEUR: Math.max(Number(els.expenseLimitEuroInput.value) || 0, 0),
    incomeALL: Math.max(Number(els.incomeLimitLekInput.value) || 0, 0),
    incomeEUR: Math.max(Number(els.incomeLimitEuroInput.value) || 0, 0),
  };
  saveLimits();
  closeLimitsEditor();
  render();
});
els.toggleExpensesBtn.addEventListener("click", () => toggleList("expenses"));
els.toggleIncomeBtn.addEventListener("click", () => toggleList("income"));
els.toggleAccountsBtn.addEventListener("click", () => toggleList("accounts"));
els.cancelEntryBtn.addEventListener("click", closeEntryEditor);
els.entryOverlay.addEventListener("click", (event) => {
  if (event.target === els.entryOverlay) closeEntryEditor();
});

els.openAccountsBtn.addEventListener("click", openAccountsWindow);
els.closeAccountsBtn.addEventListener("click", closeAccountsWindow);
els.accountsOverlay.addEventListener("click", (event) => {
  if (event.target === els.accountsOverlay) closeAccountsWindow();
});

els.newAccountBtn.addEventListener("click", () => openAccountEditor());
els.newAccountBtnModal.addEventListener("click", () => openAccountEditor());
els.cancelAccountBtn.addEventListener("click", closeAccountEditor);
els.accountEditorOverlay.addEventListener("click", (event) => {
  if (event.target === els.accountEditorOverlay) closeAccountEditor();
});

els.accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createAutoBackup();

  const editingBank = findBank(els.accountIdInput.value);
  const currency = els.accountCurrencyInput.value;
  const makeDefault = els.accountDefaultInput.checked || !defaultBank(currency);

  if (makeDefault) {
    state.banks.forEach((bank) => {
      if (bank.currency === currency) bank.isDefault = false;
    });
  }

  if (editingBank) {
    editingBank.name = els.accountNameInput.value.trim();
    editingBank.currency = currency;
    editingBank.balance = Number(els.accountBalanceInput.value) || 0;
    editingBank.isDefault = makeDefault;
  } else {
    state.banks.push({
      id: crypto.randomUUID(),
      name: els.accountNameInput.value.trim(),
      currency,
      balance: Number(els.accountBalanceInput.value) || 0,
      isDefault: makeDefault,
      createdAt: new Date().toISOString(),
    });
  }

  ensureDefaultBanks();
  saveBanks();
  closeAccountEditor();
  render();
});

els.deleteAccountBtn.addEventListener("click", () => {
  deleteBank(els.accountIdInput.value);
});

els.accountList.addEventListener("click", handleAccountListClick);
els.accountListModal.addEventListener("click", handleAccountListClick);

function handleAccountListClick(event) {
  const defaultButton = event.target.closest("[data-default-bank]");
  const editButton = event.target.closest("[data-edit-bank]");

  if (defaultButton) {
    createAutoBackup();
    const bank = findBank(defaultButton.dataset.defaultBank);
    if (!bank) return;
    state.banks.forEach((item) => {
      if (item.currency === bank.currency) item.isDefault = item.id === bank.id;
    });
    saveBanks();
    render();
  }

  if (editButton) openAccountEditor(editButton.dataset.editBank);
}

els.entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(els.amountInput.value);
  const bank = findBank(els.bankInput.value);

  if (!amount || amount <= 0) return;
  if (!bank) {
    alert("Zgjidh një llogari për këtë monedhë.");
    return;
  }

  createAutoBackup();
  const editingEntry = state.entries.find((entry) => entry.id === state.editingEntryId);
  if (editingEntry?.bankId) {
    applyBankDelta(editingEntry.bankId, editingEntry.type === "income" ? -editingEntry.amount : editingEntry.amount);
  }

  applyBankDelta(bank.id, state.type === "income" ? amount : -amount);

  const nextEntry = {
    id: editingEntry?.id || crypto.randomUUID(),
    type: state.type,
    amount,
    currency: bank.currency,
    bankId: bank.id,
    note: els.noteInput.value.trim(),
    category: els.categoryInput.value,
    date: els.dateInput.value,
    createdAt: editingEntry?.createdAt || new Date().toISOString(),
  };

  state.entries = editingEntry
    ? state.entries.map((entry) => (entry.id === editingEntry.id ? nextEntry : entry))
    : [nextEntry, ...state.entries];

  saveBanks();
  saveEntries();
  closeEntryEditor();
  render();
});

els.entryList.addEventListener("click", handleEntryListClick);
els.expensePreviewList.addEventListener("click", handleExpensePreviewClick);
els.incomePreviewList.addEventListener("click", handleEntryListClick);
els.expenseArchiveList.addEventListener("click", handleEntryListClick);
els.closeExpenseArchiveBtn.addEventListener("click", closeExpenseArchive);
els.expenseArchiveOverlay.addEventListener("click", (event) => {
  if (event.target === els.expenseArchiveOverlay) closeExpenseArchive();
});

els.clearBtn.addEventListener("click", () => {
  if (!state.entries.length) return;
  const confirmed = confirm("A dëshiron t'i fshish të gjithë zërat dhe t'i kthesh efektet në llogari?");
  if (!confirmed) return;

  createAutoBackup();
  state.entries.forEach((entry) => {
    if (entry.bankId) applyBankDelta(entry.bankId, entry.type === "income" ? -entry.amount : entry.amount);
  });
  state.entries = [];
  saveBanks();
  saveEntries();
  render();
});

els.monthFilter.addEventListener("change", render);
els.dailyPeriodInput.addEventListener("change", () => {
  state.selectedDailyDate = "";
  renderDailySpending();
});
els.dailySpendChart.addEventListener("click", handleDailyChartClick);
els.eurToLekRateInput.addEventListener("change", () => {
  const rate = Number(els.eurToLekRateInput.value);
  if (!rate || rate <= 0) {
    els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
    return;
  }
  state.exchangeRate = rate;
  saveExchangeRate(rate);
  setExchangeRateStatus(`Kurs manual: 1 € = ${formatRateInput(rate)} L`);
  renderDailySpending();
});
els.refreshRateBtn.addEventListener("click", refreshBankOfAlbaniaRate);
document.querySelectorAll("[data-daily-currency]").forEach((button) => {
  button.addEventListener("click", () => {
    state.dailyCurrency = button.dataset.dailyCurrency;
    syncDailyCurrencyControls();
    renderDailySpending();
  });
});
els.exportBtn.addEventListener("click", exportData);
els.themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveTheme();
  applyTheme();
});
els.importInput.addEventListener("change", importData);
els.restoreBackupBtn.addEventListener("click", restoreAutoBackup);

function render() {
  ensureDefaultBanks();
  const accountTotals = bankTotals();
  const now = new Date();
  const currentMonth = monthKey(now);
  const today = todayIso();
  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(currentMonth));
  const spentToday = state.entries.filter((entry) => entry.type === "expense" && entry.date === today).reduce(sumMoneyTotals, emptyMoneyTotals());
  const spentMonth = monthEntries.filter((entry) => entry.type === "expense").reduce(sumMoneyTotals, emptyMoneyTotals());
  const incomeMonth = monthEntries.filter((entry) => entry.type === "income").reduce(sumMoneyTotals, emptyMoneyTotals());
  const dayOfMonth = now.getDate();
  const dailyAverage = divideMoneyTotals(spentMonth, dayOfMonth);

  setExactValues(els.incomeValue, els.incomeAlt, accountTotals);
  setExactValues(els.balanceValue, els.balanceAlt, accountTotals);
  setExactValues(els.accountsLekValue, els.accountsEuroValue, accountTotals);
  setExactValues(els.accountsLekModalValue, els.accountsEuroModalValue, accountTotals);
  setExactValues(els.expenseValue, els.expenseAlt, spentMonth);
  setExactValues(els.gaugeIncomeValue, els.gaugeIncomeAlt, spentMonth);
  setExactValues(els.monthIncomeValue, els.monthIncomeAlt, incomeMonth);
  setExactValues(els.todaySpent, els.todaySpentAlt, spentToday);
  setExactValues(els.monthSpent, els.monthSpentAlt, spentMonth);
  setExactValues(els.dailyAverage, els.dailyAverageAlt, dailyAverage);
  if (els.currentExpenseMonth) els.currentExpenseMonth.textContent = monthLabel(currentMonth);
  if (els.currentIncomeMonth) els.currentIncomeMonth.textContent = monthLabel(currentMonth);
  renderLimits();
  renderRates(spentMonth, incomeMonth);

  renderMonthFilter();
  renderBankOptions();
  renderAccounts();
  renderPreviewEntries();
  renderListVisibility();
  syncDailyCurrencyControls();
  renderDailySpending();
  renderEntries();
  renderCategories();
}

function renderRates(spentMonth, incomeMonth = emptyMoneyTotals()) {
  const lekSpent = Math.max(spentMonth.ALL, 0);
  const eurSpent = Math.max(spentMonth.EUR, 0);
  const lekIncome = Math.max(incomeMonth.ALL, 0);
  const eurIncome = Math.max(incomeMonth.EUR, 0);
  const spendingRate = limitPercent(lekSpent, state.limits.expenseALL);
  const euroSpendingRate = limitPercent(eurSpent, state.limits.expenseEUR);
  const incomeLekRate = limitPercent(lekIncome, state.limits.incomeALL);
  const incomeEuroRate = limitPercent(eurIncome, state.limits.incomeEUR);
  const remainingRate = Math.max(100 - spendingRate, 0);

  if (els.spendingRateValue) els.spendingRateValue.textContent = percent(spendingRate);
  if (els.savingsRateValue) els.savingsRateValue.textContent = `${moneyLek(Math.max(state.limits.expenseALL - lekSpent, 0))}`;
  if (els.spendingRateBar) els.spendingRateBar.style.width = `${spendingRate}%`;
  if (els.expenseEuroRateBar) els.expenseEuroRateBar.style.width = `${euroSpendingRate}%`;
  if (els.incomeLekRateBar) els.incomeLekRateBar.style.width = `${incomeLekRate}%`;
  if (els.incomeEuroRateBar) els.incomeEuroRateBar.style.width = `${incomeEuroRate}%`;
  if (els.savingsRateBar) els.savingsRateBar.style.width = `${remainingRate}%`;
  if (els.gaugeArc) els.gaugeArc.style.setProperty("--gauge-progress", `${(spendingRate / 100) * 180}deg`);
}

function renderLimits() {
  els.expenseLimitLekValue.textContent = moneyLekShort(state.limits.expenseALL);
  els.expenseLimitEuroValue.textContent = moneyEuroNoDecimals(state.limits.expenseEUR);
  els.incomeLimitLekValue.textContent = moneyLekShort(state.limits.incomeALL);
  els.incomeLimitEuroValue.textContent = moneyEuroNoDecimals(state.limits.incomeEUR);
}

function limitPercent(value, limit) {
  return limit > 0 ? Math.min((value / limit) * 100, 100) : 0;
}

function renderAccounts() {
  els.accountList.innerHTML = "";
  els.accountListModal.innerHTML = "";

  state.banks.forEach((bank) => {
    const markup = `
      <div class="account-main">
        <strong></strong>
        <span>${bank.currency === "EUR" ? "Euro" : "Lekë"}${bank.isDefault ? " · default" : ""}</span>
      </div>
      <div class="account-balance">${bank.currency === "EUR" ? moneyEuro(bank.balance) : moneyLek(bank.balance)}</div>
      <div class="account-actions">
        <button type="button" data-default-bank="${bank.id}">Default</button>
        <button type="button" data-edit-bank="${bank.id}">Edit</button>
      </div>
    `;
    [els.accountList, els.accountListModal].forEach((list) => {
      const row = document.createElement("article");
      row.className = "account-row";
      row.innerHTML = markup;
      row.querySelector(".account-main strong").textContent = bank.name;
      list.append(row);
    });
  });
}

function openAccountsWindow() {
  els.accountsOverlay.hidden = false;
}

function closeAccountsWindow() {
  els.accountsOverlay.hidden = true;
}

function openLimitsEditor() {
  els.expenseLimitLekInput.value = state.limits.expenseALL;
  els.expenseLimitEuroInput.value = state.limits.expenseEUR;
  els.incomeLimitLekInput.value = state.limits.incomeALL;
  els.incomeLimitEuroInput.value = state.limits.incomeEUR;
  els.limitsOverlay.hidden = false;
  els.expenseLimitLekInput.focus();
}

function closeLimitsEditor() {
  els.limitsOverlay.hidden = true;
  els.limitsForm.reset();
}

function toggleList(key) {
  state.visibleLists[key] = !state.visibleLists[key];
  renderListVisibility();
}

function renderListVisibility() {
  setListVisibility(els.toggleExpensesBtn, [els.expensePreviewList], state.visibleLists.expenses);
  setListVisibility(els.toggleIncomeBtn, [els.incomePreviewList], state.visibleLists.income);
  setListVisibility(els.toggleAccountsBtn, [els.accountList, els.newAccountBtn], state.visibleLists.accounts);
}

function setListVisibility(button, targets, visible) {
  if (!button) return;
  button.setAttribute("aria-expanded", String(visible));
  button.classList.toggle("is-collapsed", !visible);
  targets.forEach((target) => {
    if (target) target.hidden = !visible;
  });
}

function openEntryEditor(type = state.type, entryId = "") {
  const entry = state.entries.find((item) => item.id === entryId);
  state.editingEntryId = entry?.id || "";
  state.type = entry?.type || type;
  els.entryForm.reset();
  els.dateInput.value = entry?.date || todayIso();
  els.amountInput.value = entry?.amount || "";
  els.noteInput.value = entry?.note || "";
  syncTypeControls();
  if (entry) {
    els.categoryInput.value = entry.category;
    els.currencyInput.value = entry.currency;
    renderBankOptions();
    els.bankInput.value = entry.bankId || "";
  }
  els.submitLabel.textContent = entry ? "Ruaj ndryshimet" : state.type === "expense" ? "Shto shpenzim" : "Shto të ardhur";
  els.entryOverlay.hidden = false;
  els.amountInput.focus();
}

function closeEntryEditor() {
  state.editingEntryId = "";
  els.entryOverlay.hidden = true;
  els.entryForm.reset();
  els.dateInput.value = todayIso();
  syncTypeControls();
}

function openAccountEditor(bankId = "") {
  const bank = findBank(bankId);
  els.accountForm.reset();
  els.accountIdInput.value = bank ? bank.id : "";
  els.accountEditorTitle.textContent = bank ? "Edito llogarinë" : "Shto llogari";
  els.saveAccountBtn.textContent = bank ? "Ruaj ndryshimet" : "Shto llogari";
  els.deleteAccountBtn.hidden = !bank;
  els.accountForm.classList.toggle("is-editing", Boolean(bank));
  els.accountCurrencyInput.disabled = Boolean(bank);

  if (bank) {
    els.accountNameInput.value = bank.name;
    els.accountCurrencyInput.value = bank.currency;
    els.accountBalanceInput.value = bank.balance;
    els.accountDefaultInput.checked = Boolean(bank.isDefault);
  }

  els.accountEditorOverlay.hidden = false;
  els.accountNameInput.focus();
}

function closeAccountEditor() {
  els.accountEditorOverlay.hidden = true;
  els.accountCurrencyInput.disabled = false;
  els.accountForm.classList.remove("is-editing");
  els.accountForm.reset();
  els.accountIdInput.value = "";
}

function deleteBank(bankId) {
  const bank = findBank(bankId);
  if (!bank) return;

  const used = state.entries.some((entry) => entry.bankId === bank.id);
  const message = used
    ? "Kjo llogari ka transaksione. Nëse e fshin, transaksionet mbeten pa llogari. Vazhdo?"
    : "A dëshiron ta fshish këtë llogari?";
  if (!confirm(message)) return;

  createAutoBackup();
  state.banks = state.banks.filter((item) => item.id !== bank.id);
  state.entries = state.entries.map((entry) => (entry.bankId === bank.id ? { ...entry, bankId: "" } : entry));
  ensureDefaultBanks();
  saveBanks();
  saveEntries();
  closeAccountEditor();
  render();
}

function handleEntryListClick(event) {
  const editButton = event.target.closest("[data-edit-entry]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    openEntryEditor(undefined, editButton.dataset.editEntry);
    return;
  }

  if (!deleteButton) return;
  const entry = state.entries.find((item) => item.id === deleteButton.dataset.delete);
  if (!entry) return;

  createAutoBackup();
  if (entry.bankId) applyBankDelta(entry.bankId, entry.type === "income" ? -entry.amount : entry.amount);
  state.entries = state.entries.filter((item) => item.id !== entry.id);
  saveBanks();
  saveEntries();
  render();
}

function renderBankOptions() {
  const currency = els.currencyInput.value;
  const banks = state.banks.filter((bank) => bank.currency === currency);

  els.bankInput.innerHTML = banks.map((bank) => `<option value="${bank.id}">${escapeHtml(bank.name)}</option>`).join("");
  const defaultForCurrency = banks.find((bank) => bank.isDefault) || banks[0];
  if (defaultForCurrency) els.bankInput.value = defaultForCurrency.id;
}

function renderMonthFilter() {
  const months = [...new Set(state.entries.map((entry) => entry.date.slice(0, 7)))].sort().reverse();
  const current = els.monthFilter.value || monthKey(new Date());
  const options = months.length ? months : [current];

  els.monthFilter.innerHTML = options.map((key) => `<option value="${key}">${monthLabel(key)}</option>`).join("");
  els.monthFilter.value = options.includes(current) ? current : options[0];
}

function renderPreviewEntries() {
  const currentMonth = monthKey(new Date());
  const expenseEntries = state.entries.filter((entry) => entry.type === "expense" && entry.date.startsWith(currentMonth));
  renderExpensePreviewList(expenseEntries, currentMonth);
  renderPreviewList(
    els.incomePreviewList,
    state.entries.filter((entry) => entry.type === "income" && entry.date.startsWith(currentMonth)).slice(0, 4),
    "Nuk ka të ardhura këtë muaj."
  );
  if (!els.expenseArchiveOverlay.hidden) renderExpenseArchive();
}

function renderPreviewList(container, entries, emptyText) {
  container.innerHTML = "";
  if (!entries.length) {
    container.innerHTML = `<div class="empty-line">${emptyText}</div>`;
    return;
  }

  entries.forEach((entry) => container.append(createEntryRow(entry, "preview")));
}

function renderExpensePreviewList(entries, currentMonth) {
  const hasArchive = entries.length > EXPENSE_PREVIEW_LIMIT || hasOtherExpenseMonths(currentMonth);
  els.expensePreviewList.innerHTML = "";

  if (!entries.length) {
    els.expensePreviewList.innerHTML = `<div class="empty-line">Nuk ka shpenzime këtë muaj.</div>`;
  } else {
    entries.slice(0, EXPENSE_PREVIEW_LIMIT).forEach((entry) => els.expensePreviewList.append(createEntryRow(entry, "preview")));
  }

  if (hasArchive) els.expensePreviewList.append(createMoreRow());
}

function createMoreRow() {
  const button = document.createElement("button");
  button.className = "more-row";
  button.type = "button";
  button.dataset.openExpenseArchive = "true";
  button.textContent = "More";
  return button;
}

function hasOtherExpenseMonths(currentMonth) {
  return state.entries.some((entry) => entry.type === "expense" && !entry.date.startsWith(currentMonth));
}

function handleExpensePreviewClick(event) {
  const moreButton = event.target.closest("[data-open-expense-archive]");
  if (moreButton) {
    openExpenseArchive();
    return;
  }

  handleEntryListClick(event);
}

function openExpenseArchive() {
  renderExpenseArchive();
  els.expenseArchiveOverlay.hidden = false;
}

function closeExpenseArchive() {
  els.expenseArchiveOverlay.hidden = true;
}

function renderExpenseArchive() {
  const months = expenseMonths();
  const currentMonth = monthKey(new Date());
  const hasCurrentMonth = months.some((month) => month.key === currentMonth);

  els.expenseArchiveList.innerHTML = "";
  if (!months.length) {
    els.expenseArchiveList.innerHTML = `<div class="empty-line">Nuk ka shpenzime për t'u shfaqur.</div>`;
    return;
  }

  months.forEach((month, index) => {
    const details = document.createElement("details");
    details.className = "archive-month";
    details.open = month.key === currentMonth || (!hasCurrentMonth && index === 0);

    const summary = document.createElement("summary");
    summary.innerHTML = `
      <span class="archive-arrow"></span>
      <strong>${monthLabel(month.key)}</strong>
      <small>${month.entries.length} zëra · ${formatMoneyTotals(month.totals)}</small>
    `;

    const list = document.createElement("div");
    list.className = "archive-month-list";
    month.entries.forEach((entry) => list.append(createEntryRow(entry, "preview")));
    details.append(summary, list);
    els.expenseArchiveList.append(details);
  });
}

function expenseMonths() {
  const groups = new Map();
  const sortedEntries = state.entries
    .filter((entry) => entry.type === "expense")
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  sortedEntries.forEach((entry) => {
    const key = entry.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });

  const currentMonth = monthKey(new Date());
  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === currentMonth) return -1;
      if (b === currentMonth) return 1;
      return b.localeCompare(a);
    })
    .map(([key, entries]) => ({
      key,
      entries,
      totals: entries.reduce(sumMoneyTotals, emptyMoneyTotals()),
    }));
}

function renderDailySpending() {
  const dayCount = Number(els.dailyPeriodInput.value) || 7;
  const mode = state.dailyCurrency === "TOTAL" ? "TOTAL" : normalizeCurrency(state.dailyCurrency);
  const isYearScroll = dayCount === 7;
  const days = isYearScroll ? buildYearToDateRange() : buildDateRange(dayCount);
  const totalsByDay = new Map(days.map((day) => [day, 0]));

  state.entries.forEach((entry) => {
    if (entry.type !== "expense") return;
    if (!totalsByDay.has(entry.date)) return;
    const amount = dailyChartAmount(entry, mode);
    if (!amount) return;
    totalsByDay.set(entry.date, totalsByDay.get(entry.date) + amount);
  });

  const dailyTotals = days.map((date) => ({ date, value: totalsByDay.get(date) || 0 }));
  const activeValues = dailyTotals.map((day) => day.value).filter((value) => value > 0);
  const min = activeValues.length ? Math.min(...activeValues) : 0;
  const max = activeValues.length ? Math.max(...activeValues) : 0;
  const avg = activeValues.length ? activeValues.reduce((sum, value) => sum + value, 0) / activeValues.length : 0;

  els.dailyMinValue.textContent = moneyShortByCurrency(min, mode);
  els.dailyAvgValue.textContent = moneyShortByCurrency(avg, mode);
  els.dailyMaxValue.textContent = moneyShortByCurrency(max, mode);
  els.dailySpendChart.innerHTML = "";
  els.dailySpendChart.style.setProperty("--day-count", dailyTotals.length);
  els.dailySpendChart.classList.toggle("is-scrollable", isYearScroll);

  dailyTotals.forEach((day) => {
    const ratio = max > 0 ? day.value / max : 0;
    const line = document.createElement("button");
    line.type = "button";
    line.className = `daily-line ${dailyLineTone(day.value, avg, max)}`;
    line.classList.toggle("is-selected", day.date === state.selectedDailyDate);
    line.style.height = `${Math.round(18 + ratio * 88)}px`;
    line.title = `${formatDate(day.date)}: ${moneyByCurrency(day.value, mode)}`;
    line.setAttribute("aria-label", `${formatDate(day.date)} ${moneyByCurrency(day.value, mode)}`);
    line.dataset.dailyDate = day.date;
    line.dataset.dailyValue = String(day.value);
    line.dataset.dailyMode = mode;
    els.dailySpendChart.append(line);
  });

  const selectedDay = dailyTotals.find((day) => day.date === state.selectedDailyDate);
  if (!selectedDay) state.selectedDailyDate = "";
  renderDailySelectedValue(selectedDay, mode);
  scrollDailyChartToFocus(isYearScroll);
}

function handleDailyChartClick(event) {
  const line = event.target.closest("[data-daily-date]");
  if (!line) return;

  state.selectedDailyDate = line.dataset.dailyDate;
  els.dailySpendChart.querySelectorAll(".daily-line.is-selected").forEach((item) => item.classList.remove("is-selected"));
  line.classList.add("is-selected");
  renderDailySelectedValue(
    {
      date: line.dataset.dailyDate,
      value: Number(line.dataset.dailyValue) || 0,
    },
    line.dataset.dailyMode
  );
}

function renderDailySelectedValue(day, mode) {
  if (!day) {
    els.dailySelectedValue.hidden = true;
    els.dailySelectedValue.textContent = "";
    return;
  }

  els.dailySelectedValue.hidden = false;
  els.dailySelectedValue.textContent = `${formatDate(day.date)} · ${dailyModeLabel(mode)} ${moneyShortByCurrency(day.value, mode)}`;
}

function scrollDailyChartToFocus(isScrollable) {
  if (!isScrollable) return;

  requestAnimationFrame(() => {
    const selectedLine = els.dailySpendChart.querySelector(".daily-line.is-selected");
    const target = selectedLine || els.dailySpendChart.lastElementChild;
    target?.scrollIntoView({ block: "nearest", inline: "end" });
  });
}

function dailyChartAmount(entry, mode) {
  const currency = normalizeCurrency(entry.currency);
  const amount = Number(entry.amount) || 0;
  if (mode === "TOTAL") return currency === "EUR" ? amount * state.exchangeRate : amount;
  return currency === mode ? amount : 0;
}

function syncDailyCurrencyControls() {
  document.querySelectorAll("[data-daily-currency]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dailyCurrency === state.dailyCurrency);
  });
  els.exchangeRateRow.hidden = state.dailyCurrency !== "TOTAL";
  if (state.dailyCurrency === "TOTAL") {
    setExchangeRateStatus(`BSH/manual: 1 € = ${formatRateInput(state.exchangeRate)} L`);
  }
}

function dailyLineTone(value, average, max) {
  if (!value || !max) return "low";
  const ratio = value / max;
  if (value >= max || value >= average * 1.25 || ratio >= 0.72) return "high";
  if (value <= average * 0.7 || ratio <= 0.32) return "low";
  return "mid";
}

function renderEntries() {
  els.entryList.innerHTML = "";

  if (!state.entries.length) {
    els.entryList.append(els.emptyTemplate.content.cloneNode(true));
    return;
  }

  state.entries.slice(0, 40).forEach((entry) => {
    els.entryList.append(createEntryRow(entry));
  });
}

function createEntryRow(entry, variant = "history") {
  const bank = findBank(entry.bankId);
  const row = document.createElement("article");
  row.className = variant === "preview" ? "entry-row pill-row" : "entry-row";
  row.innerHTML = `
      <div class="entry-left">
        <div class="entry-title"></div>
        <div class="entry-meta">${entry.category} · ${formatDate(entry.date)}${bank ? ` · ${escapeHtml(bank.name)}` : ""}</div>
      </div>
      <div class="entry-amount ${entry.type}">
        <strong>${entry.type === "income" ? "+" : "-"}${moneyOriginal(entry)}</strong>
      </div>
      <button class="edit-entry-button" type="button" data-edit-entry="${entry.id}">Edit</button>
    `;
  row.querySelector(".entry-title").textContent = entry.note || entry.category;
  return row;
}

function renderCategories() {
  const selectedMonth = els.monthFilter.value || monthKey(new Date());
  const expenses = state.entries.filter((entry) => entry.type === "expense" && entry.date.startsWith(selectedMonth));
  const byCategory = expenses.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = emptyMoneyTotals();
    addEntryAmount(acc[entry.category], entry);
    return acc;
  }, {});

  const rows = Object.entries(byCategory)
    .map(([category, totals]) => ({ category, totals, weight: Math.abs(totals.ALL) + Math.abs(totals.EUR) }))
    .sort((a, b) => b.weight - a.weight);
  els.categoryList.innerHTML = "";

  if (!rows.length) {
    els.categoryList.innerHTML = `<div class="empty-state"><p>Nuk ka shpenzime për këtë muaj.</p></div>`;
    drawChart([]);
    return;
  }

  rows.forEach(({ category, totals, weight }, index) => {
    const max = Math.max(...rows.map((row) => row.weight), 1);
    const percent = Math.round((weight / max) * 100);
    const item = document.createElement("div");
    item.className = "category-item";
    item.innerHTML = `
      <strong>${category}</strong>
      <span>${formatMoneyTotals(totals)}</span>
      <div class="category-track"><div class="category-bar" style="width:${percent}%; background:${colors[index % colors.length]}"></div></div>
    `;
    els.categoryList.append(item);
  });

  drawChart(rows);
}

function drawChart(rows) {
  const canvas = els.categoryChart;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  if (!rows.length) {
    ctx.fillStyle = "#63736e";
    ctx.font = "700 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Shto shpenzime për të parë grafikun", width / 2, height / 2);
    return;
  }

  const max = Math.max(...rows.map((row) => row.weight), 1);
  const barGap = 8;
  const barWidth = Math.max(18, (width - barGap * (rows.length - 1)) / rows.length);

  rows.forEach(({ category, weight }, index) => {
    const barHeight = Math.max(14, (weight / max) * (height - 42));
    const x = index * (barWidth + barGap);
    const y = height - barHeight - 24;

    ctx.fillStyle = colors[index % colors.length];
    roundRect(ctx, x, y, barWidth, barHeight, 7);
    ctx.fill();

    ctx.fillStyle = "#10211d";
    ctx.font = "700 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(category.slice(0, 8), x + barWidth / 2, height - 6);
  });
}

function syncTypeControls() {
  document.querySelectorAll("[data-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.type === state.type);
  });

  els.categoryInput.innerHTML = categories[state.type].map((category) => `<option>${category}</option>`).join("");
  els.receiptAiTools.hidden = state.type !== "expense";
  if (state.type !== "expense") setReceiptAiStatus("");
  els.submitLabel.textContent = state.type === "expense" ? "Shto shpenzim" : "Shto të ardhur";
  renderBankOptions();
}

async function handleReceiptImage(event) {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const endpoint = receiptAiEndpoint();
    if (!endpoint) {
      setReceiptAiStatus("AI nuk është lidhur ende.");
      return;
    }

    const token = receiptAiToken();
    state.type = "expense";
    syncTypeControls();
    setReceiptAiStatus("Po lexohet fatura...");

    const image = await resizeReceiptImage(file);
    const formData = new FormData();
    formData.append("receipt", image, image.name || "receipt.jpg");

    const headers = token ? { "X-Receipt-Token": token } : {};
    const response = await fetch(endpoint, { method: "POST", headers, body: formData });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Fatura nuk u lexua.");

    applyReceiptResult(result);
    setReceiptAiStatus("U mbush nga fatura. Kontrolloje para se ta ruash.");
  } catch (error) {
    setReceiptAiStatus(error.message || "Fatura nuk u lexua.");
  } finally {
    event.target.value = "";
  }
}

function receiptAiEndpoint() {
  const saved = localStorage.getItem(RECEIPT_AI_ENDPOINT_KEY);
  if (saved) return saved;

  const endpoint = prompt("Vendos linkun e AI backend për faturat.");
  if (!endpoint) return "";
  localStorage.setItem(RECEIPT_AI_ENDPOINT_KEY, endpoint.trim());
  return endpoint.trim();
}

function receiptAiToken() {
  const saved = localStorage.getItem(RECEIPT_AI_TOKEN_KEY);
  if (saved) return saved;

  const token = prompt("Vendos kodin sekret të AI backend.");
  if (!token) return "";
  localStorage.setItem(RECEIPT_AI_TOKEN_KEY, token.trim());
  return token.trim();
}

function applyReceiptResult(result) {
  const currency = normalizeCurrency(result.currency);
  const category = categories.expense.includes(result.category) ? result.category : "Tjetër";
  const amount = Number(result.amount) || 0;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(result.date || "") ? result.date : todayIso();
  const description = String(result.description || result.merchant || "Faturë").trim().slice(0, 60);

  els.currencyInput.value = currency;
  renderBankOptions();
  els.amountInput.value = amount ? String(amount) : "";
  els.categoryInput.value = category;
  els.noteInput.value = description || category;
  els.dateInput.value = date;
}

function setReceiptAiStatus(text) {
  els.receiptAiStatus.textContent = text;
}

async function resizeReceiptImage(file) {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await imageFromFile(file);
  const maxSide = 1600;
  const scale = Math.min(maxSide / Math.max(bitmap.width, bitmap.height), 1);
  const width = Math.max(Math.round(bitmap.width * scale), 1);
  const height = Math.max(Math.round(bitmap.height * scale), 1);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  return new File([blob || file], "receipt.jpg", { type: "image/jpeg" });
}

async function imageFromFile(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {}
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Fotoja nuk u hap."));
    };
    image.src = url;
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify({ entries: state.entries, banks: state.banks }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `financat-e-mia-${todayIso()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.entries)) throw new Error("Format i pavlefshëm");

      const importedEntries = parsed.entries.filter(isValidEntry);
      const importedBanks = Array.isArray(parsed.banks)
        ? parsed.banks.filter(isValidBank)
        : legacySavingsToBanks(normalizeMoneyTotals(parsed.savings));

      if (!importedEntries.length && !importedBanks?.length) {
        alert("Ky backup nuk ka të dhëna për t'u importuar.");
        return;
      }

      createAutoBackup();
      const beforeCount = state.entries.length;
      state.entries = mergeEntries(state.entries, importedEntries);
      if (importedBanks?.length) state.banks = mergeBanks(state.banks, importedBanks);
      ensureDefaultBanks();
      saveBanks();
      saveEntries();
      render();

      const addedCount = state.entries.length - beforeCount;
      alert(`Importi u krye. U shtuan ${addedCount} hyrje të reja.`);
    } catch {
      alert("Nuk u importuan të dhënat. Kontrollo skedarin JSON.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved.filter(isValidEntry);

    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(legacy)) {
        const entries = legacy.filter(isValidEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return entries;
      }
    }

    return [];
  } catch {
    return [];
  }
}

function loadBanks() {
  try {
    const saved = JSON.parse(localStorage.getItem(BANKS_KEY));
    if (Array.isArray(saved) && saved.length) return normalizeBanks(saved.filter(isValidBank));
  } catch {}

  const legacySavings = loadLegacySavings();
  const banks = [
    { name: "Llogari biznesi euro", currency: "EUR", balance: 0, isDefault: false },
    { name: "Llogari biznesi lekë", currency: "ALL", balance: 0, isDefault: false },
    { name: "Llogari personale euro", currency: "EUR", balance: legacySavings.EUR, isDefault: true },
    { name: "Llogari personale lekë", currency: "ALL", balance: legacySavings.ALL, isDefault: true },
    { name: "Bankë italiane euro", currency: "EUR", balance: 0, isDefault: false },
  ].map((bank) => ({ ...bank, id: crypto.randomUUID(), createdAt: new Date().toISOString() }));

  localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
  return banks;
}

function legacySavingsToBanks(savings) {
  const banks = [];
  if (savings.ALL) {
    banks.push({
      id: crypto.randomUUID(),
      name: "Llogari personale lekë",
      currency: "ALL",
      balance: savings.ALL,
      isDefault: true,
      createdAt: new Date().toISOString(),
    });
  }
  if (savings.EUR) {
    banks.push({
      id: crypto.randomUUID(),
      name: "Llogari personale euro",
      currency: "EUR",
      balance: savings.EUR,
      isDefault: true,
      createdAt: new Date().toISOString(),
    });
  }
  return banks;
}

function loadLegacySavings() {
  try {
    return normalizeMoneyTotals(JSON.parse(localStorage.getItem(LEGACY_SAVINGS_KEY)));
  } catch {
    return emptyMoneyTotals();
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
}

function saveBanks() {
  localStorage.setItem(BANKS_KEY, JSON.stringify(state.banks));
}

function loadLimits() {
  try {
    const saved = JSON.parse(localStorage.getItem(LIMITS_KEY));
    return {
      expenseALL: positiveNumber(saved?.expenseALL, DEFAULT_LIMITS.expenseALL),
      expenseEUR: positiveNumber(saved?.expenseEUR, DEFAULT_LIMITS.expenseEUR),
      incomeALL: positiveNumber(saved?.incomeALL, DEFAULT_LIMITS.incomeALL),
      incomeEUR: positiveNumber(saved?.incomeEUR, DEFAULT_LIMITS.incomeEUR),
    };
  } catch {
    return { ...DEFAULT_LIMITS };
  }
}

function saveLimits() {
  localStorage.setItem(LIMITS_KEY, JSON.stringify(state.limits));
}

function loadExchangeRate() {
  const saved = Number(localStorage.getItem(EXCHANGE_RATE_KEY));
  return saved > 0 ? saved : DEFAULT_EUR_TO_ALL_RATE;
}

function saveExchangeRate(rate) {
  localStorage.setItem(EXCHANGE_RATE_KEY, String(rate));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function saveTheme() {
  localStorage.setItem(THEME_KEY, state.theme);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  els.themeToggle.setAttribute("aria-pressed", String(state.theme === "dark"));
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", state.theme === "dark" ? "#050506" : "#ffffff");
}

async function refreshBankOfAlbaniaRate() {
  setExchangeRateStatus("Po merret kursi nga BSH...");
  els.refreshRateBtn.disabled = true;

  try {
    const response = await fetch(BANK_OF_ALBANIA_RATE_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Kursi nuk u lexua.");

    const html = await response.text();
    const rate = parseBankOfAlbaniaEuroRate(html);
    if (!rate) throw new Error("EUR nuk u gjet.");

    state.exchangeRate = rate;
    els.eurToLekRateInput.value = formatRateInput(rate);
    saveExchangeRate(rate);
    setExchangeRateStatus(`BSH: 1 € = ${formatRateInput(rate)} L`);
    renderDailySpending();
  } catch {
    setExchangeRateStatus("Nuk u mor automatikisht. Ndryshoje manualisht.");
  } finally {
    els.refreshRateBtn.disabled = false;
  }
}

function parseBankOfAlbaniaEuroRate(html) {
  const documentText =
    typeof DOMParser === "undefined" ? html : new DOMParser().parseFromString(html, "text/html").body?.textContent || html;
  const text = documentText.replace(/\s+/g, " ");
  const match = text.match(/Euro\s+EUR\s+([0-9]+(?:[.,][0-9]+)?)/i) || text.match(/Euro[\s\S]{0,120}?EUR[\s\S]{0,120}?([0-9]+(?:[.,][0-9]+)?)/i);
  return match ? Number(match[1].replace(",", ".")) : 0;
}

function setExchangeRateStatus(text) {
  els.exchangeRateStatus.textContent = text;
}

function createAutoBackup() {
  const hasData = state.entries.length || state.banks.length;
  if (!hasData) return;

  localStorage.setItem(
    BACKUP_KEY,
    JSON.stringify({
      entries: state.entries,
      banks: state.banks,
      savedAt: new Date().toISOString(),
    })
  );
}

function restoreAutoBackup() {
  try {
    const backup = JSON.parse(localStorage.getItem(BACKUP_KEY));
    if (!backup || !Array.isArray(backup.entries)) {
      alert("Nuk ka backup lokal për të rikthyer.");
      return;
    }

    const confirmed = confirm("A dëshiron të rikthesh backup-in lokal? Të dhënat aktuale do ruhen si backup para rikthimit.");
    if (!confirmed) return;

    createAutoBackup();
    state.entries = backup.entries.filter(isValidEntry);
    state.banks = normalizeBanks(Array.isArray(backup.banks) ? backup.banks.filter(isValidBank) : loadBanks());
    saveEntries();
    saveBanks();
    render();
  } catch {
    alert("Backup-i lokal nuk mund të lexohet.");
  }
}

function bankTotals() {
  return state.banks.reduce((totals, bank) => {
    totals[bank.currency] += Number(bank.balance) || 0;
    return totals;
  }, emptyMoneyTotals());
}

function defaultBank(currency) {
  return state.banks.find((bank) => bank.currency === currency && bank.isDefault) || state.banks.find((bank) => bank.currency === currency);
}

function findBank(id) {
  return state.banks.find((bank) => bank.id === id);
}

function applyBankDelta(id, delta) {
  const bank = findBank(id);
  if (!bank) return;
  bank.balance = (Number(bank.balance) || 0) + delta;
}

function ensureDefaultBanks() {
  ["ALL", "EUR"].forEach((currency) => {
    const banks = state.banks.filter((bank) => bank.currency === currency);
    if (!banks.length) return;
    if (!banks.some((bank) => bank.isDefault)) banks[0].isDefault = true;
  });
}

function normalizeBanks(banks) {
  const normalized = banks.map((bank) => ({
    id: bank.id || crypto.randomUUID(),
    name: String(bank.name || "Llogari").trim(),
    currency: normalizeCurrency(bank.currency),
    balance: Number(bank.balance) || 0,
    isDefault: Boolean(bank.isDefault),
    createdAt: bank.createdAt || new Date().toISOString(),
  }));

  ["ALL", "EUR"].forEach((currency) => {
    const sameCurrency = normalized.filter((bank) => bank.currency === currency);
    const firstDefault = sameCurrency.find((bank) => bank.isDefault);
    sameCurrency.forEach((bank) => {
      bank.isDefault = firstDefault ? bank.id === firstDefault.id : bank === sameCurrency[0];
    });
  });

  return normalized;
}

function mergeBanks(currentBanks, importedBanks) {
  const merged = [...currentBanks];
  const seen = new Set(currentBanks.map((bank) => bank.id));

  importedBanks.forEach((bank) => {
    if (seen.has(bank.id)) {
      const existing = merged.find((item) => item.id === bank.id);
      Object.assign(existing, normalizeBanks([bank])[0]);
      return;
    }
    seen.add(bank.id);
    merged.push(normalizeBanks([bank])[0]);
  });

  return normalizeBanks(merged);
}

function isValidEntry(entry) {
  return entry && ["income", "expense"].includes(entry.type) && Number(entry.amount) > 0 && entry.note && entry.date;
}

function isValidBank(bank) {
  return bank && bank.name && ["ALL", "EUR"].includes(normalizeCurrency(bank.currency));
}

function mergeEntries(currentEntries, importedEntries) {
  const merged = [...currentEntries];
  const seen = new Set(currentEntries.map(entryKey));

  importedEntries.forEach((entry) => {
    const key = entryKey(entry);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(entry);
  });

  return merged.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
}

function entryKey(entry) {
  return entry.id || [entry.type, entry.amount, normalizeCurrency(entry.currency), entry.note, entry.category, entry.date].join("|");
}

function emptyMoneyTotals() {
  return { ALL: 0, EUR: 0 };
}

function normalizeMoneyTotals(value) {
  return {
    ALL: Number(value?.ALL) || 0,
    EUR: Number(value?.EUR) || 0,
  };
}

function addEntryAmount(totals, entry) {
  const currency = normalizeCurrency(entry.currency);
  totals[currency] += Number(entry.amount) || 0;
  return totals;
}

function sumMoneyTotals(totals, entry) {
  return addEntryAmount(totals, entry);
}

function divideMoneyTotals(totals, divisor) {
  return {
    ALL: totals.ALL / divisor,
    EUR: totals.EUR / divisor,
  };
}

function normalizeCurrency(currency) {
  return currency === "EUR" ? "EUR" : "ALL";
}

function setExactValues(mainEl, altEl, totals) {
  if (mainEl) mainEl.textContent = moneyLek(totals.ALL);
  if (altEl) altEl.textContent = moneyEuro(totals.EUR);
}

function formatMoneyTotals(totals) {
  const parts = [];
  if (totals.ALL) parts.push(moneyLek(totals.ALL));
  if (totals.EUR) parts.push(moneyEuro(totals.EUR));
  return parts.length ? parts.join(" / ") : `${moneyLek(0)} / ${moneyEuro(0)}`;
}

function moneyLek(value) {
  return new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(value || 0) + " Lekë";
}

function moneyLekShort(value) {
  return new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(value || 0) + " L";
}

function moneyEuroShort(value) {
  return new Intl.NumberFormat("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0) + " €";
}

function moneyEuroNoDecimals(value) {
  return new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(value || 0) + " €";
}

function formatRateInput(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, useGrouping: false }).format(value || DEFAULT_EUR_TO_ALL_RATE);
}

function moneyShortByCurrency(value, currency) {
  return normalizeCurrency(currency) === "EUR" ? moneyEuroShort(value) : moneyLekShort(value);
}

function moneyByCurrency(value, currency) {
  return normalizeCurrency(currency) === "EUR" ? moneyEuro(value) : moneyLek(value);
}

function dailyModeLabel(mode) {
  if (mode === "TOTAL") return "Totali";
  return normalizeCurrency(mode) === "EUR" ? "Euro" : "Lekë";
}

function moneyEuro(value) {
  return new Intl.NumberFormat("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0) + " €";
}

function percent(value) {
  return new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(value || 0) + "%";
}

function moneyOriginal(entry) {
  return normalizeCurrency(entry.currency) === "EUR" ? moneyEuro(entry.amount) : moneyLek(entry.amount);
}

function formatDate(value) {
  const date = parseLocalDate(value);
  return `${String(date.getDate()).padStart(2, "0")} ${monthNames[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${monthNames[Number(month) - 1]} ${year}`;
}

function todayIso() {
  const date = new Date();
  return toLocalIso(date);
}

function toLocalIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDateRange(dayCount) {
  const end = parseLocalDate(todayIso());
  const start = addDays(end, -(dayCount - 1));
  return Array.from({ length: dayCount }, (_, index) => toLocalIso(addDays(start, index)));
}

function buildYearToDateRange() {
  const end = parseLocalDate(todayIso());
  const start = new Date(end.getFullYear(), 0, 1);
  const days = [];

  for (let date = start; date <= end; date = addDays(date, 1)) {
    days.push(toLocalIso(date));
  }

  return days;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return number >= 0 ? number : fallback;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("resize", () => renderCategories());
