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
  savingsALL: 100000,
  savingsEUR: 1000,
};
const DEFAULT_EUR_TO_ALL_RATE = 93.36;
const BANK_OF_ALBANIA_RATE_URL = "https://www.bankofalbania.org/Markets/Official_exchange_rate/";
const EXPENSE_PREVIEW_LIMIT = 10;
const DEFAULT_SAVINGS_GOAL_ALL = 10000;
const DEFAULT_SAVINGS_GOAL_MONTHS = 12;
let limitsEditorMode = "all";

const categories = {
  expense: ["Ushqim", "Transport", "Shtëpi", "Fatura", "Argëtim", "Shëndet", "Tjetër"],
  income: ["Rrogë", "Punë ekstra", "Biznes", "Dhuratë", "Tjetër"],
};

const colors = ["#ef6f5a", "#6f62db", "#34d184", "#111111", "#b5b5bb", "#dedee3", "#8f8f98"];
const monthNames = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
const dayNames = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];

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
  todayLabel: document.querySelector("#todayLabel"),
  activityRing: document.querySelector("#activityRing"),
  activityFoodValue: document.querySelector("#activityFoodValue"),
  activityBillsValue: document.querySelector("#activityBillsValue"),
  activityFunValue: document.querySelector("#activityFunValue"),
  homeExpenseMonthLek: document.querySelector("#homeExpenseMonthLek"),
  homeExpenseTodayLek: document.querySelector("#homeExpenseTodayLek"),
  homeExpenseLimitLek: document.querySelector("#homeExpenseLimitLek"),
  homeExpenseMonthEuro: document.querySelector("#homeExpenseMonthEuro"),
  homeExpenseTodayEuro: document.querySelector("#homeExpenseTodayEuro"),
  homeExpenseLimitEuro: document.querySelector("#homeExpenseLimitEuro"),
  homeExpenseLekProgress: document.querySelector("#homeExpenseLekProgress"),
  homeExpenseEuroProgress: document.querySelector("#homeExpenseEuroProgress"),
  homeIncomeMonthLek: document.querySelector("#homeIncomeMonthLek"),
  homeIncomeMonthEuro: document.querySelector("#homeIncomeMonthEuro"),
  homeIncomeYearLek: document.querySelector("#homeIncomeYearLek"),
  homeIncomeYearEuro: document.querySelector("#homeIncomeYearEuro"),
  homeSavingsMonthLek: document.querySelector("#homeSavingsMonthLek"),
  homeSavingsMonthEuro: document.querySelector("#homeSavingsMonthEuro"),
  homeSavingsYearLek: document.querySelector("#homeSavingsYearLek"),
  homeSavingsYearEuro: document.querySelector("#homeSavingsYearEuro"),
  incomeYearDots: document.querySelector("#incomeYearDots"),
  savingsYearDots: document.querySelector("#savingsYearDots"),
  homeExpenseOpen: document.querySelector("#homeExpenseOpen"),
  homeIncomeLimitOpen: document.querySelector("#homeIncomeLimitOpen"),
  homeSavingsLimitOpen: document.querySelector("#homeSavingsLimitOpen"),
  openLimitsBtn: document.querySelector("#openLimitsBtn"),
  limitsOverlay: document.querySelector("#limitsOverlay"),
  limitsForm: document.querySelector("#limitsForm"),
  cancelLimitsBtn: document.querySelector("#cancelLimitsBtn"),
  expenseLimitLekInput: document.querySelector("#expenseLimitLekInput"),
  expenseLimitEuroInput: document.querySelector("#expenseLimitEuroInput"),
  incomeLimitLekInput: document.querySelector("#incomeLimitLekInput"),
  incomeLimitEuroInput: document.querySelector("#incomeLimitEuroInput"),
  savingsLimitLekInput: document.querySelector("#savingsLimitLekInput"),
  savingsLimitEuroInput: document.querySelector("#savingsLimitEuroInput"),
  autoIncomeLimitNote: document.querySelector("#autoIncomeLimitNote"),
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
  incomeArchiveOverlay: document.querySelector("#incomeArchiveOverlay"),
  closeIncomeArchiveBtn: document.querySelector("#closeIncomeArchiveBtn"),
  incomeArchiveList: document.querySelector("#incomeArchiveList"),
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
  resetReceiptAiBtn: document.querySelector("#resetReceiptAiBtn"),
  receiptAiStatus: document.querySelector("#receiptAiStatus"),
  submitLabel: document.querySelector("#submitLabel"),
  deleteEntryBtn: document.querySelector("#deleteEntryBtn"),
  entryList: document.querySelector("#entryList"),
  categoryList: document.querySelector("#categoryList"),
  categoryChart: document.querySelector("#categoryChart"),
  monthFilter: document.querySelector("#monthFilter"),
  clearBtn: document.querySelector("#clearBtn"),
  backupPanel: document.querySelector("#backupPanel"),
  backupToggle: document.querySelector("#backupToggle"),
  backupActions: document.querySelector("#backupActions"),
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
els.resetReceiptAiBtn.addEventListener("click", resetReceiptAiConnection);

els.addEntryBtn.addEventListener("click", () => openEntryEditor("expense"));
els.homeExpenseOpen?.addEventListener("click", openExpenseArchive);
els.homeIncomeLimitOpen?.addEventListener("click", openIncomeArchive);
els.incomeYearDots?.addEventListener("click", openIncomeArchive);
els.homeSavingsLimitOpen?.addEventListener("click", () => openLimitsEditor("savings"));
els.openLimitsBtn.addEventListener("click", () => openLimitsEditor("expense"));
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
    savingsALL: Math.max(Number(els.savingsLimitLekInput.value) || 0, 0),
    savingsEUR: Math.max(Number(els.savingsLimitEuroInput.value) || 0, 0),
  };
  saveLimits();
  closeLimitsEditor();
  render();
});
els.toggleExpensesBtn.addEventListener("click", () => toggleList("expenses"));
els.toggleIncomeBtn.addEventListener("click", () => toggleList("income"));
els.toggleAccountsBtn.addEventListener("click", () => toggleList("accounts"));
els.cancelEntryBtn.addEventListener("click", closeEntryEditor);
els.deleteEntryBtn.addEventListener("click", () => deleteEntry(state.editingEntryId, { closeEditor: true }));
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
els.incomePreviewList.addEventListener("click", handleIncomePreviewClick);
els.expenseArchiveList.addEventListener("click", handleEntryListClick);
els.incomeArchiveList.addEventListener("click", handleEntryListClick);
els.closeExpenseArchiveBtn.addEventListener("click", closeExpenseArchive);
els.closeIncomeArchiveBtn.addEventListener("click", closeIncomeArchive);
els.expenseArchiveOverlay.addEventListener("click", (event) => {
  if (event.target === els.expenseArchiveOverlay) closeExpenseArchive();
});
els.incomeArchiveOverlay.addEventListener("click", (event) => {
  if (event.target === els.incomeArchiveOverlay) closeIncomeArchive();
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
els.backupToggle.addEventListener("click", () => {
  const isOpen = els.backupToggle.getAttribute("aria-expanded") === "true";
  els.backupToggle.setAttribute("aria-expanded", String(!isOpen));
  els.backupToggle.setAttribute("aria-label", isOpen ? "Shfaq backup" : "Fshih backup");
  els.backupPanel.classList.toggle("is-open", !isOpen);
  els.backupPanel.classList.toggle("is-collapsed", isOpen);
  els.backupActions.hidden = isOpen;
});
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
  const currentYear = String(now.getFullYear());
  const today = todayIso();
  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(currentMonth));
  const yearEntries = state.entries.filter((entry) => entry.date.startsWith(currentYear));
  const spentToday = state.entries.filter((entry) => entry.type === "expense" && entry.date === today).reduce(sumMoneyTotals, emptyMoneyTotals());
  const spentMonth = monthEntries.filter((entry) => entry.type === "expense").reduce(sumMoneyTotals, emptyMoneyTotals());
  const spentYear = yearEntries.filter((entry) => entry.type === "expense").reduce(sumMoneyTotals, emptyMoneyTotals());
  const incomeMonthlyTotals = monthlyTotalsByType(now.getFullYear(), "income");
  const incomeMonth = incomeMonthlyTotals[now.getMonth()];
  const incomeYear = addMoneyTotals(incomeMonthlyTotals);
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
  renderOverview(now, monthEntries, yearEntries, spentToday, spentMonth, spentYear, incomeMonth, incomeYear, incomeMonthlyTotals, accountTotals);
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

function renderOverview(now, monthEntries, yearEntries, spentToday, spentMonth, spentYear, incomeMonth, incomeYear, incomeMonthlyTotals, accountTotals) {
  if (els.todayLabel) els.todayLabel.textContent = longDateLabel(now);

  const savingsMonth = subtractMoneyTotals(incomeMonth, spentMonth);
  const savingsYear = subtractMoneyTotals(incomeYear, spentYear);
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const savingsMonthlyTotals = monthlySavingsTotals(currentYear);

  renderHomeExpenseCard(spentToday, spentMonth);
  renderHomeYearCard({
    type: "income",
    monthTotals: incomeMonth,
    averageTotals: monthlyAverageTotals(incomeMonthlyTotals, currentMonthIndex),
    monthlyTotals: incomeMonthlyTotals,
    limitALL: state.limits.incomeALL,
    limitEUR: state.limits.incomeEUR,
  });
  renderHomeYearCard({
    type: "savings",
    monthTotals: savingsMonth,
    averageTotals: monthlyAverageTotals(savingsMonthlyTotals, currentMonthIndex),
    monthlyTotals: savingsMonthlyTotals,
    limitALL: state.limits.savingsALL,
    limitEUR: state.limits.savingsEUR,
  });
  renderActivityRing(monthEntries);
}

function renderHomeExpenseCard(spentToday, spentMonth) {
  if (els.homeExpenseMonthLek) els.homeExpenseMonthLek.textContent = moneyLekShort(spentMonth.ALL);
  if (els.homeExpenseTodayLek) els.homeExpenseTodayLek.textContent = moneyLekShort(spentToday.ALL);
  if (els.homeExpenseLimitLek) els.homeExpenseLimitLek.textContent = moneyLekShort(state.limits.expenseALL);
  if (els.homeExpenseMonthEuro) els.homeExpenseMonthEuro.textContent = moneyEuroCompact(spentMonth.EUR);
  if (els.homeExpenseTodayEuro) els.homeExpenseTodayEuro.textContent = moneyEuroCompact(spentToday.EUR);
  if (els.homeExpenseLimitEuro) els.homeExpenseLimitEuro.textContent = moneyEuroCompact(state.limits.expenseEUR);
  setHomeProgress(els.homeExpenseLekProgress, spentMonth.ALL, spentToday.ALL, state.limits.expenseALL);
  setHomeProgress(els.homeExpenseEuroProgress, spentMonth.EUR, spentToday.EUR, state.limits.expenseEUR);
}

function setHomeProgress(track, monthValue, todayValue, limit) {
  if (!track) return;

  const monthWidth = limitPercent(Math.max(monthValue, 0), limit);
  const todayWidth = limitPercent(Math.max(todayValue, 0), limit);
  const todayLeft = Math.max(monthWidth - todayWidth, 0);
  track.style.setProperty("--month-width", `${monthWidth}%`);
  track.style.setProperty("--today-width", `${todayWidth}%`);
  track.style.setProperty("--today-left", `${todayLeft}%`);
}

function renderHomeYearCard({ type, monthTotals, averageTotals, monthlyTotals, limitALL, limitEUR }) {
  const prefix = type === "income" ? "Income" : "Savings";
  const accent = type === "income" ? "green" : "purple";

  setText(els[`home${prefix}MonthLek`], moneyLekShort(monthTotals.ALL));
  setText(els[`home${prefix}MonthEuro`], moneyEuroCompact(monthTotals.EUR));
  setText(els[`home${prefix}YearLek`], moneyLekShort(averageTotals.ALL));
  setText(els[`home${prefix}YearEuro`], moneyEuroCompact(averageTotals.EUR));
  renderMonthlyDotChart(els[type === "income" ? "incomeYearDots" : "savingsYearDots"], monthlyTotals, limitALL, limitEUR, accent);
}

function renderMonthlyDotChart(container, monthlyTotals, limitALL, limitEUR, accent) {
  if (!container) return;

  const limitTotalLek = Math.max((Number(limitALL) || 0) + (Number(limitEUR) || 0) * state.exchangeRate, 1);
  const currentMonthIndex = new Date().getMonth();
  container.innerHTML = "";

  monthlyTotals.forEach((totals, index) => {
    const rawValueLek = totalsToLek(totals);
    const hasValue = Boolean(Number(totals.ALL) || Number(totals.EUR));
    const isCurrentMonth = index === currentMonthIndex;
    if (!hasValue && !isCurrentMonth) return;

    const ratio = clamp01(Math.max(rawValueLek, 0) / limitTotalLek);
    const dot = document.createElement("span");
    dot.className = `month-dot ${accent}-dot ${monthlyDotTone(ratio)}`;
    dot.classList.toggle("is-current", isCurrentMonth);
    dot.classList.toggle("is-negative", rawValueLek < 0);
    dot.style.left = `${((index + 0.5) / 12) * 100}%`;
    dot.style.top = `${rawValueLek < 0 ? 88 : 88 - ratio * 76}%`;
    dot.title = `${capitalizeFirst(monthNames[index])}: ${moneyPairCompact(totals)}`;
    container.append(dot);
  });
}

function monthlyDotTone(ratio) {
  if (ratio >= 0.625) return "high";
  if (ratio >= 0.33) return "mid";
  return "low";
}

function monthlyTotalsByType(year, type) {
  const months = Array.from({ length: 12 }, () => emptyMoneyTotals());
  state.entries.forEach((entry) => {
    if (entry.type !== type) return;
    const date = parseLocalDate(entry.date);
    if (date.getFullYear() !== year) return;
    addEntryAmount(months[date.getMonth()], entry);
  });
  return months;
}

function monthlySavingsTotals(year) {
  const income = monthlyTotalsByType(year, "income");
  const expenses = monthlyTotalsByType(year, "expense");
  return income.map((totals, index) => subtractMoneyTotals(totals, expenses[index]));
}

function monthlyAverageTotals(monthlyTotals, currentMonthIndex) {
  const months = monthlyTotals.slice(0, currentMonthIndex + 1);
  return divideMoneyTotals(addMoneyTotals(months), Math.max(months.length, 1));
}

function addMoneyTotals(items) {
  return items.reduce(
    (total, item) => ({
      ALL: total.ALL + (Number(item?.ALL) || 0),
      EUR: total.EUR + (Number(item?.EUR) || 0),
    }),
    emptyMoneyTotals()
  );
}

function subtractMoneyTotals(left, right) {
  return {
    ALL: (Number(left?.ALL) || 0) - (Number(right?.ALL) || 0),
    EUR: (Number(left?.EUR) || 0) - (Number(right?.EUR) || 0),
  };
}

function setText(element, text) {
  if (element) element.textContent = text;
}

function clamp01(value) {
  return Math.max(0, Math.min(Number(value) || 0, 1));
}

function renderDailyExpenseOverview(spentToday) {
  const today = new Date();
  const dailyLekLimit = state.limits.expenseALL / daysInMonth(today);
  const dailyEuroLimit = state.limits.expenseEUR / daysInMonth(today);
  if (els.dailyLekBar) els.dailyLekBar.style.width = `${limitPercent(spentToday.ALL, dailyLekLimit)}%`;
  if (els.dailyEuroBar) els.dailyEuroBar.style.width = `${limitPercent(spentToday.EUR, dailyEuroLimit)}%`;
}

function renderWeekdayExpenseChart(monthEntries) {
  if (!els.weekdayExpenseChart) return;

  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
  const weekdayLabels = ["H", "M", "M", "E", "P", "S", "D"];
  const totals = weekdayOrder.map((day) => ({ day, ALL: 0, EUR: 0 }));

  monthEntries.forEach((entry) => {
    if (entry.type !== "expense") return;
    const day = parseLocalDate(entry.date).getDay();
    const row = totals.find((item) => item.day === day);
    if (!row) return;
    row[normalizeCurrency(entry.currency)] += Number(entry.amount) || 0;
  });

  const maxLek = Math.max(...totals.map((item) => item.ALL), 1);
  const maxEuro = Math.max(...totals.map((item) => item.EUR), 1);
  els.weekdayExpenseChart.innerHTML = "";

  totals.forEach((item, index) => {
    const lekHeight = item.ALL > 0 ? Math.max(20, Math.round((item.ALL / maxLek) * 62)) : 0;
    const euroHeight = item.EUR > 0 ? Math.max(20, Math.round((item.EUR / maxEuro) * 62)) : 0;
    const group = document.createElement("div");
    group.className = "weekday-group";
    group.innerHTML = `
      <div class="weekday-bars">
        <span class="weekday-bar lek" style="height:${lekHeight}px"></span>
        <span class="weekday-bar euro" style="height:${euroHeight}px"></span>
      </div>
      <strong>${weekdayLabels[index]}</strong>
    `;
    els.weekdayExpenseChart.append(group);
  });
}

function renderSavingsGoalOverview(now, monthEntries) {
  if (!els.overviewSavingsGoalValue && !els.savingsTrendChart) return;

  const targetAll = DEFAULT_SAVINGS_GOAL_ALL;
  const dailyTarget = Math.max(targetAll / (DEFAULT_SAVINGS_GOAL_MONTHS * 30), 1);
  if (els.overviewSavingsGoalValue) els.overviewSavingsGoalValue.textContent = `${moneyLekShort(dailyTarget)}/ditë`;
  if (els.overviewSavingsGoalMeta) {
    els.overviewSavingsGoalMeta.textContent = `Objektiv ${moneyLekShort(targetAll)} për ${DEFAULT_SAVINGS_GOAL_MONTHS} muaj`;
  }

  renderSavingsTrendChart(now, monthEntries, dailyTarget);
}

function renderSavingsTrendChart(now, monthEntries, dailyTarget) {
  if (!els.savingsTrendChart) return;

  const currentMonth = monthKey(now);
  const totalDays = daysInMonth(now);
  const days = Array.from({ length: totalDays }, (_, index) => `${currentMonth}-${String(index + 1).padStart(2, "0")}`);
  const totalsByDay = new Map(days.map((day) => [day, 0]));

  monthEntries.forEach((entry) => {
    const signedAmount = entry.type === "income" ? dailyChartAmount(entry, "TOTAL") : -dailyChartAmount(entry, "TOTAL");
    totalsByDay.set(entry.date, (totalsByDay.get(entry.date) || 0) + signedAmount);
  });

  const values = days.map((date) => totalsByDay.get(date) || 0);
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), dailyTarget, 1);
  els.savingsTrendChart.innerHTML = "";

  values.forEach((value, index) => {
    const height = Math.max(7, Math.round((Math.abs(value) / maxAbs) * 48));
    const bar = document.createElement("span");
    bar.className = value >= dailyTarget ? "saving-bar positive" : value < 0 ? "saving-bar negative" : "saving-bar neutral";
    bar.style.height = `${height}px`;
    bar.style.transform = value < 0 ? "translateY(50%)" : "translateY(-50%)";
    bar.title = `${formatSlashDate(days[index])}: ${moneyLekShort(value)}`;
    els.savingsTrendChart.append(bar);
  });
}

function renderActivityRing(monthEntries) {
  if (!els.activityRing) return;

  const trackedCategories = ["Ushqim", "Fatura", "Argëtim"];
  const trackedTotals = trackedCategories.map((category) =>
    monthEntries
      .filter((entry) => entry.type === "expense" && entry.category === category)
      .reduce(sumMoneyTotals, emptyMoneyTotals())
  );
  const tracked = trackedTotals.map(totalsToLek);
  const max = Math.max(...tracked, 1);
  const fallbackArcs = [318, 250, 215];
  const arcs = tracked.map((value, index) => (value > 0 ? Math.max(78, Math.round((value / max) * 318)) : fallbackArcs[index]));

  els.activityRing.style.setProperty("--food-arc", `${arcs[0]}deg`);
  els.activityRing.style.setProperty("--bills-arc", `${arcs[1]}deg`);
  els.activityRing.style.setProperty("--fun-arc", `${arcs[2]}deg`);
  if (els.activityFoodValue) els.activityFoodValue.textContent = moneyPairCompact(trackedTotals[0]);
  if (els.activityBillsValue) els.activityBillsValue.textContent = moneyPairCompact(trackedTotals[1]);
  if (els.activityFunValue) els.activityFunValue.textContent = moneyPairCompact(trackedTotals[2]);
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

function openLimitsEditor(mode = "all") {
  limitsEditorMode = mode;
  els.expenseLimitLekInput.value = state.limits.expenseALL;
  els.expenseLimitEuroInput.value = state.limits.expenseEUR;
  els.incomeLimitLekInput.value = state.limits.incomeALL;
  els.incomeLimitEuroInput.value = state.limits.incomeEUR;
  els.savingsLimitLekInput.value = state.limits.savingsALL;
  els.savingsLimitEuroInput.value = state.limits.savingsEUR;
  syncIncomeLimitFields();
  els.limitsOverlay.hidden = false;
  const focusTarget =
    mode === "savings" ? els.savingsLimitLekInput : mode === "income" ? els.incomeLimitLekInput : els.expenseLimitLekInput;
  focusTarget.focus();
}

function closeLimitsEditor() {
  els.limitsOverlay.hidden = true;
  els.limitsForm.reset();
  syncIncomeLimitFields();
  limitsEditorMode = "all";
}

function syncIncomeLimitFields() {
  els.incomeLimitLekInput.readOnly = false;
  els.incomeLimitEuroInput.readOnly = false;
  els.incomeLimitLekInput.classList.remove("is-readonly");
  els.incomeLimitEuroInput.classList.remove("is-readonly");
  if (els.autoIncomeLimitNote) els.autoIncomeLimitNote.hidden = true;
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

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  els.deleteEntryBtn.hidden = !entry;
  els.entryOverlay.hidden = false;
  els.amountInput.focus();
}

function closeEntryEditor() {
  state.editingEntryId = "";
  els.entryOverlay.hidden = true;
  els.entryForm.reset();
  els.deleteEntryBtn.hidden = true;
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
  deleteEntry(deleteButton.dataset.delete);
}

function deleteEntry(entryId, options = {}) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (!entry) return;
  if (!confirm("A dëshiron ta fshish këtë zë?")) return;

  createAutoBackup();
  if (entry.bankId) applyBankDelta(entry.bankId, entry.type === "income" ? -entry.amount : entry.amount);
  state.entries = state.entries.filter((item) => item.id !== entry.id);
  saveBanks();
  saveEntries();
  if (options.closeEditor) closeEntryEditor();
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
  const incomeEntries = state.entries.filter((entry) => entry.type === "income" && entry.date.startsWith(currentMonth));
  renderEntryPreviewList("expense", els.expensePreviewList, expenseEntries, currentMonth);
  renderEntryPreviewList("income", els.incomePreviewList, incomeEntries, currentMonth);
  if (!els.expenseArchiveOverlay.hidden) renderExpenseArchive();
  if (!els.incomeArchiveOverlay.hidden) renderIncomeArchive();
}

function renderEntryPreviewList(type, container, entries, currentMonth) {
  const hasArchive = entries.length > EXPENSE_PREVIEW_LIMIT || hasOtherEntryMonths(type, currentMonth);
  const emptyText = type === "income" ? "Nuk ka të ardhura këtë muaj." : "Nuk ka shpenzime këtë muaj.";
  container.innerHTML = "";

  if (!entries.length) {
    container.innerHTML = `<div class="empty-line">${emptyText}</div>`;
  } else {
    entries.slice(0, EXPENSE_PREVIEW_LIMIT).forEach((entry) => container.append(createEntryRow(entry, "preview")));
  }

  if (hasArchive) container.append(createMoreRow(type));
}

function createMoreRow(type) {
  const button = document.createElement("button");
  button.className = "more-row";
  button.type = "button";
  button.dataset.openArchive = type;
  button.textContent = "More";
  return button;
}

function hasOtherEntryMonths(type, currentMonth) {
  return state.entries.some((entry) => entry.type === type && !entry.date.startsWith(currentMonth));
}

function handleExpensePreviewClick(event) {
  const moreButton = event.target.closest("[data-open-archive='expense']");
  if (moreButton) {
    openExpenseArchive();
    return;
  }

  handleEntryListClick(event);
}

function handleIncomePreviewClick(event) {
  const moreButton = event.target.closest("[data-open-archive='income']");
  if (moreButton) {
    openIncomeArchive();
    return;
  }

  handleEntryListClick(event);
}

function openExpenseArchive() {
  renderEntryArchive("expense");
  els.expenseArchiveOverlay.hidden = false;
}

function closeExpenseArchive() {
  els.expenseArchiveOverlay.hidden = true;
}

function renderExpenseArchive() {
  renderEntryArchive("expense");
}

function openIncomeArchive() {
  renderEntryArchive("income");
  els.incomeArchiveOverlay.hidden = false;
}

function closeIncomeArchive() {
  els.incomeArchiveOverlay.hidden = true;
}

function renderIncomeArchive() {
  renderEntryArchive("income");
}

function renderEntryArchive(type) {
  const months = entryMonths(type);
  const currentMonth = monthKey(new Date());
  const hasCurrentMonth = months.some((month) => month.key === currentMonth);
  const list = type === "income" ? els.incomeArchiveList : els.expenseArchiveList;
  const emptyText = type === "income" ? "Nuk ka të ardhura për t'u shfaqur." : "Nuk ka shpenzime për t'u shfaqur.";

  list.innerHTML = "";
  if (!months.length) {
    list.innerHTML = `<div class="empty-line">${emptyText}</div>`;
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
    (type === "income" ? els.incomeArchiveList : els.expenseArchiveList).append(details);
  });
}

function entryMonths(type) {
  const groups = new Map();
  const sortedEntries = state.entries
    .filter((entry) => entry.type === type)
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
  if (els.entryOverlay) els.entryOverlay.dataset.entryType = state.type;
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
    let response = await sendReceiptRequest(endpoint, token, image);
    let result = await response.json().catch(() => ({}));
    if (response.status === 401) {
      localStorage.removeItem(RECEIPT_AI_TOKEN_KEY);
      const retryToken = prompt("Kodi sekret nuk është i saktë. Vendose përsëri.");
      if (!retryToken) throw new Error("Kodi sekret nuk është i saktë.");
      localStorage.setItem(RECEIPT_AI_TOKEN_KEY, retryToken.trim());
      setReceiptAiStatus("Po provohet me kodin e ri...");
      response = await sendReceiptRequest(endpoint, retryToken.trim(), image);
      result = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      throw new Error(result.error || "Fatura nuk u lexua.");
    }

    applyReceiptResult(result);
    setReceiptAiStatus("U mbush nga fatura. Kontrolloje para se ta ruash.");
  } catch (error) {
    setReceiptAiStatus(error.message || "Fatura nuk u lexua.");
  } finally {
    event.target.value = "";
  }
}

function sendReceiptRequest(endpoint, token, image) {
  const formData = new FormData();
  formData.append("receipt", image, image.name || "receipt.jpg");
  const headers = token ? { "X-Receipt-Token": token } : {};
  return fetch(endpoint, { method: "POST", headers, body: formData });
}

function resetReceiptAiConnection() {
  localStorage.removeItem(RECEIPT_AI_ENDPOINT_KEY);
  localStorage.removeItem(RECEIPT_AI_TOKEN_KEY);
  setReceiptAiStatus("AI u rivendos. Kliko Foto fature dhe vendose përsëri.");
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
  const backup = {
    app: "financat-e-mia",
    version: 3,
    exportedAt: new Date().toISOString(),
    entries: state.entries,
    banks: state.banks,
    limits: state.limits,
    exchangeRate: state.exchangeRate,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
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
      const parsedEntries = Array.isArray(parsed) ? parsed : Array.isArray(parsed.entries) ? parsed.entries : [];

      const importedEntries = parsedEntries.filter(isValidEntry).map(normalizeEntryForImport);
      const importedBanks = Array.isArray(parsed.banks)
        ? parsed.banks.filter(isValidBank)
        : legacySavingsToBanks(normalizeMoneyTotals(parsed.savings));
      const importedLimits = parsed.limits ? normalizeLimits(parsed.limits) : null;
      const importedExchangeRate = Number(parsed.exchangeRate);
      const hasExchangeRate = importedExchangeRate > 0;

      if (!importedEntries.length && !importedBanks?.length && !importedLimits && !hasExchangeRate) {
        alert("Ky backup nuk ka të dhëna për t'u importuar.");
        return;
      }

      createAutoBackup();
      const beforeCount = state.entries.length;
      state.entries = mergeEntries(state.entries, importedEntries);
      if (importedBanks?.length) state.banks = mergeBanks(state.banks, importedBanks);
      if (importedLimits) state.limits = importedLimits;
      if (hasExchangeRate) state.exchangeRate = importedExchangeRate;
      ensureDefaultBanks();
      saveBanks();
      saveEntries();
      saveLimits();
      saveExchangeRate(state.exchangeRate);
      els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
      render();

      const addedCount = state.entries.length - beforeCount;
      alert(`Importi u krye. U lexuan ${importedEntries.length} zëra (${addedCount} të rinj), ${importedBanks?.length || 0} llogari bankare dhe konfigurimet e backup-it.`);
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
    if (Array.isArray(saved)) return saved.filter(isValidEntry).map(normalizeEntryForImport);

    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(legacy)) {
        const entries = legacy.filter(isValidEntry).map(normalizeEntryForImport);
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
    return normalizeLimits(JSON.parse(localStorage.getItem(LIMITS_KEY)));
  } catch {
    return { ...DEFAULT_LIMITS };
  }
}

function normalizeLimits(limits) {
  return {
    expenseALL: positiveNumber(limits?.expenseALL, DEFAULT_LIMITS.expenseALL),
    expenseEUR: positiveNumber(limits?.expenseEUR, DEFAULT_LIMITS.expenseEUR),
    incomeALL: positiveNumber(limits?.incomeALL, DEFAULT_LIMITS.incomeALL),
    incomeEUR: positiveNumber(limits?.incomeEUR, DEFAULT_LIMITS.incomeEUR),
    savingsALL: positiveNumber(limits?.savingsALL, DEFAULT_LIMITS.savingsALL),
    savingsEUR: positiveNumber(limits?.savingsEUR, DEFAULT_LIMITS.savingsEUR),
  };
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
      limits: state.limits,
      exchangeRate: state.exchangeRate,
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
    state.entries = backup.entries.filter(isValidEntry).map(normalizeEntryForImport);
    state.banks = normalizeBanks(Array.isArray(backup.banks) ? backup.banks.filter(isValidBank) : loadBanks());
    state.limits = backup.limits ? normalizeLimits(backup.limits) : state.limits;
    state.exchangeRate = Number(backup.exchangeRate) > 0 ? Number(backup.exchangeRate) : state.exchangeRate;
    saveEntries();
    saveBanks();
    saveLimits();
    saveExchangeRate(state.exchangeRate);
    els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
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
  const normalized = banks.map(normalizeBankRecord);

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
  const merged = [];
  const byId = new Map();
  const byIdentity = new Map();

  [...currentBanks, ...importedBanks].forEach((bank) => {
    const normalized = normalizeBankRecord(bank);
    const existing = byId.get(normalized.id) || byIdentity.get(bankIdentity(normalized));
    if (existing) {
      Object.assign(existing, normalized, {
        id: existing.id || normalized.id,
        createdAt: existing.createdAt || normalized.createdAt,
      });
      return;
    }
    merged.push(normalized);
    byId.set(normalized.id, normalized);
    byIdentity.set(bankIdentity(normalized), normalized);
  });

  return normalizeBanks(merged);
}

function normalizeBankRecord(bank) {
  return {
    id: bank.id || crypto.randomUUID(),
    name: String(bank.name || "Llogari").trim(),
    currency: normalizeCurrency(bank.currency),
    balance: Number(bank.balance) || 0,
    isDefault: Boolean(bank.isDefault),
    createdAt: bank.createdAt || new Date().toISOString(),
  };
}

function bankIdentity(bank) {
  return `${normalizeCurrency(bank.currency)}|${String(bank.name || "").trim().toLowerCase()}`;
}

function isValidEntry(entry) {
  return entry && ["income", "expense"].includes(normalizeEntryType(entry.type)) && Number(entry.amount) > 0 && entry.date;
}

function isValidBank(bank) {
  return bank && bank.name && ["ALL", "EUR"].includes(normalizeCurrency(bank.currency));
}

function normalizeEntryForImport(entry) {
  const type = normalizeEntryType(entry.type);
  return {
    ...entry,
    id: entry.id || crypto.randomUUID(),
    type,
    amount: Number(entry.amount) || 0,
    currency: normalizeCurrency(entry.currency),
    category: entry.category || "Tjetër",
    note: String(entry.note || entry.description || entry.category || (type === "income" ? "Të ardhura" : "Shpenzim")).trim(),
    date: entry.date,
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function normalizeEntryType(type) {
  const value = String(type || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["income", "incomes", "te ardhura", "e ardhur", "ardhura", "hyrje"].includes(value)) return "income";
  if (["expense", "expenses", "shpenzim", "shpenzime", "dalje"].includes(value)) return "expense";
  return "";
}

function mergeEntries(currentEntries, importedEntries) {
  const merged = currentEntries.map(normalizeEntryForImport);
  const byId = new Map(merged.filter((entry) => entry.id).map((entry) => [entry.id, entry]));
  const seen = new Set(merged.map(entryKey));

  importedEntries.forEach((entry) => {
    if (entry.id && byId.has(entry.id)) {
      Object.assign(byId.get(entry.id), entry);
      return;
    }
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

function totalsToLek(totals) {
  return (Number(totals.ALL) || 0) + (Number(totals.EUR) || 0) * state.exchangeRate;
}

function moneyPairCompact(totals) {
  return `${moneyLekShort(totals.ALL)} / ${moneyEuroCompact(totals.EUR)}`;
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

function moneyEuroCompact(value) {
  return new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(value || 0) + "€";
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

function latestEntry(type, month = "") {
  return state.entries
    .filter((entry) => entry.type === type && (!month || entry.date.startsWith(month)))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
}

function formatDate(value) {
  const date = parseLocalDate(value);
  return `${String(date.getDate()).padStart(2, "0")} ${monthNames[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

function formatSlashDate(value) {
  const date = parseLocalDate(value);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function longDateLabel(date) {
  const dayName = dayNames[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  return `${dayName}, ${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${monthNames[Number(month) - 1]} ${year}`;
}

function capitalizeFirst(value) {
  return `${String(value).charAt(0).toUpperCase()}${String(value).slice(1)}`;
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

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
