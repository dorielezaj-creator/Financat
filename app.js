const STORAGE_KEY = "financat-e-mia:v2";
const BANKS_KEY = "financat-e-mia:banks:v1";
const LEGACY_SAVINGS_KEY = "financat-e-mia:savings";
const BACKUP_KEY = "financat-e-mia:auto-backup";
const EXCHANGE_RATE_KEY = "financat-e-mia:eur-all-rate:v1";
const LIMITS_KEY = "financat-e-mia:monthly-limits:v1";
const SAVINGS_GOAL_KEY = "financat-e-mia:savings-goal:v1";
const GOALS_KEY = "financat-e-mia:goals:v1";
const CATEGORIES_KEY = "financat-e-mia:categories:v1";
const RECURRING_KEY = "financat-e-mia:recurring:v1";
const THEME_KEY = "financat-e-mia:theme:v2";
const RECEIPT_AI_ENDPOINT_KEY = "financat-e-mia:receipt-ai-endpoint:v1";
const RECEIPT_AI_TOKEN_KEY = "financat-e-mia:receipt-ai-token:v1";
const RECEIPT_AI_TIMEOUT_MS = 45000;
const VOICE_MAX_RECORDING_MS = 30_000;
let quickAddRecorder = null;
let quickAddVoiceStream = null;
let quickAddVoiceChunks = [];
let quickAddVoiceTimer = null;
const RECEIPT_AI_MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const NET_WORTH_HISTORY_KEY = "financat-e-mia:net-worth-history:v1";
const SETUP_KEY = "financat-e-mia:setup-complete:v1";
const HOME_ORDER_KEY = "financat-e-mia:home-order:v1";
const LEGACY_STORAGE_KEYS = ["financat-e-mia:v1"];
const BACKUP_SCHEMA_VERSION = 12;
const DEFAULT_LIMITS = {
  expenseALL: 150000,
  expenseEUR: 1000,
  incomeALL: 150000,
  incomeEUR: 1000,
  savingsALL: 100000,
  savingsEUR: 1000,
};
const DEFAULT_EUR_TO_ALL_RATE = 93.36;
const DEFAULT_SAVINGS_GOAL = {
  amount: 12000,
  currency: "EUR",
  months: 12,
};
const DEFAULT_CATEGORIES = {
  expense: ["Ushqim", "Transport", "Shtëpi", "Fatura", "Argëtim", "Shëndet", "Biznes", "Abonime", "Tjetër"],
  income: ["Rrogë", "Punë ekstra", "Biznes", "Dhuratë", "Tjetër"],
};
const BANK_OF_ALBANIA_RATE_URL = "https://www.bankofalbania.org/Markets/Official_exchange_rate/";
const EXPENSE_PREVIEW_LIMIT = 10;
const DEFAULT_SAVINGS_GOAL_ALL = 10000;
const DEFAULT_SAVINGS_GOAL_MONTHS = 12;
const DEFAULT_HOME_ORDER = ["safe-spend", "goals", "plan", "month", "balances", "forecast", "year-charts"];
const PRIMARY_ZONE_ORDER = ["transactions", "accounts", "insights"];
let limitsEditorMode = "all";
let homeReorderSession = {
  timer: 0,
  inputType: "",
  pointerId: null,
  touchId: null,
  block: null,
  placeholder: null,
  startX: 0,
  startY: 0,
  grabOffsetY: 0,
  dragHeight: 0,
  originalStyle: null,
  active: false,
  moved: false,
  suppressClickUntil: 0,
};
let pageSwipeSession = {
  touchId: null,
  overlay: null,
  startX: 0,
  startY: 0,
  deltaX: 0,
  horizontal: false,
  cancelled: false,
  transitioning: false,
  timer: 0,
};

const colors = ["#ef6f5a", "#6f62db", "#63d681", "#111111", "#b5b5bb", "#dedee3", "#8f8f98"];
const monthNames = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
const dayNames = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];

const state = {
  type: "expense",
  editingEntryId: "",
  editingRecurringId: "",
  editingGoalId: "",
  categoryManagerType: "expense",
  visibleLists: {
    expenses: true,
    income: true,
    accounts: true,
  },
  dailyCurrency: "TOTAL",
  selectedDailyDate: "",
  incomeDetailRange: "month",
  savingsDetailRange: "month",
  homePlanTab: "savings",
  archiveSearch: {
    expense: "",
    income: "",
  },
  activeZone: "home",
  transactionSearch: "",
  transactionFilter: "all",
  transactionMonthFilter: "all",
  transactionCategoryFilter: "all",
  transactionBankFilter: "all",
  transactionCurrencyFilter: "all",
  homeOrder: loadHomeOrder(),
  pendingImport: null,
  netWorthHistory: loadNetWorthHistory(),
  undo: {
    timer: 0,
    action: null,
  },
  theme: loadTheme(),
  setupComplete: loadSetupComplete(),
  exchangeRate: loadExchangeRate(),
  limits: loadLimits(),
  savingsGoal: loadSavingsGoal(),
  goals: loadGoals(),
  categories: loadCategories(),
  entries: loadEntries(),
  banks: loadBanks(),
  recurringExpenses: loadRecurringExpenses(),
};

const els = {
  overviewHome: document.querySelector("#overviewHome"),
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
  openAccountsEuroBtn: document.querySelector("#openAccountsEuroBtn"),
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
  recurringOverlay: document.querySelector("#recurringOverlay"),
  closeRecurringBtn: document.querySelector("#closeRecurringBtn"),
  newRecurringBtn: document.querySelector("#newRecurringBtn"),
  recurringList: document.querySelector("#recurringList"),
  recurringRealLek: document.querySelector("#recurringRealLek"),
  recurringRealEuro: document.querySelector("#recurringRealEuro"),
  recurringObligationsLek: document.querySelector("#recurringObligationsLek"),
  recurringObligationsEuro: document.querySelector("#recurringObligationsEuro"),
  recurringAvailableLek: document.querySelector("#recurringAvailableLek"),
  recurringAvailableEuro: document.querySelector("#recurringAvailableEuro"),
  recurringEditorOverlay: document.querySelector("#recurringEditorOverlay"),
  recurringForm: document.querySelector("#recurringForm"),
  recurringEditorTitle: document.querySelector("#recurringEditorTitle"),
  recurringIdInput: document.querySelector("#recurringIdInput"),
  recurringNameInput: document.querySelector("#recurringNameInput"),
  recurringAmountInput: document.querySelector("#recurringAmountInput"),
  recurringCurrencyInput: document.querySelector("#recurringCurrencyInput"),
  recurringCategoryInput: document.querySelector("#recurringCategoryInput"),
  recurringDayInput: document.querySelector("#recurringDayInput"),
  recurringActiveInput: document.querySelector("#recurringActiveInput"),
  cancelRecurringEditorBtn: document.querySelector("#cancelRecurringEditorBtn"),
  deleteRecurringBtn: document.querySelector("#deleteRecurringBtn"),
  saveRecurringBtn: document.querySelector("#saveRecurringBtn"),
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
  safeSpendOpen: document.querySelector("#safeSpendOpen"),
  safeSpendInfo: document.querySelector("#safeSpendInfo"),
  safeSpendLek: document.querySelector("#safeSpendLek"),
  safeSpendEuro: document.querySelector("#safeSpendEuro"),
  safeSpendRemaining: document.querySelector("#safeSpendRemaining"),
  safeSpendDays: document.querySelector("#safeSpendDays"),
  safeSpendProgress: document.querySelector("#safeSpendProgress"),
  safeSpendProgressText: document.querySelector("#safeSpendProgressText"),
  safeSpendForecast: document.querySelector("#safeSpendForecast"),
  quickAccountsOpen: document.querySelector("#quickAccountsOpen"),
  quickAccountsInfo: document.querySelector("#quickAccountsInfo"),
  quickAccountLek: document.querySelector("#quickAccountLek"),
  quickAccountEuro: document.querySelector("#quickAccountEuro"),
  quickExpenseOpen: document.querySelector("#quickExpenseOpen"),
  quickExpenseInfo: document.querySelector("#quickExpenseInfo"),
  quickAverageOpen: document.querySelector("#quickAverageOpen"),
  quickAverageInfo: document.querySelector("#quickAverageInfo"),
  quickSavingsOpen: document.querySelector("#quickSavingsOpen"),
  quickSavingsInfo: document.querySelector("#quickSavingsInfo"),
  quickExpenseDays: document.querySelector("#quickExpenseDays"),
  quickExpenseLek: document.querySelector("#quickExpenseLek"),
  quickExpenseEuro: document.querySelector("#quickExpenseEuro"),
  quickAverageNote: document.querySelector("#quickAverageNote"),
  quickAverageLek: document.querySelector("#quickAverageLek"),
  quickAverageEuro: document.querySelector("#quickAverageEuro"),
  quickSavingsLek: document.querySelector("#quickSavingsLek"),
  quickSavingsEuro: document.querySelector("#quickSavingsEuro"),
  monthSpendableLek: document.querySelector("#monthSpendableLek"),
  monthSpendableEuro: document.querySelector("#monthSpendableEuro"),
  monthIncomeSummaryLek: document.querySelector("#monthIncomeSummaryLek"),
  monthIncomeSummaryEuro: document.querySelector("#monthIncomeSummaryEuro"),
  monthSummaryProgress: document.querySelector("#monthSummaryProgress"),
  monthSummaryStatus: document.querySelector("#monthSummaryStatus"),
  balanceCompareLek: document.querySelector("#balanceCompareLek"),
  balanceCompareEuro: document.querySelector("#balanceCompareEuro"),
  savingsDirectionBar: document.querySelector("#savingsDirectionBar"),
  forecastProgress: document.querySelector("#forecastProgress"),
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
  expenseArchiveSearch: document.querySelector("#expenseArchiveSearch"),
  expenseArchiveSearchClear: document.querySelector("#expenseArchiveSearchClear"),
  expenseArchiveList: document.querySelector("#expenseArchiveList"),
  incomeArchiveOverlay: document.querySelector("#incomeArchiveOverlay"),
  closeIncomeArchiveBtn: document.querySelector("#closeIncomeArchiveBtn"),
  incomeArchiveSearch: document.querySelector("#incomeArchiveSearch"),
  incomeArchiveSearchClear: document.querySelector("#incomeArchiveSearchClear"),
  incomeArchiveList: document.querySelector("#incomeArchiveList"),
  incomeDetailOverlay: document.querySelector("#incomeDetailOverlay"),
  closeIncomeDetailBtn: document.querySelector("#closeIncomeDetailBtn"),
  incomeDetailPeriodLabel: document.querySelector("#incomeDetailPeriodLabel"),
  incomeDetailTotalLek: document.querySelector("#incomeDetailTotalLek"),
  incomeDetailTotalEuro: document.querySelector("#incomeDetailTotalEuro"),
  incomeDetailChart: document.querySelector("#incomeDetailChart"),
  incomeDetailAxis: document.querySelector("#incomeDetailAxis"),
  incomeDetailNote: document.querySelector("#incomeDetailNote"),
  savingsDetailOverlay: document.querySelector("#savingsDetailOverlay"),
  closeSavingsDetailBtn: document.querySelector("#closeSavingsDetailBtn"),
  savingsDetailPeriodLabel: document.querySelector("#savingsDetailPeriodLabel"),
  savingsDetailTotalLek: document.querySelector("#savingsDetailTotalLek"),
  savingsDetailTotalEuro: document.querySelector("#savingsDetailTotalEuro"),
  savingsDetailChart: document.querySelector("#savingsDetailChart"),
  savingsDetailAxis: document.querySelector("#savingsDetailAxis"),
  savingsDetailNote: document.querySelector("#savingsDetailNote"),
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
  profileMenuOverlay: document.querySelector("#profileMenuOverlay"),
  profilePersonalBtn: document.querySelector("#profilePersonalBtn"),
  profileSavingsBtn: document.querySelector("#profileSavingsBtn"),
  profileCategoriesBtn: document.querySelector("#profileCategoriesBtn"),
  profileExpensesBtn: document.querySelector("#profileExpensesBtn"),
  profileRecurringBtn: document.querySelector("#profileRecurringBtn"),
  profileIncomeBtn: document.querySelector("#profileIncomeBtn"),
  profileThemeBtn: document.querySelector("#profileThemeBtn"),
  profileThemeState: document.querySelector("#profileThemeState"),
  profileSetupBtn: document.querySelector("#profileSetupBtn"),
  goalsOverlay: document.querySelector("#goalsOverlay"),
  homeGoalsGrid: document.querySelector("#homeGoalsGrid"),
  savingsPlanList: document.querySelector("#savingsPlanList"),
  savingsPlanOpen: document.querySelector("#savingsPlanOpen"),
  savingsPlanInfo: document.querySelector("#savingsPlanInfo"),
  planExpensesTab: document.querySelector("#planExpensesTab"),
  planSavingsTab: document.querySelector("#planSavingsTab"),
  closeGoalsBtn: document.querySelector("#closeGoalsBtn"),
  newGoalBtn: document.querySelector("#newGoalBtn"),
  goalsList: document.querySelector("#goalsList"),
  goalsSummaryMonthly: document.querySelector("#goalsSummaryMonthly"),
  goalsSummaryDaily: document.querySelector("#goalsSummaryDaily"),
  goalsSummaryBudget: document.querySelector("#goalsSummaryBudget"),
  goalsSummarySaved: document.querySelector("#goalsSummarySaved"),
  goalEditorOverlay: document.querySelector("#goalEditorOverlay"),
  goalForm: document.querySelector("#goalForm"),
  goalEditorTitle: document.querySelector("#goalEditorTitle"),
  goalIdInput: document.querySelector("#goalIdInput"),
  goalNameInput: document.querySelector("#goalNameInput"),
  goalAmountInput: document.querySelector("#goalAmountInput"),
  goalCurrencyInput: document.querySelector("#goalCurrencyInput"),
  goalMonthsInput: document.querySelector("#goalMonthsInput"),
  goalSavedAmountInput: document.querySelector("#goalSavedAmountInput"),
  goalContributionModeInput: document.querySelector("#goalContributionModeInput"),
  goalMonthlyContributionInput: document.querySelector("#goalMonthlyContributionInput"),
  goalMonthlyContributionLabel: document.querySelector("#goalMonthlyContributionLabel"),
  goalBankInput: document.querySelector("#goalBankInput"),
  goalActiveInput: document.querySelector("#goalActiveInput"),
  goalMonthlyValue: document.querySelector("#goalMonthlyValue"),
  goalDailyValue: document.querySelector("#goalDailyValue"),
  goalProgressValue: document.querySelector("#goalProgressValue"),
  cancelGoalBtn: document.querySelector("#cancelGoalBtn"),
  deleteGoalBtn: document.querySelector("#deleteGoalBtn"),
  categoriesOverlay: document.querySelector("#categoriesOverlay"),
  closeCategoriesBtn: document.querySelector("#closeCategoriesBtn"),
  categoriesTabs: document.querySelector("#categoriesTabs"),
  categoriesList: document.querySelector("#categoriesList"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryNameInput: document.querySelector("#categoryNameInput"),
  savingsGoalOverlay: document.querySelector("#savingsGoalOverlay"),
  savingsGoalForm: document.querySelector("#savingsGoalForm"),
  closeSavingsGoalBtn: document.querySelector("#closeSavingsGoalBtn"),
  savingsGoalAmountInput: document.querySelector("#savingsGoalAmountInput"),
  savingsGoalCurrencyInput: document.querySelector("#savingsGoalCurrencyInput"),
  savingsGoalMonthsInput: document.querySelector("#savingsGoalMonthsInput"),
  savingsGoalMonthlyValue: document.querySelector("#savingsGoalMonthlyValue"),
  savingsGoalDailyValue: document.querySelector("#savingsGoalDailyValue"),
  savingsGoalBudgetValue: document.querySelector("#savingsGoalBudgetValue"),
  zoneHomeBtn: document.querySelector("#zoneHomeBtn"),
  zoneTransactionsBtn: document.querySelector("#zoneTransactionsBtn"),
  zoneAccountsBtn: document.querySelector("#zoneAccountsBtn"),
  zoneInsightsBtn: document.querySelector("#zoneInsightsBtn"),
  transactionsOverlay: document.querySelector("#transactionsOverlay"),
  closeTransactionsBtn: document.querySelector("#closeTransactionsBtn"),
  transactionsTotalLek: document.querySelector("#transactionsTotalLek"),
  transactionsTotalEuro: document.querySelector("#transactionsTotalEuro"),
  transactionsCount: document.querySelector("#transactionsCount"),
  transactionsRange: document.querySelector("#transactionsRange"),
  transactionsSearch: document.querySelector("#transactionsSearch"),
  transactionsTypeFilter: document.querySelector("#transactionsTypeFilter"),
  transactionsMonthFilter: document.querySelector("#transactionsMonthFilter"),
  transactionsCategoryFilter: document.querySelector("#transactionsCategoryFilter"),
  transactionsBankFilter: document.querySelector("#transactionsBankFilter"),
  transactionsCurrencyFilter: document.querySelector("#transactionsCurrencyFilter"),
  transactionsResetFilters: document.querySelector("#transactionsResetFilters"),
  transactionsList: document.querySelector("#transactionsList"),
  netWorthOverlay: document.querySelector("#netWorthOverlay"),
  closeNetWorthBtn: document.querySelector("#closeNetWorthBtn"),
  netWorthTotalEuro: document.querySelector("#netWorthTotalEuro"),
  netWorthTotalLek: document.querySelector("#netWorthTotalLek"),
  netWorthSnapshotBtn: document.querySelector("#netWorthSnapshotBtn"),
  netWorthAddAccountBtn: document.querySelector("#netWorthAddAccountBtn"),
  netWorthStatus: document.querySelector("#netWorthStatus"),
  netWorthTrend: document.querySelector("#netWorthTrend"),
  netWorthList: document.querySelector("#netWorthList"),
  insightsOverlay: document.querySelector("#insightsOverlay"),
  closeInsightsBtn: document.querySelector("#closeInsightsBtn"),
  insightsSafeOpen: document.querySelector("#insightsSafeOpen"),
  insightsSafeLek: document.querySelector("#insightsSafeLek"),
  insightsSafeEuro: document.querySelector("#insightsSafeEuro"),
  insightsRemainingLek: document.querySelector("#insightsRemainingLek"),
  insightsDaysRemaining: document.querySelector("#insightsDaysRemaining"),
  insightsSafeProgress: document.querySelector("#insightsSafeProgress"),
  insightsList: document.querySelector("#insightsList"),
  homeSetupHint: document.querySelector("#homeSetupHint"),
  formulaOverlay: document.querySelector("#formulaOverlay"),
  formulaTitle: document.querySelector("#formulaTitle"),
  formulaEyebrow: document.querySelector("#formulaEyebrow"),
  formulaSummary: document.querySelector("#formulaSummary"),
  formulaSteps: document.querySelector("#formulaSteps"),
  closeFormulaBtn: document.querySelector("#closeFormulaBtn"),
  setupOverlay: document.querySelector("#setupOverlay"),
  setupForm: document.querySelector("#setupForm"),
  closeSetupBtn: document.querySelector("#closeSetupBtn"),
  setupLaterBtn: document.querySelector("#setupLaterBtn"),
  setupLekBalanceInput: document.querySelector("#setupLekBalanceInput"),
  setupEuroBalanceInput: document.querySelector("#setupEuroBalanceInput"),
  setupGoalAmountInput: document.querySelector("#setupGoalAmountInput"),
  setupGoalCurrencyInput: document.querySelector("#setupGoalCurrencyInput"),
  setupGoalMonthsInput: document.querySelector("#setupGoalMonthsInput"),
  profileTransactionsBtn: document.querySelector("#profileTransactionsBtn"),
  profileNetWorthBtn: document.querySelector("#profileNetWorthBtn"),
  profileInsightsBtn: document.querySelector("#profileInsightsBtn"),
  importInput: document.querySelector("#importInput"),
  importPreviewOverlay: document.querySelector("#importPreviewOverlay"),
  importPreviewSummary: document.querySelector("#importPreviewSummary"),
  importPreviewWarning: document.querySelector("#importPreviewWarning"),
  closeImportPreviewBtn: document.querySelector("#closeImportPreviewBtn"),
  cancelImportBtn: document.querySelector("#cancelImportBtn"),
  confirmImportBtn: document.querySelector("#confirmImportBtn"),
  restoreBackupBtn: document.querySelector("#restoreBackupBtn"),
  quickAddOverlay: document.querySelector("#quickAddOverlay"),
  closeQuickAddBtn: document.querySelector("#closeQuickAddBtn"),
  quickAddAiInput: document.querySelector("#quickAddAiInput"),
  quickAddAiBtn: document.querySelector("#quickAddAiBtn"),
  quickAddVoiceBtn: document.querySelector("#quickAddVoiceBtn"),
  quickAddAiStatus: document.querySelector("#quickAddAiStatus"),
  quickAddExpenseBtn: document.querySelector("#quickAddExpenseBtn"),
  quickAddIncomeBtn: document.querySelector("#quickAddIncomeBtn"),
  undoToast: document.querySelector("#undoToast"),
  undoToastMessage: document.querySelector("#undoToastMessage"),
  undoToastBtn: document.querySelector("#undoToastBtn"),
  undoToastClose: document.querySelector("#undoToastClose"),
  emptyTemplate: document.querySelector("#emptyTemplate"),
};

state.categories = learnCategoriesFromData(state.categories, state.entries, state.recurringExpenses);
if (!state.goals.length && localStorage.getItem(GOALS_KEY) === null && Number(state.savingsGoal?.amount) > 0) {
  state.goals = [goalFromSavingsGoal(state.savingsGoal, { name: "Objektivi kryesor" })];
}
syncPrimarySavingsGoal();
saveCategories();
saveGoals();

els.dateInput.value = todayIso();
els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
applyTheme();
syncTypeControls();
render();
applyHomeOrder();
maybeOpenSetup();

document.querySelectorAll("[data-type]").forEach((button) => {
  button.addEventListener("click", () => {
    state.type = button.dataset.type;
    syncTypeControls();
  });
});

document.querySelectorAll("[data-zone]").forEach((button) => {
  button.addEventListener("click", () => goToZone(button.dataset.zone));
});

document.addEventListener("touchstart", handlePageSwipeStart, { passive: true });
window.addEventListener("touchmove", handlePageSwipeMove, { passive: false });
window.addEventListener("touchend", handlePageSwipeEnd);
window.addEventListener("touchcancel", cancelPageSwipe);

els.currencyInput.addEventListener("change", renderBankOptions);
els.receiptImageInput.addEventListener("change", handleReceiptImage);
els.resetReceiptAiBtn.addEventListener("click", resetReceiptAiConnection);

els.addEntryBtn.addEventListener("click", openQuickAdd);
els.overviewHome?.addEventListener("pointerdown", handleHomeReorderPointerDown);
window.addEventListener("pointermove", handleHomeReorderPointerMove, { passive: false });
window.addEventListener("pointerup", handleHomeReorderPointerUp);
window.addEventListener("pointercancel", handleHomeReorderPointerCancel);
els.overviewHome?.addEventListener("touchstart", handleHomeReorderTouchStart, { passive: false });
window.addEventListener("touchmove", handleHomeReorderTouchMove, { passive: false });
window.addEventListener("touchend", handleHomeReorderTouchEnd);
window.addEventListener("touchcancel", handleHomeReorderTouchCancel);
els.overviewHome?.addEventListener("contextmenu", handleHomeReorderContextMenu);
els.overviewHome?.addEventListener("click", handleHomeReorderClick, true);
els.closeQuickAddBtn?.addEventListener("click", closeQuickAdd);
els.quickAddOverlay?.addEventListener("click", (event) => {
  if (event.target === els.quickAddOverlay) closeQuickAdd();
});
els.quickAddAiBtn?.addEventListener("click", handleQuickAddAi);
els.quickAddVoiceBtn?.addEventListener("click", toggleQuickAddVoice);
els.quickAddAiInput?.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") handleQuickAddAi();
});
els.quickAddExpenseBtn?.addEventListener("click", () => chooseQuickAddType("expense"));
els.quickAddIncomeBtn?.addEventListener("click", () => chooseQuickAddType("income"));
els.homeExpenseOpen?.addEventListener("click", openExpenseArchive);
els.homeIncomeLimitOpen?.addEventListener("click", openIncomeDetail);
els.homeSavingsLimitOpen?.addEventListener("click", openSavingsDetail);
els.incomeYearDots?.addEventListener("click", handleHomeMonthChartClick);
els.savingsYearDots?.addEventListener("click", handleHomeMonthChartClick);
els.monthSummaryProgress?.addEventListener("click", handleHomeMonthChartClick);
els.safeSpendOpen?.addEventListener("click", openGoalsWindow);
els.savingsPlanOpen?.addEventListener("click", openSavingsPlanDetail);
els.savingsPlanInfo?.addEventListener("click", () => openFormulaOverlay("plan"));
els.savingsPlanList?.addEventListener("click", handlePlanLegendClick);
els.homeSetupHint?.addEventListener("click", () => {
  if (els.homeSetupHint?.dataset.action === "goals") openGoalsWindow();
  else chooseQuickAddType("income");
});
document.querySelectorAll("[data-home-plan-tab]").forEach((button) => {
  button.addEventListener("click", () => selectHomePlanTab(button.dataset.homePlanTab));
});
els.safeSpendInfo?.addEventListener("click", () => openFormulaOverlay("safe"));
els.quickAccountsOpen?.addEventListener("click", openNetWorthWindow);
els.quickAccountsInfo?.addEventListener("click", () => openFormulaOverlay("accounts"));
els.quickExpenseOpen?.addEventListener("click", openExpenseArchive);
els.quickExpenseInfo?.addEventListener("click", () => openFormulaOverlay("expense"));
els.quickAverageOpen?.addEventListener("click", openInsightsWindow);
els.quickAverageInfo?.addEventListener("click", () => openFormulaOverlay("forecast"));
els.quickSavingsOpen?.addEventListener("click", openGoalsWindow);
els.quickSavingsInfo?.addEventListener("click", () => openFormulaOverlay("savings"));
els.openLimitsBtn.addEventListener("click", () => openLimitsEditor("expense"));
els.cancelLimitsBtn.addEventListener("click", closeLimitsEditor);
els.limitsOverlay.addEventListener("click", (event) => {
  if (event.target === els.limitsOverlay) closeLimitsEditor();
});
els.limitsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const snapshot = snapshotFinanceState();
  createAutoBackup();
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
  showUndoToast("Kufijtë u përditësuan.", () => restoreFinanceSnapshot(snapshot));
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
els.openAccountsEuroBtn?.addEventListener("click", openAccountsWindow);
els.closeAccountsBtn.addEventListener("click", closeAccountsWindow);
els.accountsOverlay.addEventListener("click", (event) => {
  if (event.target === els.accountsOverlay) closeAccountsWindow();
});
els.closeRecurringBtn?.addEventListener("click", closeRecurringWindow);
els.recurringOverlay?.addEventListener("click", (event) => {
  if (event.target === els.recurringOverlay) closeRecurringWindow();
});
els.newRecurringBtn?.addEventListener("click", () => openRecurringEditor());
els.recurringList?.addEventListener("click", handleRecurringListClick);
els.cancelRecurringEditorBtn?.addEventListener("click", closeRecurringEditor);
els.recurringEditorOverlay?.addEventListener("click", (event) => {
  if (event.target === els.recurringEditorOverlay) closeRecurringEditor();
});
els.recurringForm?.addEventListener("submit", handleRecurringSubmit);
els.deleteRecurringBtn?.addEventListener("click", () => deleteRecurringExpense(state.editingRecurringId));

els.newAccountBtn.addEventListener("click", () => openAccountEditor());
els.newAccountBtnModal.addEventListener("click", () => openAccountEditor());
els.cancelAccountBtn.addEventListener("click", closeAccountEditor);
els.accountEditorOverlay.addEventListener("click", (event) => {
  if (event.target === els.accountEditorOverlay) closeAccountEditor();
});

els.accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const snapshot = snapshotFinanceState();
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
  showUndoToast(editingBank ? "Llogaria u përditësua." : "Llogaria u shtua.", () => restoreFinanceSnapshot(snapshot));
});

els.deleteAccountBtn.addEventListener("click", () => {
  deleteBank(els.accountIdInput.value);
});

els.accountList.addEventListener("click", handleAccountListClick);
els.accountListModal.addEventListener("click", handleAccountListClick);
els.netWorthList?.addEventListener("click", handleAccountListClick);

function handleAccountListClick(event) {
  const defaultButton = event.target.closest("[data-default-bank]");
  const editButton = event.target.closest("[data-edit-bank]");
  const deleteButton = event.target.closest("[data-delete-bank]");

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
  if (deleteButton) deleteBank(deleteButton.dataset.deleteBank);
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

  const snapshot = snapshotFinanceState();
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
  showUndoToast(editingEntry ? "Zëri u përditësua." : state.type === "income" ? "E ardhura u shtua." : "Shpenzimi u shtua.", () => restoreFinanceSnapshot(snapshot));
});

els.entryList.addEventListener("click", handleEntryListClick);
els.expensePreviewList.addEventListener("click", handleExpensePreviewClick);
els.incomePreviewList.addEventListener("click", handleIncomePreviewClick);
els.expenseArchiveList.addEventListener("click", handleEntryListClick);
els.incomeArchiveList.addEventListener("click", handleEntryListClick);
els.transactionsList?.addEventListener("click", handleEntryListClick);
els.closeTransactionsBtn?.addEventListener("click", closeTransactionsWindow);
els.transactionsOverlay?.addEventListener("click", (event) => {
  if (event.target === els.transactionsOverlay) closeTransactionsWindow();
});
els.transactionsSearch?.addEventListener("input", (event) => {
  state.transactionSearch = event.target.value;
  renderTransactions();
});
els.transactionsTypeFilter?.addEventListener("change", (event) => {
  state.transactionFilter = event.target.value;
  renderTransactions();
});
els.transactionsMonthFilter?.addEventListener("change", (event) => {
  state.transactionMonthFilter = event.target.value;
  renderTransactions();
});
els.transactionsCategoryFilter?.addEventListener("change", (event) => {
  state.transactionCategoryFilter = event.target.value;
  renderTransactions();
});
els.transactionsBankFilter?.addEventListener("change", (event) => {
  state.transactionBankFilter = event.target.value;
  renderTransactions();
});
els.transactionsCurrencyFilter?.addEventListener("change", (event) => {
  state.transactionCurrencyFilter = event.target.value;
  renderTransactions();
});
els.transactionsResetFilters?.addEventListener("click", resetTransactionFilters);
els.closeNetWorthBtn?.addEventListener("click", closeNetWorthWindow);
els.netWorthOverlay?.addEventListener("click", (event) => {
  if (event.target === els.netWorthOverlay) closeNetWorthWindow();
});
els.netWorthSnapshotBtn?.addEventListener("click", () => saveNetWorthSnapshot(new Date(), true));
els.netWorthAddAccountBtn?.addEventListener("click", () => openAccountEditor());
els.netWorthTrend?.addEventListener("click", handleHomeMonthChartClick);
els.closeInsightsBtn?.addEventListener("click", closeInsightsWindow);
els.insightsSafeOpen?.addEventListener("click", () => openFormulaOverlay("safe"));
els.insightsOverlay?.addEventListener("click", (event) => {
  if (event.target === els.insightsOverlay) closeInsightsWindow();
});
els.insightsList?.addEventListener("click", handleInsightAction);
els.expenseArchiveSearch?.addEventListener("input", (event) => updateArchiveSearch("expense", event.target.value));
els.incomeArchiveSearch?.addEventListener("input", (event) => updateArchiveSearch("income", event.target.value));
els.expenseArchiveSearchClear?.addEventListener("click", () => clearArchiveSearch("expense"));
els.incomeArchiveSearchClear?.addEventListener("click", () => clearArchiveSearch("income"));
els.closeExpenseArchiveBtn.addEventListener("click", closeExpenseArchive);
els.closeIncomeArchiveBtn.addEventListener("click", closeIncomeArchive);
els.expenseArchiveOverlay.addEventListener("click", (event) => {
  if (event.target === els.expenseArchiveOverlay) closeExpenseArchive();
});
els.incomeArchiveOverlay.addEventListener("click", (event) => {
  if (event.target === els.incomeArchiveOverlay) closeIncomeArchive();
});
els.closeIncomeDetailBtn?.addEventListener("click", closeIncomeDetail);
els.incomeDetailOverlay?.addEventListener("click", (event) => {
  if (event.target === els.incomeDetailOverlay) closeIncomeDetail();
});
document.querySelectorAll("[data-income-detail-range]").forEach((button) => {
  button.addEventListener("click", () => {
    state.incomeDetailRange = button.dataset.incomeDetailRange || "month";
    renderIncomeDetail();
  });
});
els.closeSavingsDetailBtn?.addEventListener("click", closeSavingsDetail);
els.savingsDetailOverlay?.addEventListener("click", (event) => {
  if (event.target === els.savingsDetailOverlay) closeSavingsDetail();
});
document.querySelectorAll("[data-savings-detail-range]").forEach((button) => {
  button.addEventListener("click", () => {
    state.savingsDetailRange = button.dataset.savingsDetailRange || "month";
    renderSavingsDetail();
  });
});

els.clearBtn.addEventListener("click", () => {
  if (!state.entries.length) return;
  const confirmed = confirm("A dëshiron t'i fshish të gjithë zërat dhe t'i kthesh efektet në llogari?");
  if (!confirmed) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  state.entries.forEach((entry) => {
    if (entry.bankId) applyBankDelta(entry.bankId, entry.type === "income" ? -entry.amount : entry.amount);
  });
  state.entries = [];
  saveBanks();
  saveEntries();
  render();
  showUndoToast("Të gjithë zërat u pastruan.", () => restoreFinanceSnapshot(snapshot));
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
els.undoToastBtn?.addEventListener("click", undoLastAction);
els.undoToastClose?.addEventListener("click", hideUndoToast);
els.backupToggle.addEventListener("click", () => {
  const isOpen = els.backupToggle.getAttribute("aria-expanded") === "true";
  els.backupToggle.setAttribute("aria-expanded", String(!isOpen));
  els.backupToggle.setAttribute("aria-label", isOpen ? "Shfaq backup" : "Fshih backup");
  els.backupPanel.classList.toggle("is-open", !isOpen);
  els.backupPanel.classList.toggle("is-collapsed", isOpen);
  els.backupActions.hidden = isOpen;
});
els.themeToggle.addEventListener("click", openProfileMenu);
els.profileMenuOverlay?.addEventListener("click", (event) => {
  if (event.target === els.profileMenuOverlay) closeProfileMenu();
});
els.profilePersonalBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openAccountsWindow();
});
els.profileSavingsBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openGoalsWindow();
});
els.profileCategoriesBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openCategoriesWindow();
});
els.profileExpensesBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openLimitsEditor("expense");
});
els.profileRecurringBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openRecurringWindow();
});
els.profileIncomeBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openLimitsEditor("income");
});
els.profileTransactionsBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openTransactionsWindow();
});
els.profileNetWorthBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openNetWorthWindow();
});
els.profileInsightsBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openInsightsWindow();
});
els.profileSetupBtn?.addEventListener("click", () => {
  closeProfileMenu();
  openSetupOverlay(false);
});
els.profileThemeBtn?.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveTheme();
  applyTheme();
});
els.savingsGoalOverlay?.addEventListener("click", (event) => {
  if (event.target === els.savingsGoalOverlay) closeSavingsGoalEditor();
});
els.closeSavingsGoalBtn?.addEventListener("click", closeSavingsGoalEditor);
els.savingsGoalAmountInput?.addEventListener("input", renderSavingsGoalSummary);
els.savingsGoalCurrencyInput?.addEventListener("change", renderSavingsGoalSummary);
els.savingsGoalMonthsInput?.addEventListener("change", renderSavingsGoalSummary);
els.savingsGoalForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const snapshot = snapshotFinanceState();
  createAutoBackup();
  state.savingsGoal = normalizeSavingsGoal({
    amount: Number(els.savingsGoalAmountInput.value) || 0,
    currency: els.savingsGoalCurrencyInput.value,
    months: Number(els.savingsGoalMonthsInput.value) || 12,
  });
  upsertPrimaryGoalFromSavingsGoal(state.savingsGoal);
  saveSavingsGoal();
  saveGoals();
  closeSavingsGoalEditor();
  render();
  showUndoToast("Objektivi u ruajt.", () => restoreFinanceSnapshot(snapshot));
});
els.goalsOverlay?.addEventListener("click", (event) => {
  if (event.target === els.goalsOverlay) closeGoalsWindow();
});
els.closeGoalsBtn?.addEventListener("click", closeGoalsWindow);
els.newGoalBtn?.addEventListener("click", () => openGoalEditor());
els.goalsList?.addEventListener("click", handleGoalsListClick);
els.goalEditorOverlay?.addEventListener("click", (event) => {
  if (event.target === els.goalEditorOverlay) closeGoalEditor();
});
els.cancelGoalBtn?.addEventListener("click", closeGoalEditor);
els.goalForm?.addEventListener("submit", handleGoalSubmit);
els.deleteGoalBtn?.addEventListener("click", () => deleteGoal(state.editingGoalId));
[els.goalNameInput, els.goalAmountInput, els.goalCurrencyInput, els.goalMonthsInput, els.goalSavedAmountInput, els.goalContributionModeInput, els.goalMonthlyContributionInput, els.goalBankInput, els.goalActiveInput].forEach((input) => {
  input?.addEventListener("input", renderGoalEditorSummary);
  input?.addEventListener("change", renderGoalEditorSummary);
});
els.categoriesOverlay?.addEventListener("click", (event) => {
  if (event.target === els.categoriesOverlay) closeCategoriesWindow();
});
els.closeCategoriesBtn?.addEventListener("click", closeCategoriesWindow);
els.categoriesTabs?.addEventListener("click", handleCategoryTabClick);
els.categoryForm?.addEventListener("submit", handleCategorySubmit);
els.categoriesList?.addEventListener("click", handleCategoryListClick);
els.closeFormulaBtn?.addEventListener("click", closeFormulaOverlay);
els.formulaOverlay?.addEventListener("click", (event) => {
  if (event.target === els.formulaOverlay) closeFormulaOverlay();
});
els.closeSetupBtn?.addEventListener("click", () => closeSetupOverlay(true));
els.setupLaterBtn?.addEventListener("click", () => closeSetupOverlay(true));
els.setupOverlay?.addEventListener("click", (event) => {
  if (event.target === els.setupOverlay) closeSetupOverlay(true);
});
els.setupForm?.addEventListener("submit", handleSetupSubmit);
els.importInput.addEventListener("change", importData);
els.closeImportPreviewBtn?.addEventListener("click", closeImportPreview);
els.cancelImportBtn?.addEventListener("click", closeImportPreview);
els.importPreviewOverlay?.addEventListener("click", (event) => {
  if (event.target === els.importPreviewOverlay) closeImportPreview();
});
els.confirmImportBtn?.addEventListener("click", confirmPendingImport);
els.restoreBackupBtn.addEventListener("click", restoreAutoBackup);

function render() {
  ensureDefaultBanks();
  const accountTotals = bankTotals();
  const now = new Date();
  recordNetWorthSnapshot(now, accountTotals);
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
  renderRecurringWindow();
  renderPreviewEntries();
  if (els.incomeDetailOverlay && !els.incomeDetailOverlay.hidden) renderIncomeDetail();
  if (els.savingsDetailOverlay && !els.savingsDetailOverlay.hidden) renderSavingsDetail();
  renderListVisibility();
  syncDailyCurrencyControls();
  renderDailySpending();
  renderEntries();
  renderCategories();
  syncZoneNav();
  if (els.transactionsOverlay && !els.transactionsOverlay.hidden) renderTransactions();
  if (els.netWorthOverlay && !els.netWorthOverlay.hidden) renderNetWorth();
  if (els.insightsOverlay && !els.insightsOverlay.hidden) renderInsights();
  if (els.goalsOverlay && !els.goalsOverlay.hidden) renderGoalsWindow();
  if (els.categoriesOverlay && !els.categoriesOverlay.hidden) renderCategoryManager();
}

function renderOverview(now, monthEntries, yearEntries, spentToday, spentMonth, spentYear, incomeMonth, incomeYear, incomeMonthlyTotals, accountTotals) {
  if (els.todayLabel) els.todayLabel.textContent = longDateLabel(now);

  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const today = toLocalIso(now);
  const monthToDateEntries = monthEntries.filter((entry) => entry.date <= today);
  const spentMonthToDate = monthToDateEntries.filter((entry) => entry.type === "expense").reduce(sumMoneyTotals, emptyMoneyTotals());
  const savingsMonthlyTotals = monthlySavingsTotals(currentYear, now);
  const savingsMonth = savingsPerformanceForMonth(currentYear, currentMonthIndex, now).totals;
  const savingsLimitLek = Math.max(savingsGoalMonthlyTargetLek(), Math.abs(totalsToLek(savingsMonth)), 1);

  renderQuickMetrics(now, spentToday, spentMonthToDate, accountTotals, incomeMonth);
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
    limitALL: savingsLimitLek,
    limitEUR: 0,
  });
  renderActivityRing(monthEntries);
  renderHomeGoals(Math.max(totalsToLek(savingsMonth), 0));
}

function renderHomeGoals() {
  if (!els.homeGoalsGrid) return;
  const goals = normalizeGoals(state.goals).filter((goal) => goal.active !== false);
  if (!goals.length) { els.homeGoalsGrid.innerHTML = ""; els.homeGoalsGrid.hidden = true; return; }
  els.homeGoalsGrid.hidden = false;
  els.homeGoalsGrid.classList.toggle("is-scrollable", goals.length > 2);
  els.homeGoalsGrid.setAttribute(
    "aria-label",
    goals.length > 2 ? "Objektivat e kursimit. Rrëshqit horizontalisht për të parë të gjitha." : "Objektivat e kursimit"
  );
  els.homeGoalsGrid.innerHTML = goals.map((goal, index) => {
    const saved = goalSavedAmount(goal);
    const progress = Math.min(Number(goal.amount) > 0 ? (saved / Number(goal.amount)) * 100 : 0, 100);
    return `<article class="home-goal-card goal-tone-${index % 6}"><button class="overview-arrow" type="button" data-home-goal-open="${escapeHtml(goal.id)}" aria-label="Hap objektivin">›</button><h2>${escapeHtml(goal.name)}</h2><span>Kursyer</span><strong>${escapeHtml(goalSavedAmountLabel(goal))}</strong><div class="goal-progress"><span style="width:${progress}%"></span></div><div class="goal-meta"><div><small>Kursyer</small><b>${Math.round(progress)}%</b></div><div><small>Mbeten edhe</small><b>${escapeHtml(goalDurationLabel(goal.months))}</b></div></div></article>`;
  }).join("");
  els.homeGoalsGrid.querySelectorAll("[data-home-goal-open]").forEach((button) => button.addEventListener("click", openGoalsWindow));
}

function renderQuickMetrics(now, spentToday, spentMonthToDate, accountTotals, incomeMonth) {
  const budget = monthlyBudgetInsight(now, spentToday, spentMonthToDate, incomeMonth);
  const netSavingsLek = totalsToLek(incomeMonth) - totalsToLek(spentMonthToDate);

  renderSafeSpendCard(budget);
  renderHomeSetupHint(incomeMonth);
  setText(els.quickAccountLek, moneyLekShort(accountTotals.ALL));
  setText(els.quickAccountEuro, moneyEuroCompact(accountTotals.EUR));
  setText(els.quickExpenseLek, moneyLekShort(spentMonthToDate.ALL));
  setText(els.quickExpenseEuro, moneyEuroCompact(spentMonthToDate.EUR));
  setText(els.monthSpendableLek, moneyLekShort(Math.max(budget.remainingLek, 0)));
  setText(els.monthSpendableEuro, `≈${moneyEuroCompact(Math.max(budget.remainingLek, 0) / state.exchangeRate)}`);
  setText(els.monthIncomeSummaryLek, moneyLekShort(incomeMonth.ALL));
  setText(els.monthIncomeSummaryEuro, moneyEuroCompact(incomeMonth.EUR));
  setText(els.quickAverageNote, "fund-muaji");
  setText(els.quickAverageLek, moneyLekShort(budget.projectedSpendLek));
  setText(els.quickAverageEuro, `≈${moneyEuroCompact(budget.projectedSpendLek / state.exchangeRate)}`);
  setText(els.quickSavingsLek, moneyLekShort(netSavingsLek));
  setText(els.quickSavingsEuro, moneyEuroCompact(netSavingsLek / state.exchangeRate));
  renderHomeSummaryBars(budget, spentMonthToDate, incomeMonth, netSavingsLek);
  renderBalanceComparison(accountTotals);
}

function renderHomeSetupHint(incomeMonth) {
  if (!els.homeSetupHint) return;
  const incomeLek = totalsToLek(incomeMonth);
  const activeGoals = normalizeGoals(state.goals).filter((goal) => goal.active !== false);
  if (incomeLek <= 0) {
    els.homeSetupHint.hidden = false;
    els.homeSetupHint.dataset.action = "income";
    els.homeSetupHint.textContent = "Ende nuk ke regjistruar të ardhura këtë muaj. Prek këtu që të aktivizohen buxheti dhe parashikimi.";
    return;
  }
  if (!activeGoals.length) {
    els.homeSetupHint.hidden = false;
    els.homeSetupHint.dataset.action = "goals";
    els.homeSetupHint.textContent = "Vendos një objektiv kursimi që ‘Mund të shpenzosh sot’ të llogaritet sipas planit tënd.";
    return;
  }
  els.homeSetupHint.hidden = true;
  els.homeSetupHint.textContent = "";
}

function renderHomeSummaryBars(budget, spentMonthToDate, incomeMonth, netSavingsLek) {
  const spent = Math.max(totalsToLek(spentMonthToDate), 0);
  const income = Math.max(totalsToLek(incomeMonth), 0);
  const available = Math.max(budget.remainingLek, 0);
  const overspent = Math.max(-budget.remainingLek, 0);
  const hasBudget = income > 0;
  const spentPct = hasBudget ? Math.min((spent / income) * 100, 100) : 0;
  const availablePct = hasBudget ? Math.min((available / income) * 100, Math.max(100 - spentPct, 0)) : 0;
  const reservedPct = hasBudget ? Math.max(100 - spentPct - availablePct, 0) : 0;
  const reserved = hasBudget ? Math.max(income - Math.min(spent, income) - available, 0) : 0;
  const overspentPct = hasBudget && overspent > 0 ? Math.min(Math.max((overspent / income) * 100, 6), 32) : 0;

  if (els.monthSummaryProgress) {
    els.monthSummaryProgress.style.setProperty("--spent", `${spentPct}%`);
    els.monthSummaryProgress.style.setProperty("--available", `${availablePct}%`);
    els.monthSummaryProgress.style.setProperty("--reserved", `${reservedPct}%`);
    els.monthSummaryProgress.style.setProperty("--overspent", `${overspentPct}%`);
    els.monthSummaryProgress.classList.toggle("is-no-budget", !hasBudget);
    els.monthSummaryProgress.classList.toggle("is-overspent", hasBudget && overspent > 0);

    const progressMessage = !hasBudget
      ? `Pa buxhet këtë muaj. Shpenzuar ${moneyLekShort(spent)}. Shto të ardhura për ta aktivizuar.`
      : overspent > 0
        ? `Mbi buxhet me ${moneyLekShort(overspent)}. Shpenzuar ${moneyLekShort(spent)} nga ${moneyLekShort(income)} të ardhura.`
        : `Shpenzuar ${moneyLekShort(spent)}. Në dispozicion ${moneyLekShort(available)}. Rezervuar ${moneyLekShort(reserved)}.`;
    els.monthSummaryProgress.dataset.chartMessage = progressMessage;
    els.monthSummaryProgress.title = progressMessage;
    els.monthSummaryProgress.setAttribute("aria-label", progressMessage);
  }

  if (els.monthSummaryStatus) {
    const statusText = !hasBudget
      ? spent > 0
        ? `Pa buxhet këtë muaj · ${moneyLekShort(spent)} të shpenzuara`
        : "Pa buxhet këtë muaj"
      : overspent > 0
        ? `Mbi buxhet me ${moneyLekShort(overspent)}`
        : reserved > 0
          ? `Rezervuar për objektiva dhe detyrime: ${moneyLekShort(reserved)}`
          : `Në dispozicion: ${moneyLekShort(available)}`;
    setText(els.monthSummaryStatus, statusText);
    els.monthSummaryStatus.classList.toggle("is-warning", hasBudget && overspent > 0);
    els.monthSummaryStatus.classList.toggle("is-neutral", !hasBudget);
  }

  if (els.savingsDirectionBar) {
    const target = Math.max(budget.monthlyTargetLek, Math.abs(netSavingsLek), 1);
    const magnitude = Math.min(Math.abs(netSavingsLek) / target * 50, 50);
    els.savingsDirectionBar.style.setProperty("--saving-width", `${magnitude}%`);
    els.savingsDirectionBar.classList.toggle("is-negative", netSavingsLek < 0);
    els.savingsDirectionBar.classList.toggle("is-positive", netSavingsLek >= 0);
  }
  if (els.forecastProgress) {
    const ratio = budget.monthlyBudgetLek > 0 ? Math.min(budget.projectedSpendLek / budget.monthlyBudgetLek, 1) : 0;
    els.forecastProgress.style.setProperty("--progress", `${ratio * 100}%`);
  }
}

function renderBalanceComparison(accountTotals) {
  const now = new Date();
  const currentLek = totalsToLek(accountTotals);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
  const history = normalizeNetWorthHistory(state.netWorthHistory, state.exchangeRate).filter((item) => String(item.date || "").startsWith(previousKey));
  const previous = history.length ? history[history.length - 1].totalLek : currentLek;
  const deltaLek = currentLek - previous;
  const signedLek = `${deltaLek > 0 ? "+" : ""}${moneyLekShort(deltaLek)}`;
  const deltaEuro = state.exchangeRate > 0 ? deltaLek / state.exchangeRate : 0;
  const signedEuro = `${deltaEuro > 0 ? "+" : ""}${moneyEuroCompact(deltaEuro)}`;
  setText(els.balanceCompareLek, signedLek);
  setText(els.balanceCompareEuro, signedEuro);
}

function monthlyBudgetInsight(now, spentToday, spentMonthToDate, incomeMonth) {
  const monthDays = daysInMonth(now);
  const daysElapsed = Math.max(now.getDate(), 1);
  const daysRemaining = Math.max(monthDays - now.getDate() + 1, 1);
  const savingsPlan = savingsGoalPlan(now, incomeMonth);
  const spentMonthLek = totalsToLek(spentMonthToDate);
  const spentTodayLek = totalsToLek(spentToday);
  const monthlyBudgetLek = savingsPlan.monthlySpendBudgetLek;
  const fixedRemainingLek = fixedExpensesRemainingLek(now);
  const remainingLek = monthlyBudgetLek - fixedRemainingLek - spentMonthLek;
  const dailySafeLek = Math.max(remainingLek, 0) / daysRemaining;
  const spendBudgetToDateLek = savingsPlan.dailySpendBudgetLek * daysElapsed;
  const savedToDateLek = spendBudgetToDateLek - spentMonthLek;
  const todaySavingsLek = savingsPlan.dailySpendBudgetLek - spentTodayLek;
  const dailyAverageLek = spentMonthLek / daysElapsed;
  const projectedSpendLek = dailyAverageLek * monthDays;
  const forecastDeltaLek = monthlyBudgetLek - fixedRemainingLek - projectedSpendLek;
  const remainingRatio = monthlyBudgetLek > 0 ? clamp01(Math.max(remainingLek, 0) / monthlyBudgetLek) : 0;

  return {
    dailyAverageLek,
    dailySafeLek,
    dailySpendBudgetLek: savingsPlan.dailySpendBudgetLek,
    daysElapsed,
    daysRemaining,
    fixedRemainingLek,
    forecastDeltaLek,
    monthDays,
    monthlyBudgetLek,
    monthlyIncomeLek: totalsToLek(incomeMonth),
    monthlyTargetLek: savingsPlan.monthlyTargetLek,
    projectedSpendLek,
    remainingLek,
    remainingRatio,
    savedToDateLek,
    spendBudgetToDateLek,
    spentMonthLek,
    todaySavingsLek,
  };
}

function fixedExpensesRemainingLek(now = new Date()) {
  return recurringTotalsLek(recurringRemainingExpenses(now));
}

function renderSafeSpendCard(budget) {
  const spendableLek = Math.max(budget.remainingLek, 0);
  const dailySafeLek = Math.max(budget.dailySafeLek, 0);
  const remainingPercent = Math.round(budget.remainingRatio * 100);
  setText(els.safeSpendLek, moneyLekShort(dailySafeLek));
  setText(els.safeSpendEuro, `≈ ${moneyEuroCompact(dailySafeLek / state.exchangeRate)} / ditë`);
  setText(els.safeSpendRemaining, moneyLekShort(spendableLek));
  setText(els.safeSpendDays, `${budget.daysRemaining} ditë`);
  setText(els.safeSpendProgressText, `${remainingPercent}% buxhet i mbetur deri më ${endOfMonthLabel(new Date())}`);
  setText(els.safeSpendForecast, budgetForecastText(budget));
  if (els.safeSpendProgress) {
    const ring = els.safeSpendProgress.parentElement;
    ring?.style.setProperty("--ring", `${remainingPercent}%`);
    if (ring) ring.dataset.percent = `${remainingPercent}%`;
  }
}

function budgetForecastText(budget) {
  if (budget.monthlyBudgetLek <= 0) {
    return "Vendos të ardhura dhe objektiv kursimi që app-i të llogarisë buxhetin.";
  }

  const projected = moneyLekShort(budget.projectedSpendLek);
  const delta = moneyLekShort(Math.abs(budget.forecastDeltaLek));
  const fixedText = budget.fixedRemainingLek > 0 ? ` Detyrime fikse të mbetura: ${moneyLekShort(budget.fixedRemainingLek)}.` : "";
  if (budget.forecastDeltaLek >= 0) {
    return `Me ritmin aktual, fundi i muajit del ${projected}, rreth ${delta} nën buxhet.${fixedText}`;
  }

  return `Me ritmin aktual, fundi i muajit del ${projected}, rreth ${delta} mbi buxhet.${fixedText}`;
}

function openFormulaOverlay(topic = "safe") {
  const content = formulaContent(topic);
  if (!content || !els.formulaOverlay) return;

  setText(els.formulaEyebrow, content.eyebrow);
  setText(els.formulaTitle, content.title);
  const updatedTime = new Intl.DateTimeFormat("sq-AL", { hour: "2-digit", minute: "2-digit" }).format(new Date());
  setText(els.formulaSummary, `${content.summary} Përditësuar sot në ${updatedTime}.`);

  if (els.formulaSteps) {
    els.formulaSteps.innerHTML = content.steps
      .map(
        (step) => `
          <article class="formula-step ${step.tone ? `is-${step.tone}` : ""}">
            <span>${escapeHtml(step.label)}</span>
            <strong>${escapeHtml(step.value)}</strong>
            ${step.detail ? `<small>${escapeHtml(step.detail)}</small>` : ""}
          </article>
        `
      )
      .join("");
  }

  els.formulaOverlay.hidden = false;
}

function closeFormulaOverlay() {
  if (els.formulaOverlay) els.formulaOverlay.hidden = true;
}

function currentBudgetContext() {
  const now = new Date();
  const currentMonth = monthKey(now);
  const today = todayIso();
  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(currentMonth) && entry.date <= today);
  const spentToday = state.entries.filter((entry) => entry.type === "expense" && entry.date === today).reduce(sumMoneyTotals, emptyMoneyTotals());
  const spentMonth = monthEntries.filter((entry) => entry.type === "expense").reduce(sumMoneyTotals, emptyMoneyTotals());
  const incomeMonth = monthEntries.filter((entry) => entry.type === "income").reduce(sumMoneyTotals, emptyMoneyTotals());
  const budget = monthlyBudgetInsight(now, spentToday, spentMonth, incomeMonth);
  const accountTotals = bankTotals();

  return { spentToday, spentMonth, incomeMonth, budget, accountTotals };
}

function formulaContent(topic) {
  const { spentToday, spentMonth, incomeMonth, budget, accountTotals } = currentBudgetContext();

  if (topic === "expense") {
    return {
      eyebrow: "Shpenzime",
      title: "Si lexohet karta",
      summary: "Shfaq shpenzimet e regjistruara deri sot dhe krahasimin me limitin mujor.",
      steps: [
        formulaStep("Shpenzuar sot", `${moneyLekShort(spentToday.ALL)} / ${moneyEuroCompact(spentToday.EUR)}`),
        formulaStep("Shpenzuar këtë muaj", `${moneyLekShort(spentMonth.ALL)} / ${moneyEuroCompact(spentMonth.EUR)}`),
        formulaStep("Limiti mujor", `${moneyLekShort(state.limits.expenseALL)} / ${moneyEuroCompact(state.limits.expenseEUR)}`),
        formulaStep("Përdorur", `${ratioText(spentMonth.ALL, state.limits.expenseALL)} në lekë`, "Grafiku tregon progresin ndaj limitit."),
      ],
    };
  }

  if (topic === "accounts") {
    const totalLek = totalsToLek(accountTotals);
    return {
      eyebrow: "Gjendja",
      title: "Nga vijnë vlerat",
      summary: "Gjendja merret nga llogaritë dhe cash-i që ke regjistruar, pa i bashkuar verbërisht Lekë dhe Euro.",
      steps: [
        formulaStep("Gjendje Lekë", moneyLekShort(accountTotals.ALL), "Nga llogaritë në Lekë."),
        formulaStep("Gjendje Euro", moneyEuroCompact(accountTotals.EUR), "Nga llogaritë në Euro."),
        formulaStep("Totali në Lekë", moneyLekShort(totalLek), "Euro kthehet me kursin aktual."),
        formulaStep("Totali në Euro", moneyEuroCompact(totalLek / state.exchangeRate), `1€ = ${formatRateInput(state.exchangeRate)} L`),
      ],
    };
  }

  if (topic === "savings") {
    const incomeLek = totalsToLek(incomeMonth);
    const saved = incomeLek - budget.spentMonthLek;
    return {
      eyebrow: "Kursime",
      title: "Kursyer deri tani",
      summary: "Kjo është diferenca reale mes të ardhurave dhe shpenzimeve të regjistruara këtë muaj.",
      steps: [
        formulaStep("Të ardhura deri sot", moneyLekShort(incomeLek)),
        formulaStep("Shpenzuar deri sot", `- ${moneyLekShort(budget.spentMonthLek)}`),
        formulaStep(
          "Kursyer deri tani",
          `${saved < 0 ? "-" : ""}${moneyLekShort(Math.abs(saved))} / ${saved < 0 ? "-" : ""}${moneyEuroCompact(Math.abs(saved) / state.exchangeRate)}`,
          "Pozitive kur të ardhurat janë më të larta se shpenzimet. Shiriti lëviz djathtas kur rezultati është pozitiv dhe majtas kur është negativ.",
          saved >= 0 ? "positive" : "warning"
        ),
        formulaStep("Objektivi mujor", `${moneyLekShort(budget.monthlyTargetLek)} / ${moneyEuroCompact(budget.monthlyTargetLek / state.exchangeRate)}`),
      ],
    };
  }

  if (topic === "forecast") {
    const delta = budget.forecastDeltaLek;
    return {
      eyebrow: "Parashikimi",
      title: "Fundi i muajit",
      summary: "Llogarit çfarë pritet të ndodhë nëse vazhdon me të njëjtin ritëm shpenzimi.",
      steps: [
        formulaStep("Mesatarja ditore", moneyLekShort(budget.dailyAverageLek), `${budget.daysElapsed} ditë të kaluara.`),
        formulaStep("Parashikimi fund-muaji", `${moneyLekShort(budget.projectedSpendLek)} / ${moneyEuroCompact(budget.projectedSpendLek / state.exchangeRate)}`),
        formulaStep(
          "Diferenca me buxhetin",
          `${delta < 0 ? "-" : ""}${moneyLekShort(Math.abs(delta))}`,
          delta >= 0 ? "Nën buxhet me ritmin aktual." : "Mbi buxhet me ritmin aktual.",
          delta >= 0 ? "positive" : "warning"
        ),
      ],
    };
  }

  if (topic === "plan") {
    const activeGoals = normalizeGoals(state.goals).filter((goal) => goal.active !== false);
    const savedLek = activeGoals.reduce((sum, goal) => sum + goalSavedLek(goal), 0);
    const targetLek = activeGoals.reduce((sum, goal) => {
      const amount = Number(goal.amount) || 0;
      return sum + (normalizeCurrency(goal.currency) === "EUR" ? amount * state.exchangeRate : amount);
    }, 0);
    return {
      eyebrow: "Grafiku rrethor",
      title: "Shpenzime dhe kursime",
      summary: "Zgjidh tab-in dhe prek një rresht për vlerën e saktë. Grafiku përditësohet sa herë regjistron një zë ose ndryshon një objektiv.",
      steps: [
        formulaStep("Objektiva aktive", String(activeGoals.length)),
        formulaStep("Kursyer për objektivat", `${moneyLekShort(savedLek)} / ${moneyEuroCompact(savedLek / state.exchangeRate)}`),
        formulaStep("Vlera totale e objektivave", `${moneyLekShort(targetLek)} / ${moneyEuroCompact(targetLek / state.exchangeRate)}`),
        formulaStep("Shpenzimet", "Tri kategoritë kryesore", "Kur ka më shumë kategori, pjesa tjetër mblidhet te “Të tjera”."),
      ],
    };
  }

  return {
    eyebrow: "Formula kryesore",
    title: "Mund të shpenzosh",
    summary: "Kjo është shifra që të tregon sa mund të shpenzosh sot pa prekur objektivin e kursimit.",
    steps: [
      formulaStep("Të ardhura këtë muaj", moneyLekShort(budget.monthlyIncomeLek)),
      formulaStep("Minus objektivi i kursimit", `- ${moneyLekShort(budget.monthlyTargetLek)}`),
      formulaStep("Minus shpenzime fikse të mbetura", `- ${moneyLekShort(budget.fixedRemainingLek)}`),
      formulaStep("Minus shpenzimet e bëra", `- ${moneyLekShort(budget.spentMonthLek)}`),
      formulaStep(
        "Buxheti i mbetur",
        `${moneyLekShort(Math.max(budget.remainingLek, 0))} / ${moneyEuroCompact(Math.max(budget.remainingLek, 0) / state.exchangeRate)}`,
        "Kjo vlerë ndahet me ditët e mbetura.",
        "balance"
      ),
      formulaStep(
        "Mund të shpenzosh sot",
        `${moneyLekShort(budget.dailySafeLek)} / ${moneyEuroCompact(budget.dailySafeLek / state.exchangeRate)}`,
        `${budget.daysRemaining} ditë të mbetura.`,
        "positive"
      ),
    ],
  };
}

function formulaStep(label, value, detail = "", tone = "") {
  return { label, value, detail, tone };
}

function ratioText(value, total) {
  if (!(Number(total) > 0)) return "0%";
  return `${Math.round(clamp01(value / total) * 100)}%`;
}

function primaryZoneOverlay(zone = state.activeZone) {
  if (zone === "transactions") return els.transactionsOverlay;
  if (zone === "accounts") return els.netWorthOverlay;
  if (zone === "insights") return els.insightsOverlay;
  return null;
}

function nextPrimaryZone(zone = state.activeZone) {
  const currentIndex = PRIMARY_ZONE_ORDER.indexOf(zone);
  if (currentIndex < 0) return PRIMARY_ZONE_ORDER[0];
  return PRIMARY_ZONE_ORDER[(currentIndex + 1) % PRIMARY_ZONE_ORDER.length];
}

function handlePageSwipeStart(event) {
  if (pageSwipeSession.transitioning || event.touches.length !== 1) return;
  const overlay = primaryZoneOverlay();
  if (!overlay || overlay.hidden || !overlay.contains(event.target)) return;

  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("button, a, input, select, textarea, label, [role='button'], [contenteditable='true']")) return;

  const touch = event.touches[0];
  clearTimeout(pageSwipeSession.timer);
  pageSwipeSession.touchId = touch.identifier;
  pageSwipeSession.overlay = overlay;
  pageSwipeSession.startX = touch.clientX;
  pageSwipeSession.startY = touch.clientY;
  pageSwipeSession.deltaX = 0;
  pageSwipeSession.horizontal = false;
  pageSwipeSession.cancelled = false;
}

function handlePageSwipeMove(event) {
  if (pageSwipeSession.touchId === null || pageSwipeSession.cancelled || pageSwipeSession.transitioning) return;
  const touch = Array.from(event.touches).find((item) => item.identifier === pageSwipeSession.touchId);
  if (!touch) return;

  const deltaX = touch.clientX - pageSwipeSession.startX;
  const deltaY = touch.clientY - pageSwipeSession.startY;
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);

  if (!pageSwipeSession.horizontal) {
    if (verticalDistance > 10 && verticalDistance > horizontalDistance) {
      pageSwipeSession.cancelled = true;
      return;
    }
    if (horizontalDistance < 12 || horizontalDistance <= verticalDistance * 1.15) return;
    pageSwipeSession.horizontal = true;
    pageSwipeSession.overlay?.classList.add("is-page-swiping");
    document.body.classList.add("page-swipe-active");
  }

  event.preventDefault();
  pageSwipeSession.deltaX = deltaX;
  const width = Math.max(window.innerWidth, 1);
  const opacity = 1 - Math.min(horizontalDistance / width, 1) * 0.14;
  if (pageSwipeSession.overlay) {
    pageSwipeSession.overlay.style.transform = `translate3d(${deltaX}px, 0, 0)`;
    pageSwipeSession.overlay.style.opacity = String(opacity);
  }
}

function handlePageSwipeEnd(event) {
  if (pageSwipeSession.touchId === null) return;
  const endedTouch = Array.from(event.changedTouches).find((item) => item.identifier === pageSwipeSession.touchId);
  if (!endedTouch) return;

  if (pageSwipeSession.horizontal) {
    pageSwipeSession.deltaX = endedTouch.clientX - pageSwipeSession.startX;
  }

  const overlay = pageSwipeSession.overlay;
  const deltaX = pageSwipeSession.deltaX;
  const completed = pageSwipeSession.horizontal
    && Math.abs(deltaX) >= Math.min(96, Math.max(64, window.innerWidth * 0.18));

  if (!overlay || !pageSwipeSession.horizontal || pageSwipeSession.cancelled) {
    resetPageSwipeSession();
    return;
  }

  pageSwipeSession.transitioning = true;
  overlay.classList.remove("is-page-swiping");
  overlay.classList.add("is-page-settling");

  if (!completed) {
    overlay.style.transform = "translate3d(0, 0, 0)";
    overlay.style.opacity = "1";
    pageSwipeSession.timer = window.setTimeout(resetPageSwipeSession, 190);
    return;
  }

  const targetZone = deltaX < 0 ? "home" : nextPrimaryZone();
  overlay.style.transform = `translate3d(${deltaX < 0 ? "-105vw" : "105vw"}, 0, 0)`;
  overlay.style.opacity = "0.86";
  pageSwipeSession.timer = window.setTimeout(() => {
    resetPageSwipeSession();
    goToZone(targetZone);
  }, 190);
}

function cancelPageSwipe() {
  if (pageSwipeSession.touchId === null) return;
  const overlay = pageSwipeSession.overlay;
  if (overlay && pageSwipeSession.horizontal) {
    overlay.classList.remove("is-page-swiping");
    overlay.classList.add("is-page-settling");
    overlay.style.transform = "translate3d(0, 0, 0)";
    overlay.style.opacity = "1";
    pageSwipeSession.transitioning = true;
    pageSwipeSession.timer = window.setTimeout(resetPageSwipeSession, 190);
    return;
  }
  resetPageSwipeSession();
}

function resetPageSwipeSession() {
  clearTimeout(pageSwipeSession.timer);
  if (pageSwipeSession.overlay) {
    pageSwipeSession.overlay.classList.remove("is-page-swiping", "is-page-settling");
    pageSwipeSession.overlay.style.removeProperty("transform");
    pageSwipeSession.overlay.style.removeProperty("opacity");
  }
  document.body.classList.remove("page-swipe-active");
  pageSwipeSession = {
    touchId: null,
    overlay: null,
    startX: 0,
    startY: 0,
    deltaX: 0,
    horizontal: false,
    cancelled: false,
    transitioning: false,
    timer: 0,
  };
}

function goToZone(zone = "home") {
  state.activeZone = zone;
  if (zone === "transactions") {
    openTransactionsWindow();
    return;
  }
  if (zone === "accounts") {
    openNetWorthWindow();
    return;
  }
  if (zone === "insights") {
    openInsightsWindow();
    return;
  }

  closeTransactionsWindow();
  closeNetWorthWindow();
  closeInsightsWindow();
  state.activeZone = "home";
  syncZoneNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindActivation(element, handler) {
  if (!element || typeof handler !== "function") return;
  element.addEventListener("click", handler);
  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handler();
  });
}

function syncZoneNav() {
  document.body.classList.toggle("secondary-zone-open", state.activeZone !== "home");
  document.querySelectorAll("[data-zone]").forEach((button) => {
    button.classList.toggle("active", button.dataset.zone === state.activeZone);
  });
}

function openTransactionsWindow() {
  state.activeZone = "transactions";
  if (els.netWorthOverlay) els.netWorthOverlay.hidden = true;
  if (els.insightsOverlay) els.insightsOverlay.hidden = true;
  state.transactionSearch = "";
  if (els.transactionsSearch) els.transactionsSearch.value = "";
  renderTransactions();
  if (els.transactionsOverlay) {
    els.transactionsOverlay.hidden = false;
    els.transactionsOverlay.scrollTop = 0;
  }
  syncZoneNav();
}

function closeTransactionsWindow() {
  if (els.transactionsOverlay) els.transactionsOverlay.hidden = true;
  if (state.activeZone === "transactions") state.activeZone = "home";
  syncZoneNav();
}

function openNetWorthWindow() {
  state.activeZone = "accounts";
  if (els.transactionsOverlay) els.transactionsOverlay.hidden = true;
  if (els.insightsOverlay) els.insightsOverlay.hidden = true;
  renderNetWorth();
  if (els.netWorthOverlay) {
    els.netWorthOverlay.hidden = false;
    els.netWorthOverlay.scrollTop = 0;
  }
  syncZoneNav();
}

function closeNetWorthWindow() {
  if (els.netWorthOverlay) els.netWorthOverlay.hidden = true;
  if (state.activeZone === "accounts") state.activeZone = "home";
  syncZoneNav();
}

function openInsightsWindow() {
  state.activeZone = "insights";
  if (els.transactionsOverlay) els.transactionsOverlay.hidden = true;
  if (els.netWorthOverlay) els.netWorthOverlay.hidden = true;
  renderInsights();
  if (els.insightsOverlay) {
    els.insightsOverlay.hidden = false;
    els.insightsOverlay.scrollTop = 0;
  }
  syncZoneNav();
}

function closeInsightsWindow() {
  if (els.insightsOverlay) els.insightsOverlay.hidden = true;
  if (state.activeZone === "insights") state.activeZone = "home";
  syncZoneNav();
}

function renderTransactions() {
  if (!els.transactionsList) return;

  renderTransactionFilterOptions();
  const entries = filteredTransactions();
  const totals = signedTransactionTotals(entries);
  setText(els.transactionsTotalLek, moneyLekShort(totals.ALL));
  setText(els.transactionsTotalEuro, moneyEuroCompact(totals.EUR));
  setText(els.transactionsCount, String(entries.length));
  setText(els.transactionsRange, transactionFilterLabel(state.transactionFilter));
  if (els.transactionsSearch && els.transactionsSearch.value !== state.transactionSearch) {
    els.transactionsSearch.value = state.transactionSearch;
  }
  if (els.transactionsTypeFilter && els.transactionsTypeFilter.value !== state.transactionFilter) {
    els.transactionsTypeFilter.value = state.transactionFilter;
  }
  if (els.transactionsMonthFilter) els.transactionsMonthFilter.value = state.transactionMonthFilter;
  if (els.transactionsCategoryFilter) els.transactionsCategoryFilter.value = state.transactionCategoryFilter;
  if (els.transactionsBankFilter) els.transactionsBankFilter.value = state.transactionBankFilter;
  if (els.transactionsCurrencyFilter) els.transactionsCurrencyFilter.value = state.transactionCurrencyFilter;

  els.transactionsList.innerHTML = "";
  if (!entries.length) {
    els.transactionsList.innerHTML = `<div class="empty-line">Nuk ka zëra për këtë filtër.</div>`;
    return;
  }

  let lastMonth = "";
  entries.forEach((entry) => {
    const entryMonth = entry.date.slice(0, 7);
    if (entryMonth !== lastMonth) {
      lastMonth = entryMonth;
      const title = document.createElement("h3");
      title.className = "transactions-month-title";
      title.textContent = monthLabel(entryMonth);
      els.transactionsList.append(title);
    }
    els.transactionsList.append(createEntryRow(entry, "preview"));
  });
}

function filteredTransactions() {
  const filter = state.transactionFilter || "all";
  const query = normalizeSearchText(state.transactionSearch || "");
  return state.entries
    .filter((entry) => filter === "all" || entry.type === filter)
    .filter((entry) => state.transactionMonthFilter === "all" || entry.date.startsWith(state.transactionMonthFilter))
    .filter((entry) => state.transactionCategoryFilter === "all" || entry.category === state.transactionCategoryFilter)
    .filter((entry) => state.transactionBankFilter === "all" || entry.bankId === state.transactionBankFilter)
    .filter((entry) => state.transactionCurrencyFilter === "all" || normalizeCurrency(entry.currency) === state.transactionCurrencyFilter)
    .filter((entry) => entryMatchesSearch(entry, query))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
}

function renderTransactionFilterOptions() {
  const monthOptions = [...new Set(state.entries.map((entry) => entry.date.slice(0, 7)).filter(Boolean))].sort().reverse();
  const categoryOptions = [...new Set(state.entries.map((entry) => entry.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "sq"));
  const bankOptions = state.banks.slice().sort((a, b) => a.name.localeCompare(b.name, "sq"));

  if (state.transactionMonthFilter !== "all" && !monthOptions.includes(state.transactionMonthFilter)) state.transactionMonthFilter = "all";
  if (state.transactionCategoryFilter !== "all" && !categoryOptions.includes(state.transactionCategoryFilter)) state.transactionCategoryFilter = "all";
  if (state.transactionBankFilter !== "all" && !bankOptions.some((bank) => bank.id === state.transactionBankFilter)) state.transactionBankFilter = "all";

  replaceSelectOptions(els.transactionsMonthFilter, [{ value: "all", label: "Çdo muaj" }, ...monthOptions.map((value) => ({ value, label: monthLabel(value) }))], state.transactionMonthFilter);
  replaceSelectOptions(els.transactionsCategoryFilter, [{ value: "all", label: "Çdo kategori" }, ...categoryOptions.map((value) => ({ value, label: value }))], state.transactionCategoryFilter);
  replaceSelectOptions(els.transactionsBankFilter, [{ value: "all", label: "Çdo llogari" }, ...bankOptions.map((bank) => ({ value: bank.id, label: bank.name }))], state.transactionBankFilter);
}

function replaceSelectOptions(select, options, selectedValue) {
  if (!select) return;
  select.innerHTML = options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("");
  select.value = options.some((option) => option.value === selectedValue) ? selectedValue : "all";
}

function resetTransactionFilters(shouldRender = true) {
  state.transactionSearch = "";
  state.transactionFilter = "all";
  state.transactionMonthFilter = "all";
  state.transactionCategoryFilter = "all";
  state.transactionBankFilter = "all";
  state.transactionCurrencyFilter = "all";
  if (shouldRender) renderTransactions();
}

function signedTransactionTotals(entries) {
  return entries.reduce((totals, entry) => {
    const currency = normalizeCurrency(entry.currency);
    const amount = Number(entry.amount) || 0;
    totals[currency] += entry.type === "income" ? amount : -amount;
    return totals;
  }, emptyMoneyTotals());
}

function transactionFilterLabel(filter) {
  const parts = [];
  if (filter === "income") parts.push("të ardhura");
  if (filter === "expense") parts.push("shpenzime");
  if (state.transactionMonthFilter !== "all") parts.push(monthLabel(state.transactionMonthFilter));
  if (state.transactionCurrencyFilter !== "all") parts.push(state.transactionCurrencyFilter === "EUR" ? "Euro" : "Lekë");
  return parts.length ? parts.join(" · ") : "të gjitha";
}

function renderNetWorth() {
  if (!els.netWorthList) return;

  const totals = bankTotals();
  const totalLek = totalsToLek(totals);
  setText(els.netWorthTotalEuro, moneyEuroCompact(totalLek / state.exchangeRate));
  setText(els.netWorthTotalLek, moneyLekShort(totalLek));
  setText(els.netWorthStatus, `Gjendje reale në ${state.banks.length} llogari. Kursi: 1€ = ${formatRateInput(state.exchangeRate)} L.`);
  renderNetWorthTrend();
  renderAccounts();
}

function renderNetWorthTrend() {
  if (!els.netWorthTrend) return;

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonthIndex = now.getMonth();
  const latestByMonth = new Map();
  normalizeNetWorthHistory(state.netWorthHistory, state.exchangeRate)
    .filter((item) => String(item.date || "").startsWith(currentYear))
    .forEach((item) => latestByMonth.set(String(item.date).slice(5, 7), item));
  const monthlyPoints = Array.from({ length: 12 }, (_, index) => {
    const item = latestByMonth.get(String(index + 1).padStart(2, "0"));
    return {
      value: Number(item?.totalLek) || 0,
      hasValue: Boolean(item),
    };
  });
  const max = Math.max(...monthlyPoints.map(({ value }) => Math.abs(value)), 1);
  const bars = monthlyPoints
    .map(({ value, hasValue }, index) => {
      const isFuture = index > currentMonthIndex;
      const height = !hasValue || isFuture ? 6 : scaledMonthlyBarHeight(Math.abs(value), max);
      const message = `${capitalizeFirst(monthNames[index])}: ${moneyLekShort(value)} / ${moneyEuroCompact(value / state.exchangeRate)}`;
      const classes = [
        "home-month-bar",
        "net-worth-bar",
        hasValue ? "has-value" : "is-empty",
        value < 0 ? "is-negative" : "",
        index === currentMonthIndex ? "is-current" : "",
        isFuture ? "is-future" : "",
      ].filter(Boolean).join(" ");
      return `<button class="${classes}" type="button" style="height:${height}%" title="${escapeHtml(message)}" aria-label="${escapeHtml(message)}" data-chart-message="${escapeHtml(message)}"></button>`;
    })
    .join("");
  const axis = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"]
    .map((label) => `<span>${label}</span>`)
    .join("");
  els.netWorthTrend.innerHTML = `<div class="net-worth-plot">${bars}</div><div class="net-worth-axis">${axis}</div>`;
}

function netWorthSnapshot(now = new Date(), totals = bankTotals(), manual = false) {
  const totalLek = totalsToLek(totals);
  return {
    date: toLocalIso(now),
    totalLek,
    totalEuro: state.exchangeRate > 0 ? totalLek / state.exchangeRate : 0,
    accountsLek: Number(totals.ALL) || 0,
    accountsEuro: Number(totals.EUR) || 0,
    manual: Boolean(manual),
    updatedAt: new Date().toISOString(),
  };
}

function recordNetWorthSnapshot(now = new Date(), totals = bankTotals()) {
  if (!state.banks.length) return;
  state.netWorthHistory = mergeNetWorthHistory(state.netWorthHistory, [netWorthSnapshot(now, totals, false)], state.exchangeRate);
  saveNetWorthHistory();
}

function saveNetWorthSnapshot(now = new Date(), manual = true) {
  const snapshot = snapshotFinanceState();
  state.netWorthHistory = mergeNetWorthHistory(state.netWorthHistory, [netWorthSnapshot(now, bankTotals(), manual)], state.exchangeRate);
  saveNetWorthHistory();
  renderNetWorth();
  showUndoToast("Pika e pasurisë u ruajt.", () => restoreFinanceSnapshot(snapshot));
}

function renderInsights() {
  if (!els.insightsList) return;

  const now = new Date();
  const currentMonth = monthKey(now);
  const today = toLocalIso(now);
  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(currentMonth));
  const spentToday = monthEntries.filter((entry) => entry.type === "expense" && entry.date === today).reduce(sumMoneyTotals, emptyMoneyTotals());
  const spentMonth = monthEntries.filter((entry) => entry.type === "expense").reduce(sumMoneyTotals, emptyMoneyTotals());
  const incomeMonth = monthEntries.filter((entry) => entry.type === "income").reduce(sumMoneyTotals, emptyMoneyTotals());
  const budget = monthlyBudgetInsight(now, spentToday, spentMonth, incomeMonth);
  setText(els.insightsSafeLek, moneyLekShort(budget.dailySafeLek));
  setText(els.insightsSafeEuro, `≈ ${moneyEuroCompact(budget.dailySafeLek / state.exchangeRate)} / ditë`);
  setText(els.insightsRemainingLek, moneyLekShort(Math.max(budget.remainingLek, 0)));
  setText(els.insightsDaysRemaining, `${budget.daysRemaining} ditë`);
  if (els.insightsSafeProgress) els.insightsSafeProgress.style.width = `${Math.round(budget.remainingRatio * 100)}%`;

  const topCategory = topExpenseCategory(monthEntries);
  const topCategoryShare = topCategory && budget.spentMonthLek > 0
    ? Math.round(clamp01(topCategory.lekValue / budget.spentMonthLek) * 100)
    : 0;
  const forecastAvailable = budget.monthlyBudgetLek > 0;
  const forecastValue = forecastAvailable
    ? `${budget.forecastDeltaLek >= 0 ? "+" : "-"}${moneyLekShort(Math.abs(budget.forecastDeltaLek))}`
    : "—";
  const forecastProgress = forecastAvailable
    ? Math.round(clamp01(budget.projectedSpendLek / Math.max(budget.monthlyBudgetLek - budget.fixedRemainingLek, 1)) * 100)
    : 0;
  const remainingRecurringCount = recurringRemainingExpenses(now).length;
  const cards = [
    {
      title: "Parashikimi",
      value: forecastValue,
      detail: forecastAvailable
        ? budget.forecastDeltaLek >= 0
          ? "nën buxhet në fund të muajit"
          : "mbi buxhet në fund të muajit"
        : "Shto të ardhura për ta aktivizuar",
      action: "forecast",
      progress: forecastProgress,
      tone: forecastAvailable ? (budget.forecastDeltaLek >= 0 ? "positive" : "negative") : "neutral",
    },
    {
      title: "Shpenzime fikse",
      value: moneyLekShort(budget.fixedRemainingLek),
      detail: remainingRecurringCount > 0
        ? `${remainingRecurringCount} ${remainingRecurringCount === 1 ? "detyrim i pambyllur" : "detyrime të pambyllura"}`
        : "Asnjë detyrim i pambyllur",
      action: "recurring",
      tone: budget.fixedRemainingLek > 0 ? "warning" : "neutral",
    },
    {
      title: "Kategoria kryesore",
      value: topCategory ? topCategory.category : "Pa të dhëna",
      detail: topCategory
        ? `${moneyPairCompact(topCategory.totals)} · ${topCategoryShare}% e shpenzimeve`
        : "Shto shpenzime që të shfaqet analiza",
      action: "expenses",
      progress: topCategoryShare,
      tone: "category",
      wide: true,
    },
  ];

  els.insightsList.innerHTML = cards
    .map((item) => {
      const progress = Number.isFinite(item.progress)
        ? `<div class="insight-card-progress" aria-hidden="true"><i style="width:${Math.max(0, Math.min(item.progress, 100))}%"></i></div>`
        : "";
      return `
        <button class="insight-card is-actionable is-${item.tone}${item.wide ? " is-wide" : ""}" type="button" data-insight-action="${item.action}">
          <span class="insight-card-label">${escapeHtml(item.title)}</span>
          <strong class="insight-card-value">${escapeHtml(item.value)}</strong>
          <small class="insight-card-detail">${escapeHtml(item.detail)}</small>
          ${progress}
          <i class="insight-card-arrow" aria-hidden="true">›</i>
        </button>
      `;
    })
    .join("");
}

function handleInsightAction(event) {
  const button = event.target.closest("[data-insight-action]");
  if (!button) return;
  const action = button.dataset.insightAction;
  if (action === "safe" || action === "forecast") {
    openFormulaOverlay(action);
    return;
  }
  if (action === "recurring") {
    openRecurringWindow();
    return;
  }
  if (action === "expenses") openExpenseArchive();
}

function topExpenseCategory(monthEntries) {
  const byCategory = monthEntries
    .filter((entry) => entry.type === "expense")
    .reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = emptyMoneyTotals();
      addEntryAmount(acc[entry.category], entry);
      return acc;
    }, {});

  return Object.entries(byCategory)
    .map(([category, totals]) => ({ category, totals, lekValue: totalsToLek(totals) }))
    .sort((a, b) => b.lekValue - a.lekValue)[0];
}

function endOfMonthLabel(date) {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${String(end.getDate()).padStart(2, "0")} ${capitalizeFirst(monthNames[end.getMonth()])}`;
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
  const baseWidth = Math.max(monthWidth - todayWidth, 0);
  const todayLeft = todayWidth > 0 ? baseWidth : monthWidth;
  track.classList.toggle("is-joined", baseWidth > 0 && todayWidth > 0);
  track.style.setProperty("--month-width", `${baseWidth}%`);
  track.style.setProperty("--today-width", `${todayWidth}%`);
  track.style.setProperty("--today-left", `${todayLeft}%`);
  track.style.setProperty("--today-min-width", todayWidth > 0 ? "52px" : "0px");
}

function renderHomeYearCard({ type, monthTotals, averageTotals, monthlyTotals, limitALL, limitEUR }) {
  const prefix = type === "income" ? "Income" : "Savings";
  const accent = type === "income" ? "green" : "purple";
  const chart = els[type === "income" ? "incomeYearDots" : "savingsYearDots"];

  if (type === "savings") {
    setText(els[`home${prefix}MonthLek`], moneyLekShort(monthTotals.ALL));
    setText(els[`home${prefix}MonthEuro`], moneyEuroCompact(monthTotals.ALL / state.exchangeRate));
    setText(els[`home${prefix}YearLek`], moneyLekShort(averageTotals.ALL));
    setText(els[`home${prefix}YearEuro`], moneyEuroCompact(averageTotals.ALL / state.exchangeRate));
  } else {
    setText(els[`home${prefix}MonthLek`], moneyLekShort(monthTotals.ALL));
    setText(els[`home${prefix}MonthEuro`], moneyEuroCompact(monthTotals.EUR));
    setText(els[`home${prefix}YearLek`], moneyLekShort(averageTotals.ALL));
    setText(els[`home${prefix}YearEuro`], moneyEuroCompact(averageTotals.EUR));
  }
  if (type === "savings") {
    renderSavingsBalanceChart(chart, monthlyTotals, limitALL, limitEUR);
  } else {
    renderMonthlyDotChart(chart, monthlyTotals, limitALL, limitEUR, accent);
  }
}

function renderMonthlyDotChart(container, monthlyTotals, limitALL, limitEUR, accent) {
  if (!container) return;
  const currentMonthIndex = new Date().getMonth();
  const values = monthlyTotals.map(totalsToLek);
  const max = Math.max(...values.map((v) => Math.max(v, 0)), 1);
  container.innerHTML = "";
  container.className = `monthly-dot-chart monthly-bar-chart ${accent}-chart`;
  values.forEach((value, index) => {
    const bar = document.createElement("button");
    bar.type = "button";
    bar.className = `home-month-bar ${index === currentMonthIndex ? "is-current" : ""} ${index > currentMonthIndex ? "is-future" : ""}`;
    bar.style.height = `${index > currentMonthIndex ? 6 : scaledMonthlyBarHeight(value, max)}%`;
    bar.title = `${capitalizeFirst(monthNames[index])}: ${moneyPairCompact(monthlyTotals[index])}`;
    bar.dataset.chartMessage = bar.title;
    bar.setAttribute("aria-label", bar.title);
    container.append(bar);
  });
}

function renderSavingsBalanceChart(container, monthlyTotals, limitALL, limitEUR) {
  if (!container) return;
  const currentMonthIndex = new Date().getMonth();
  const values = monthlyTotals.map(totalsToLek);
  const max = Math.max(...values.map((v) => Math.abs(v)), 1);
  container.innerHTML = "";
  container.className = "monthly-dot-chart monthly-bar-chart savings-bar-chart";
  values.forEach((value, index) => {
    const bar = document.createElement("button");
    bar.type = "button";
    bar.className = `home-month-bar ${value < 0 ? "is-negative" : ""} ${index === currentMonthIndex ? "is-current" : ""} ${index > currentMonthIndex ? "is-future" : ""}`;
    bar.style.height = `${index > currentMonthIndex ? 6 : scaledMonthlyBarHeight(Math.abs(value), max)}%`;
    bar.title = `${capitalizeFirst(monthNames[index])}: ${moneyLekShort(value)} / ${moneyEuroCompact(value / state.exchangeRate)}`;
    bar.dataset.chartMessage = bar.title;
    bar.setAttribute("aria-label", bar.title);
    container.append(bar);
  });
}

function scaledMonthlyBarHeight(value, maxValue) {
  const amount = Math.max(Number(value) || 0, 0);
  const maximum = Math.max(Number(maxValue) || 0, 0);
  if (!amount || !maximum) return 6;
  return Math.max(8, Math.min(100, amount / maximum * 100));
}

function handleHomeMonthChartClick(event) {
  const bar = event.target.closest("[data-chart-message]");
  if (!bar) return;
  showInfoToast(bar.dataset.chartMessage);
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

function monthlySavingsTotals(year, now = new Date()) {
  return Array.from({ length: 12 }, (_, index) => savingsPerformanceForMonth(year, index, now).totals);
}

function savingsPerformanceForMonth(year, monthIndex, now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentDay = toLocalIso(now);
  const isFutureMonth = year > currentYear || (year === currentYear && monthIndex > currentMonthIndex);
  if (isFutureMonth) return { totals: emptyMoneyTotals(), hasValue: false };

  const key = monthKey(new Date(year, monthIndex, 1));
  const isCurrentMonth = year === currentYear && monthIndex === currentMonthIndex;
  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(key) && (!isCurrentMonth || entry.date <= currentDay));
  const incomeTotals = monthEntries.filter((entry) => entry.type === "income").reduce(sumMoneyTotals, emptyMoneyTotals());
  const spentTotals = monthEntries.filter((entry) => entry.type === "expense").reduce(sumMoneyTotals, emptyMoneyTotals());
  const valueLek = totalsToLek(incomeTotals) - totalsToLek(spentTotals);

  return {
    totals: { ALL: valueLek, EUR: 0 },
    hasValue: monthEntries.length > 0 || isCurrentMonth,
  };
}

function savingsGoalPlan(date, incomeTotals, goal = null) {
  const monthDays = daysInMonth(date);
  const monthlyTargetLek = savingsGoalMonthlyTargetLek(goal);
  const incomeLek = Math.max(totalsToLek(incomeTotals), 0);
  const monthlySpendBudgetLek = Math.max(incomeLek - monthlyTargetLek, 0);
  const dailySpendBudgetLek = monthlySpendBudgetLek / Math.max(monthDays, 1);

  return {
    monthlyTargetLek,
    monthlySpendBudgetLek,
    dailySpendBudgetLek,
    monthDays,
  };
}

function savingsGoalMonthlyTargetLek(goal = null) {
  if (goal) return singleSavingsGoalMonthlyTargetLek(goal);
  if (Array.isArray(state.goals)) return goalsMonthlyTargetLek();
  return singleSavingsGoalMonthlyTargetLek(state.savingsGoal);
}

function singleSavingsGoalMonthlyTargetLek(goal = state.savingsGoal) {
  const amount = Math.max(Number(goal?.amount) || 0, 0);
  const months = Math.max(Number(goal?.months) || 1, 1);
  const monthlyAmount = amount / months;
  return normalizeCurrency(goal?.currency) === "EUR" ? monthlyAmount * state.exchangeRate : monthlyAmount;
}

function goalsMonthlyTargetLek(goals = state.goals) {
  return normalizeGoals(goals)
    .filter((goal) => goal.active !== false)
    .reduce((sum, goal) => sum + singleSavingsGoalMonthlyTargetLek(goal), 0);
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

function snapshotFinanceState() {
  return {
    entries: state.entries.map((entry) => ({ ...entry })),
    banks: state.banks.map((bank) => ({ ...bank })),
    recurringExpenses: state.recurringExpenses.map((item) => ({ ...item })),
    netWorthHistory: state.netWorthHistory.map((item) => ({ ...item })),
    goals: state.goals.map((goal) => ({ ...goal })),
    categories: normalizeCategoriesData(state.categories),
    limits: { ...state.limits },
    savingsGoal: { ...state.savingsGoal },
    exchangeRate: state.exchangeRate,
    setupComplete: state.setupComplete,
    homeOrder: currentHomeOrder(),
  };
}

function restoreFinanceSnapshot(snapshot) {
  if (!snapshot) return;

  state.entries = Array.isArray(snapshot.entries) ? snapshot.entries.map((entry) => ({ ...entry })) : [];
  state.banks = Array.isArray(snapshot.banks) ? snapshot.banks.map((bank) => ({ ...bank })) : state.banks;
  state.recurringExpenses = normalizeRecurringExpenses(snapshot.recurringExpenses || []);
  state.exchangeRate = Number(snapshot.exchangeRate) > 0 ? Number(snapshot.exchangeRate) : state.exchangeRate;
  if (Array.isArray(snapshot.netWorthHistory)) state.netWorthHistory = normalizeNetWorthHistory(snapshot.netWorthHistory, state.exchangeRate);
  state.goals = normalizeGoals(snapshot.goals || state.goals);
  state.categories = normalizeCategoriesData(snapshot.categories || state.categories);
  state.limits = snapshot.limits ? { ...snapshot.limits } : state.limits;
  state.savingsGoal = snapshot.savingsGoal ? { ...snapshot.savingsGoal } : state.savingsGoal;
  if (typeof snapshot.setupComplete === "boolean") state.setupComplete = snapshot.setupComplete;
  if (Array.isArray(snapshot.homeOrder)) state.homeOrder = normalizeHomeOrder(snapshot.homeOrder);
  syncPrimarySavingsGoal();

  ensureDefaultBanks();
  saveEntries();
  saveBanks();
  saveRecurringExpenses();
  saveNetWorthHistory();
  saveGoals();
  saveCategories();
  saveLimits();
  saveSavingsGoal();
  saveExchangeRate(state.exchangeRate);
  saveSetupComplete();
  applyHomeOrder(state.homeOrder);
  saveHomeOrder(state.homeOrder);
  if (els.eurToLekRateInput) els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
  syncTypeControls();
  render();
}

function showUndoToast(message, undoHandler) {
  if (!els.undoToast || !els.undoToastMessage) return;

  clearTimeout(state.undo.timer);
  state.undo.action = undoHandler;
  if (els.undoToastBtn) els.undoToastBtn.hidden = typeof undoHandler !== "function";
  els.undoToastMessage.textContent = message;
  els.undoToast.hidden = false;
  requestAnimationFrame(() => els.undoToast.classList.add("is-visible"));
  state.undo.timer = window.setTimeout(hideUndoToast, 7000);
}

function showInfoToast(message) {
  showUndoToast(message, null);
}

function hideUndoToast() {
  clearTimeout(state.undo.timer);
  state.undo.timer = 0;
  state.undo.action = null;
  if (!els.undoToast) return;

  els.undoToast.classList.remove("is-visible");
  window.setTimeout(() => {
    if (!els.undoToast.classList.contains("is-visible")) els.undoToast.hidden = true;
  }, 180);
}

function undoLastAction() {
  const action = state.undo.action;
  hideUndoToast();
  if (typeof action === "function") action();
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
  if (!els.savingsPlanList) return;

  syncHomePlanTabs();
  if (state.homePlanTab === "expenses") {
    renderExpensePlan(monthEntries);
    return;
  }

  const now = new Date();
  const today = toLocalIso(now);
  const spentToday = monthEntries
    .filter((entry) => entry.type === "expense" && entry.date === today)
    .reduce(sumMoneyTotals, emptyMoneyTotals());
  const spentMonth = monthEntries
    .filter((entry) => entry.type === "expense" && entry.date <= today)
    .reduce(sumMoneyTotals, emptyMoneyTotals());
  const incomeMonth = monthEntries
    .filter((entry) => entry.type === "income" && entry.date <= today)
    .reduce(sumMoneyTotals, emptyMoneyTotals());
  const goals = normalizeGoals(state.goals).filter((goal) => goal.active !== false).slice(0, 2);
  const totalTargetLek = Math.max(goals.reduce((sum, goal) => {
    const amount = Math.max(Number(goal.amount) || 0, 0);
    return sum + (normalizeCurrency(goal.currency) === "EUR" ? amount * state.exchangeRate : amount);
  }, 0), 1);
  const totalSavedLek = goals.reduce((sum, goal) => sum + goalSavedLek(goal, now), 0);
  const mainGoal = state.savingsGoal || goals[0] || { amount: 0, currency: "EUR", months: 12 };
  const items = [
    {
      label: `Objektivi ${goalAmountLabel(mainGoal)} për ${goalDurationLabel(mainGoal.months)}`,
      value: moneyEuroCompact(totalSavedLek / state.exchangeRate),
      progress: Math.min((totalSavedLek / totalTargetLek) * 100, 100),
    },
    ...goals.map((goal) => {
      return {
        label: goal.name,
        value: goalSavedAmountLabel(goal, now),
        progress: Math.min((goalSavedAmount(goal, now) / Math.max(Number(goal.amount), 1)) * 100, 100),
      };
    }),
  ].slice(0, 3);

  renderHomePlanRings(items, "Progresi i objektivave");
}

function renderHomePlanRings(items, ariaLabel) {
  if (!els.savingsPlanList) return;

  const ringStyles = [
    { tone: "blue", radius: 61 },
    { tone: "lime", radius: 87 },
    { tone: "pink", radius: 35 },
  ];
  const normalizedItems = items.slice(0, 3).map((item, index) => ({
    ...item,
    ...ringStyles[index],
    progress: Math.min(Math.max(Number(item.progress) || 0, 0), 100),
  }));

  els.savingsPlanList.classList.add("is-ring-chart");
  els.savingsPlanList.classList.remove("is-expenses");
  els.savingsPlanList.setAttribute("aria-label", ariaLabel);
  els.savingsPlanList.innerHTML = `
    <div class="plan-ring-layout">
      <svg class="plan-ring-chart" viewBox="0 0 210 210" role="img" aria-label="${escapeHtml(ariaLabel)}">
        ${normalizedItems
          .map(
            (item) => `
              <circle class="plan-ring-track" cx="105" cy="105" r="${item.radius}" pathLength="100"></circle>
              <circle class="plan-ring-value ring-tone-${item.tone}" cx="105" cy="105" r="${item.radius}" pathLength="100" stroke-dasharray="${item.progress} ${100 - item.progress}"></circle>
            `
          )
          .join("")}
      </svg>
      <div class="plan-ring-legend">
        ${normalizedItems
          .map(
            (item) => `
              <button class="plan-ring-legend-item" type="button" data-plan-message="${escapeHtml(`${item.label}: ${item.value} · ${Math.round(item.progress)}%`)}">
                <span class="plan-ring-dot ring-tone-${item.tone}" aria-hidden="true"></span>
                <div class="plan-copy"><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(item.value)}</strong></div>
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function handlePlanLegendClick(event) {
  const item = event.target.closest("[data-plan-message]");
  if (!item) return;
  showInfoToast(item.dataset.planMessage);
}

function selectHomePlanTab(tab) {
  state.homePlanTab = tab === "expenses" ? "expenses" : "savings";
  const currentMonth = monthKey(new Date());
  renderActivityRing(state.entries.filter((entry) => entry.date.startsWith(currentMonth)));
}

function syncHomePlanTabs() {
  const isExpenses = state.homePlanTab === "expenses";
  [
    [els.planExpensesTab, isExpenses],
    [els.planSavingsTab, !isExpenses],
  ].forEach(([button, active]) => {
    if (!button) return;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  if (els.savingsPlanOpen) {
    els.savingsPlanOpen.setAttribute("aria-label", isExpenses ? "Hap shpenzimet" : "Hap objektivat");
  }
}

function openSavingsPlanDetail() {
  if (state.homePlanTab === "expenses") openExpenseArchive();
  else openGoalsWindow();
}

function renderExpensePlan(monthEntries) {
  const today = toLocalIso(new Date());
  const totalsByCategory = new Map();

  monthEntries
    .filter((entry) => entry.type === "expense" && entry.date <= today)
    .forEach((entry) => {
      const category = normalizeCategoryName(entry.category) || "Tjetër";
      const totals = totalsByCategory.get(category) || emptyMoneyTotals();
      addEntryAmount(totals, entry);
      totalsByCategory.set(category, totals);
    });

  const sortedItems = Array.from(totalsByCategory, ([label, totals]) => ({
    label,
    totals,
    valueLek: totalsToLek(totals),
  }))
    .sort((a, b) => b.valueLek - a.valueLek);
  const items = sortedItems.length <= 3
    ? sortedItems
    : [
        ...sortedItems.slice(0, 2),
        {
          label: "Të tjera",
          totals: sortedItems.slice(2).reduce((sum, item) => {
            sum.ALL += item.totals.ALL;
            sum.EUR += item.totals.EUR;
            return sum;
          }, emptyMoneyTotals()),
          valueLek: sortedItems.slice(2).reduce((sum, item) => sum + item.valueLek, 0),
        },
      ];
  const totalValue = Math.max(items.reduce((sum, item) => sum + item.valueLek, 0), 1);

  const ringItems = items.length
    ? items.map((item) => ({
        label: item.label,
        value: moneyPairCompact(item.totals),
        progress: (item.valueLek / totalValue) * 100,
      }))
    : [{
        label: `Nuk ka shpenzime në ${monthLabel(monthKey(new Date()))}`,
        value: "0 L / 0€",
        progress: 0,
      }];

  renderHomePlanRings(ringItems, "Shpenzimet kryesore sipas kategorive");
  els.savingsPlanList.classList.add("is-expenses");
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
  const lists = [els.accountList, els.accountListModal, els.netWorthList].filter(Boolean);
  lists.forEach((list) => {
    list.innerHTML = "";
  });

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
        <button type="button" data-delete-bank="${bank.id}">Fshi</button>
      </div>
    `;
    lists.forEach((list) => {
      const row = document.createElement("article");
      row.className = "account-row";
      row.innerHTML = markup;
      row.querySelector(".account-main strong").textContent = bank.name;
      list.append(row);
    });
  });
}

function renderRecurringWindow() {
  if (!els.recurringList) return;

  const now = new Date();
  const accountTotals = bankTotals();
  const obligations = recurringTotals(recurringRemainingExpenses(now));
  const available = subtractMoneyTotals(accountTotals, obligations);

  setText(els.recurringRealLek, moneyLekShort(accountTotals.ALL));
  setText(els.recurringRealEuro, moneyEuroCompact(accountTotals.EUR));
  setText(els.recurringObligationsLek, obligations.ALL > 0 ? `-${moneyLekShort(obligations.ALL)}` : moneyLekShort(0));
  setText(els.recurringObligationsEuro, obligations.EUR > 0 ? `-${moneyEuroCompact(obligations.EUR)}` : moneyEuroCompact(0));
  setText(els.recurringAvailableLek, moneyLekShort(available.ALL));
  setText(els.recurringAvailableEuro, moneyEuroCompact(available.EUR));

  els.recurringList.innerHTML = "";
  const items = recurringExpensesForMonth(now, { includeInactive: true });
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "recurring-empty";
    empty.textContent = "Shto shpenzimet që përsëriten çdo muaj që buxheti t'i rezervojë përpara.";
    els.recurringList.append(empty);
    return;
  }

  items.forEach((item) => {
    const status = item.active === false ? "jo aktive" : hasRecurringBeenRecordedThisMonth(item, now) ? "paguar" : "në buxhet";
    const row = document.createElement("article");
    row.className = `recurring-row${item.active === false ? " is-muted" : ""}`;
    row.innerHTML = `
      <div class="recurring-main">
        <strong></strong>
        <span>${escapeHtml(item.category)} · ${recurringDayLabel(item.dueDay)} · ${status}</span>
      </div>
      <div class="recurring-amount">${recurringAmountLabel(item)}</div>
      <div class="recurring-actions">
        <button type="button" data-edit-recurring="${item.id}">Edit</button>
      </div>
    `;
    row.querySelector(".recurring-main strong").textContent = item.name;
    els.recurringList.append(row);
  });
}

function openRecurringWindow() {
  renderRecurringWindow();
  els.recurringOverlay.hidden = false;
}

function closeRecurringWindow() {
  els.recurringOverlay.hidden = true;
}

function handleRecurringListClick(event) {
  const editButton = event.target.closest("[data-edit-recurring]");
  if (editButton) openRecurringEditor(editButton.dataset.editRecurring);
}

function openRecurringEditor(id = "") {
  const item = state.recurringExpenses.find((row) => row.id === id);
  state.editingRecurringId = item?.id || "";

  els.recurringForm.reset();
  els.recurringEditorTitle.textContent = item ? "Edito shpenzim fiks" : "Shto shpenzim fiks";
  els.recurringIdInput.value = item?.id || "";
  els.recurringNameInput.value = item?.name || "";
  els.recurringAmountInput.value = item?.amount || "";
  els.recurringCurrencyInput.value = normalizeCurrency(item?.currency);
  renderRecurringCategoryOptions(item?.category || "Fatura");
  els.recurringDayInput.value = String(item?.dueDay || 1);
  els.recurringActiveInput.checked = item?.active !== false;
  els.deleteRecurringBtn.hidden = !item;
  els.recurringEditorOverlay.hidden = false;
  els.recurringNameInput.focus();
}

function closeRecurringEditor() {
  els.recurringEditorOverlay.hidden = true;
  els.recurringForm.reset();
  state.editingRecurringId = "";
}

function renderRecurringCategoryOptions(selected = "Fatura") {
  const options = getCategories("expense");
  const selectedCategory = options.includes(selected) ? selected : "Fatura";
  els.recurringCategoryInput.innerHTML = options
    .map((category) => `<option value="${escapeHtml(category)}"${category === selectedCategory ? " selected" : ""}>${escapeHtml(category)}</option>`)
    .join("");
}

function handleRecurringSubmit(event) {
  event.preventDefault();

  const name = els.recurringNameInput.value.trim();
  const amount = Number(els.recurringAmountInput.value);
  if (!name || !amount || amount <= 0) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  const existing = state.recurringExpenses.find((item) => item.id === state.editingRecurringId);
  const next = normalizeRecurringExpense({
    id: existing?.id || crypto.randomUUID(),
    name,
    amount,
    currency: els.recurringCurrencyInput.value,
    category: els.recurringCategoryInput.value,
    dueDay: Number(els.recurringDayInput.value) || 1,
    active: els.recurringActiveInput.checked,
    createdAt: existing?.createdAt || new Date().toISOString(),
  });

  if (existing) {
    Object.assign(existing, next);
  } else {
    state.recurringExpenses.push(next);
  }

  state.recurringExpenses = normalizeRecurringExpenses(state.recurringExpenses);
  saveRecurringExpenses();
  closeRecurringEditor();
  render();
  showUndoToast(existing ? "Shpenzimi fiks u përditësua." : "Shpenzimi fiks u shtua.", () => restoreFinanceSnapshot(snapshot));
}

function deleteRecurringExpense(id) {
  if (!id) return;
  const item = state.recurringExpenses.find((expense) => expense.id === id);
  if (!item) return;
  const confirmed = confirm(`A dëshiron ta fshish “${item.name}”?`);
  if (!confirmed) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  state.recurringExpenses = state.recurringExpenses.filter((expense) => expense.id !== id);
  saveRecurringExpenses();
  closeRecurringEditor();
  render();
  showUndoToast("Shpenzimi fiks u fshi.", () => restoreFinanceSnapshot(snapshot));
}

function recurringAmountLabel(item) {
  return normalizeCurrency(item.currency) === "EUR" ? moneyEuroCompact(item.amount) : moneyLekShort(item.amount);
}

function recurringDayLabel(day) {
  return `çdo datë ${Math.max(1, Math.min(31, Number(day) || 1))}`;
}

function openAccountsWindow() {
  els.accountsOverlay.hidden = false;
}

function closeAccountsWindow() {
  els.accountsOverlay.hidden = true;
}

function openProfileMenu() {
  syncProfileThemeState();
  els.profileMenuOverlay.hidden = false;
  document.body.classList.add("profile-menu-open");
  els.themeToggle.setAttribute("aria-expanded", "true");
}

function closeProfileMenu() {
  els.profileMenuOverlay.hidden = true;
  document.body.classList.remove("profile-menu-open");
  els.themeToggle.setAttribute("aria-expanded", "false");
}

function openSavingsGoalEditor() {
  syncSavingsGoalForm();
  renderSavingsGoalSummary();
  els.savingsGoalOverlay.hidden = false;
  els.savingsGoalAmountInput.focus();
}

function closeSavingsGoalEditor() {
  els.savingsGoalOverlay.hidden = true;
}

function openGoalsWindow() {
  renderGoalsWindow();
  els.goalsOverlay.hidden = false;
}

function closeGoalsWindow() {
  els.goalsOverlay.hidden = true;
}

function renderGoalsWindow() {
  if (!els.goalsList) return;

  const goals = normalizeGoals(state.goals);
  const activeGoals = goals.filter((goal) => goal.active !== false);
  const monthlyLek = goalsMonthlyTargetLek(activeGoals);
  const now = new Date();
  const monthDays = daysInMonth(now);
  const incomeMonth = monthlyTotalsByType(now.getFullYear(), "income")[now.getMonth()];
  const budgetLek = Math.max(totalsToLek(incomeMonth) - monthlyLek, 0);

  setText(els.goalsSummaryMonthly, `${moneyLekShort(monthlyLek)} / ${moneyEuroCompact(monthlyLek / state.exchangeRate)}`);
  setText(els.goalsSummaryDaily, `${moneyLekShort(monthlyLek / Math.max(monthDays, 1))} / ${moneyEuroCompact(monthlyLek / state.exchangeRate / Math.max(monthDays, 1))}`);
  setText(els.goalsSummaryBudget, `${moneyLekShort(budgetLek)} / ${moneyEuroCompact(budgetLek / state.exchangeRate)}`);
  const totalSavedLek = activeGoals.reduce((sum, goal) => sum + goalSavedLek(goal, now), 0);
  setText(els.goalsSummarySaved, `${moneyLekShort(totalSavedLek)} / ${moneyEuroCompact(totalSavedLek / state.exchangeRate)}`);

  els.goalsList.innerHTML = goals.length
    ? goals
        .map((goal) => {
          const monthlyLekTarget = singleSavingsGoalMonthlyTargetLek(goal);
          const saved = goalSavedAmount(goal);
          const progress = Number(goal.amount) > 0 ? Math.min((saved / Number(goal.amount)) * 100, 100) : 0;
          const sourceBank = findBank(goal.bankId);
          const contributionText = goal.contributionMode === "automatic" && goal.monthlyContribution > 0
            ? `${goalAmountByCurrency(goal.monthlyContribution, goal.currency)} automatikisht në muaj`
            : "Kontribut manual";
          return `
            <article class="goal-row ${goal.active === false ? "is-paused" : ""}">
              <div>
                <strong>${escapeHtml(goal.name)}</strong>
                <span>${escapeHtml(goalSavedAmountLabel(goal))} nga ${escapeHtml(goalAmountLabel(goal))} · ${Math.round(progress)}%</span>
                <small>${moneyLekShort(monthlyLekTarget)} / ${moneyEuroCompact(monthlyLekTarget / state.exchangeRate)} në muaj</small>
                <small>${escapeHtml(contributionText)}${sourceBank ? ` · ${escapeHtml(sourceBank.name)}` : ""}</small>
              </div>
              <div class="goal-row-actions">
                <button type="button" data-toggle-goal="${escapeHtml(goal.id)}">${goal.active === false ? "Aktivizo" : "Pauzo"}</button>
                <button type="button" data-edit-goal="${escapeHtml(goal.id)}">Edit</button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="empty-state">Shto objektivin e parë që buxheti të llogaritet sipas planeve të tua.</p>`;
}

function openGoalEditor(id = "") {
  const goal = normalizeGoals(state.goals).find((item) => item.id === id);
  state.editingGoalId = goal?.id || "";
  els.goalForm.reset();
  setText(els.goalEditorTitle, goal ? "Edito objektiv" : "Shto objektiv");
  els.goalIdInput.value = goal?.id || "";
  els.goalNameInput.value = goal?.name || "";
  els.goalAmountInput.value = goal?.amount ? formatPlainNumber(goal.amount) : "";
  els.goalCurrencyInput.value = normalizeCurrency(goal?.currency || "EUR");
  els.goalMonthsInput.value = String(goal?.months || 12);
  els.goalSavedAmountInput.value = goal?.savedAmount ? formatPlainNumber(goal.savedAmount) : "";
  els.goalContributionModeInput.value = goal?.contributionMode === "automatic" ? "automatic" : "manual";
  els.goalMonthlyContributionInput.value = goal?.monthlyContribution ? formatPlainNumber(goal.monthlyContribution) : "";
  renderGoalBankOptions(goal?.bankId || "");
  els.goalActiveInput.checked = goal?.active !== false;
  els.deleteGoalBtn.hidden = !goal;
  renderGoalEditorSummary();
  els.goalEditorOverlay.hidden = false;
  document.body.classList.add("goal-editor-open");
  window.setTimeout(() => els.goalNameInput?.focus(), 50);
}

function closeGoalEditor() {
  els.goalEditorOverlay.hidden = true;
  document.body.classList.remove("goal-editor-open");
  state.editingGoalId = "";
}

function renderGoalEditorSummary() {
  if (!els.goalMonthlyValue || !els.goalDailyValue) return;

  const goal = normalizeGoal(
    {
      id: state.editingGoalId || "preview-goal",
      name: els.goalNameInput?.value || "Objektiv kursimi",
      amount: Number(els.goalAmountInput?.value) || 0,
      currency: els.goalCurrencyInput?.value || "EUR",
      months: Number(els.goalMonthsInput?.value) || 12,
      savedAmount: Number(els.goalSavedAmountInput?.value) || 0,
      contributionMode: els.goalContributionModeInput?.value || "manual",
      monthlyContribution: Number(els.goalMonthlyContributionInput?.value) || 0,
      bankId: els.goalBankInput?.value || "",
      active: els.goalActiveInput?.checked !== false,
    },
    { id: "preview-goal" }
  );
  const monthlyLek = singleSavingsGoalMonthlyTargetLek(goal);
  const dailyLek = monthlyLek / Math.max(daysInMonth(new Date()), 1);
  const saved = goalSavedAmount(goal);
  const progress = Number(goal.amount) > 0 ? Math.min((saved / Number(goal.amount)) * 100, 100) : 0;

  if (els.goalMonthlyContributionLabel) els.goalMonthlyContributionLabel.hidden = goal.contributionMode !== "automatic";

  setText(els.goalMonthlyValue, `${moneyLekShort(monthlyLek)} / ${moneyEuroCompact(monthlyLek / state.exchangeRate)} në muaj`);
  setText(els.goalDailyValue, `${moneyLekShort(dailyLek)} / ${moneyEuroCompact(dailyLek / state.exchangeRate)} në ditë`);
  setText(els.goalProgressValue, `${goalAmountByCurrency(saved, goal.currency)} nga ${goalAmountLabel(goal)} · ${Math.round(progress)}% e realizuar`);
}

function renderGoalBankOptions(selectedId = "") {
  if (!els.goalBankInput) return;
  const banks = state.banks.slice().sort((a, b) => a.name.localeCompare(b.name, "sq"));
  els.goalBankInput.innerHTML = `<option value="">Pa llogari të caktuar</option>${banks
    .map((bank) => `<option value="${escapeHtml(bank.id)}">${escapeHtml(bank.name)} · ${bank.currency === "EUR" ? "Euro" : "Lekë"}</option>`)
    .join("")}`;
  els.goalBankInput.value = banks.some((bank) => bank.id === selectedId) ? selectedId : "";
}

function goalAmountByCurrency(amount, currency) {
  return normalizeCurrency(currency) === "EUR" ? moneyEuroCompact(amount) : moneyLekShort(amount);
}

function handleGoalSubmit(event) {
  event.preventDefault();

  const name = normalizeGoalName(els.goalNameInput?.value);
  const amount = Number(els.goalAmountInput?.value);
  if (!name || !amount || amount <= 0) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();

  const existing = normalizeGoals(state.goals).find((goal) => goal.id === state.editingGoalId);
  const goal = normalizeGoal({
    id: existing?.id || crypto.randomUUID(),
    name,
    amount,
    currency: els.goalCurrencyInput?.value,
    months: Number(els.goalMonthsInput?.value) || 12,
    savedAmount: Number(els.goalSavedAmountInput?.value) || 0,
    contributionMode: els.goalContributionModeInput?.value === "automatic" ? "automatic" : "manual",
    monthlyContribution: Number(els.goalMonthlyContributionInput?.value) || 0,
    bankId: els.goalBankInput?.value || "",
    active: els.goalActiveInput?.checked !== false,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const goals = normalizeGoals(state.goals);
  const index = goals.findIndex((item) => item.id === goal.id);

  if (index >= 0) goals[index] = goal;
  else goals.push(goal);

  state.goals = normalizeGoals(goals);
  syncPrimarySavingsGoal();
  saveGoals();
  closeGoalEditor();
  render();
  showUndoToast(existing ? "Objektivi u përditësua." : "Objektivi u shtua.", () => restoreFinanceSnapshot(snapshot));
}

function handleGoalsListClick(event) {
  const editButton = event.target.closest("[data-edit-goal]");
  if (editButton) {
    openGoalEditor(editButton.dataset.editGoal);
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-goal]");
  if (toggleButton) toggleGoal(toggleButton.dataset.toggleGoal);
}

function toggleGoal(id) {
  const snapshot = snapshotFinanceState();
  createAutoBackup();
  state.goals = normalizeGoals(state.goals).map((goal) =>
    goal.id === id ? { ...goal, active: goal.active === false, updatedAt: new Date().toISOString() } : goal
  );
  syncPrimarySavingsGoal();
  saveGoals();
  render();
  showUndoToast("Objektivi u ndryshua.", () => restoreFinanceSnapshot(snapshot));
}

function deleteGoal(id) {
  if (!id) return;

  const goal = normalizeGoals(state.goals).find((item) => item.id === id);
  if (!goal) return;
  if (!confirm(`A dëshiron ta fshish “${goal.name}”?`)) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  state.goals = normalizeGoals(state.goals).filter((item) => item.id !== id);
  syncPrimarySavingsGoal();
  saveGoals();
  closeGoalEditor();
  render();
  showUndoToast("Objektivi u fshi.", () => restoreFinanceSnapshot(snapshot));
}

function goalDurationLabel(months) {
  return Number(months) === 12 ? "1 vit" : `${Number(months) || 1} muaj`;
}

function goalAmountLabel(goal) {
  return normalizeCurrency(goal.currency) === "EUR" ? moneyEuroCompact(goal.amount) : moneyLekShort(goal.amount);
}

function openCategoriesWindow(type = state.type) {
  state.categoryManagerType = type === "income" ? "income" : "expense";
  renderCategoryManager();
  els.categoriesOverlay.hidden = false;
}

function closeCategoriesWindow() {
  els.categoriesOverlay.hidden = true;
}

function renderCategoryManager() {
  if (!els.categoriesTabs || !els.categoriesList) return;

  const type = state.categoryManagerType === "income" ? "income" : "expense";
  els.categoriesTabs.querySelectorAll("[data-category-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.categoryType === type);
  });

  els.categoriesList.innerHTML = getCategories(type)
    .map((category) => {
      const protectedCategory = isDefaultCategory(type, category);
      return `
        <article class="category-row ${protectedCategory ? "is-protected" : ""}">
          <span>${escapeHtml(category)}</span>
          <button type="button" data-delete-category="${escapeHtml(category)}"${protectedCategory ? " disabled" : ""}>
            ${protectedCategory ? "Bazë" : "Fshi"}
          </button>
        </article>
      `;
    })
    .join("");
}

function handleCategoryTabClick(event) {
  const button = event.target.closest("[data-category-type]");
  if (!button) return;
  state.categoryManagerType = button.dataset.categoryType === "income" ? "income" : "expense";
  renderCategoryManager();
}

function handleCategorySubmit(event) {
  event.preventDefault();

  const name = normalizeCategoryName(els.categoryNameInput?.value);
  if (!name) return;

  const type = state.categoryManagerType === "income" ? "income" : "expense";
  if (categoryExists(type, name)) {
    els.categoryNameInput.value = "";
    return;
  }

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  state.categories = normalizeCategoriesData(state.categories);
  state.categories[type] = addCategoryToList(state.categories[type], name);
  saveCategories();
  els.categoryNameInput.value = "";
  syncTypeControls();
  render();
  showUndoToast("Kategoria u shtua.", () => restoreFinanceSnapshot(snapshot));
}

function handleCategoryListClick(event) {
  const button = event.target.closest("[data-delete-category]");
  if (!button || button.disabled) return;
  deleteCategory(state.categoryManagerType, button.dataset.deleteCategory);
}

function deleteCategory(type, category) {
  const normalizedType = type === "income" ? "income" : "expense";
  if (isDefaultCategory(normalizedType, category)) return;
  if (!confirm(`A dëshiron ta fshish kategorinë “${category}”? Zërat ekzistues nuk preken.`)) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  const categoryKey = normalizeCategoryName(category).toLowerCase();
  state.categories = normalizeCategoriesData(state.categories);
  state.categories[normalizedType] = state.categories[normalizedType].filter((item) => item.toLowerCase() !== categoryKey);
  saveCategories();
  syncTypeControls();
  render();
  showUndoToast("Kategoria u fshi.", () => restoreFinanceSnapshot(snapshot));
}

function maybeOpenSetup() {
  if (state.setupComplete) return;

  const hasRealData =
    state.entries.length ||
    state.recurringExpenses.length ||
    state.banks.some((bank) => Math.abs(Number(bank.balance) || 0) > 0);
  if (hasRealData) {
    saveSetupComplete(true);
    return;
  }

  window.setTimeout(() => openSetupOverlay(true), 450);
}

function openSetupOverlay(isFirstRun = false) {
  if (!els.setupOverlay) return;

  const totals = bankTotals();
  if (els.setupLekBalanceInput) els.setupLekBalanceInput.value = formatPlainNumber(totals.ALL);
  if (els.setupEuroBalanceInput) els.setupEuroBalanceInput.value = formatPlainNumber(totals.EUR);
  if (els.setupGoalAmountInput) els.setupGoalAmountInput.value = formatPlainNumber(state.savingsGoal.amount);
  if (els.setupGoalCurrencyInput) els.setupGoalCurrencyInput.value = normalizeCurrency(state.savingsGoal.currency);
  if (els.setupGoalMonthsInput) els.setupGoalMonthsInput.value = String(state.savingsGoal.months || 12);
  els.setupOverlay.dataset.firstRun = String(Boolean(isFirstRun));
  els.setupOverlay.hidden = false;
  window.setTimeout(() => els.setupLekBalanceInput?.focus(), 50);
}

function closeSetupOverlay(markComplete = false) {
  if (els.setupOverlay) els.setupOverlay.hidden = true;
  if (markComplete) saveSetupComplete(true);
}

function handleSetupSubmit(event) {
  event.preventDefault();
  const snapshot = snapshotFinanceState();
  createAutoBackup();

  upsertSetupBank("ALL", Number(els.setupLekBalanceInput?.value) || 0);
  upsertSetupBank("EUR", Number(els.setupEuroBalanceInput?.value) || 0);
  state.savingsGoal = normalizeSavingsGoal({
    amount: Number(els.setupGoalAmountInput?.value) || DEFAULT_SAVINGS_GOAL.amount,
    currency: els.setupGoalCurrencyInput?.value || DEFAULT_SAVINGS_GOAL.currency,
    months: Number(els.setupGoalMonthsInput?.value) || DEFAULT_SAVINGS_GOAL.months,
  });
  upsertPrimaryGoalFromSavingsGoal(state.savingsGoal);

  ensureDefaultBanks();
  saveBanks();
  saveSavingsGoal();
  saveGoals();
  saveSetupComplete(true);
  closeSetupOverlay(false);
  render();
  showUndoToast("Setup u ruajt.", () => restoreFinanceSnapshot(snapshot));
}

function upsertSetupBank(currency, amount) {
  const normalizedCurrency = normalizeCurrency(currency);
  const normalizedAmount = Math.max(Number(amount) || 0, 0);
  const existing = state.banks.find((bank) => bank.currency === normalizedCurrency && bank.name === setupBankName(normalizedCurrency));

  if (!existing && normalizedAmount <= 0) return;

  state.banks.forEach((bank) => {
    if (bank.currency === normalizedCurrency) bank.isDefault = false;
  });

  if (existing) {
    existing.balance = normalizedAmount;
    existing.isDefault = true;
    return;
  }

  state.banks.push({
    id: crypto.randomUUID(),
    name: setupBankName(normalizedCurrency),
    currency: normalizedCurrency,
    balance: normalizedAmount,
    isDefault: true,
    createdAt: new Date().toISOString(),
  });
}

function setupBankName(currency) {
  return currency === "EUR" ? "Gjendje fillestare euro" : "Gjendje fillestare lekë";
}

function formatPlainNumber(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(2)));
}

function openIncomeDetail() {
  state.incomeDetailRange = state.incomeDetailRange || "month";
  renderIncomeDetail();
  els.incomeDetailOverlay.hidden = false;
}

function closeIncomeDetail() {
  els.incomeDetailOverlay.hidden = true;
}

function renderIncomeDetail() {
  if (!els.incomeDetailChart || !els.incomeDetailAxis) return;

  const data = incomeDetailData(state.incomeDetailRange || "month");
  state.incomeDetailRange = data.range;
  document.querySelectorAll("[data-income-detail-range]").forEach((button) => {
    button.classList.toggle("active", button.dataset.incomeDetailRange === data.range);
  });

  setText(els.incomeDetailPeriodLabel, data.title);
  setText(els.incomeDetailTotalLek, moneyLekShort(data.totals.ALL));
  setText(els.incomeDetailTotalEuro, moneyEuroCompact(data.totals.EUR));
  setText(els.incomeDetailNote, data.note);
  renderIncomeDetailBars(data.points);
}

function incomeDetailData(range, now = new Date()) {
  if (range === "today") return incomeTodayDetail(now);
  if (range === "month") return incomeMonthDetail(now);
  if (range === "year") return incomeYearDetail(now);
  return incomeWeekDetail(now);
}

function incomeTodayDetail(now) {
  const anchors = [0, 6, 12, 15, 18, 24];
  const isoDate = toLocalIso(now);
  const totals = incomesForDate(isoDate);
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentBucketIndex = hourBucketIndex(currentHour, anchors);
  const points = anchors.map((hour, index) => ({
    label: String(hour).padStart(2, "0"),
    detailLabel: `Ora ${String(hour).padStart(2, "0")}:00`,
    totals: emptyMoneyTotals(),
    muted: hour > currentHour && hour !== 24,
    current: index === currentBucketIndex,
  }));

  state.entries
    .filter((entry) => entry.type === "income" && entry.date === isoDate)
    .forEach((entry) => {
      const hour = entryHour(entry, currentHour);
      const bucketIndex = hourBucketIndex(hour, anchors);
      addEntryAmount(points[bucketIndex].totals, entry);
      points[bucketIndex].muted = false;
    });

  return {
    range: "today",
    title: "Dita",
    totals,
    note: "Çdo shtyllë tregon vetëm hyrjet reale të sotme, të grupuara sipas orës së regjistrimit.",
    points,
  };
}

function incomeWeekDetail(now) {
  const monday = startOfWeek(now);
  const labels = ["H", "M", "M", "E", "P", "S", "D"];
  const today = toLocalIso(now);
  const points = labels.map((label, index) => {
    const date = addDays(monday, index);
    const iso = toLocalIso(date);
    return {
      label,
      detailLabel: capitalizeFirst(date.toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "short" })),
      totals: iso <= today ? incomesForDate(iso) : emptyMoneyTotals(),
      muted: iso > today,
      current: iso === today,
    };
  });

  return {
    range: "week",
    title: "Java",
    totals: addMoneyTotals(points.filter((point) => !point.muted).map((point) => point.totals)),
    note: "Çdo shtyllë tregon të ardhurat e një dite të javës.",
    points,
  };
}

function incomeMonthDetail(now) {
  const totalDays = daysInMonth(now);
  const today = toLocalIso(now);
  const labelDays = new Set([1, 5, 10, 15, 20, 25, totalDays]);
  const points = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    const iso = toLocalIso(date);
    return {
      label: labelDays.has(day) ? String(day) : "",
      detailLabel: `Dita ${day}`,
      totals: iso <= today ? incomesForDate(iso) : emptyMoneyTotals(),
      muted: iso > today,
      current: iso === today,
    };
  });

  return {
    range: "month",
    title: capitalizeFirst(monthNames[now.getMonth()]),
    totals: addMoneyTotals(points.filter((point) => !point.muted).map((point) => point.totals)),
    note: "Çdo shtyllë tregon të ardhurat për një ditë të muajit aktual.",
    points,
  };
}

function incomeYearDetail(now) {
  const monthLetters = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"];
  const monthlyTotals = monthlyTotalsByType(now.getFullYear(), "income");
  const points = monthlyTotals.map((totals, index) => ({
    label: monthLetters[index],
    detailLabel: capitalizeFirst(monthNames[index]),
    totals: index <= now.getMonth() ? totals : emptyMoneyTotals(),
    muted: index > now.getMonth(),
    current: index === now.getMonth(),
  }));

  return {
    range: "year",
    title: String(now.getFullYear()),
    totals: addMoneyTotals(points.filter((point) => !point.muted).map((point) => point.totals)),
    note: "Çdo shtyllë tregon të ardhurat e muajit përkatës.",
    points,
  };
}

function renderIncomeDetailBars(points) {
  renderDetailBarChart({
    container: els.incomeDetailChart,
    axisContainer: els.incomeDetailAxis,
    points,
    chartType: "income",
    valueForPoint: (point) => Math.max(totalsToLek(point.totals), 0),
    titleForPoint: (point) => `${point.detailLabel || point.label || "Periudha"}: ${moneyPairCompact(point.totals)}`,
    onSelect: (point) => {
      const label = point.detailLabel || point.label || "Periudha";
      setText(els.incomeDetailTotalLek, moneyLekShort(point.totals.ALL));
      setText(els.incomeDetailTotalEuro, moneyEuroCompact(point.totals.EUR));
      setText(els.incomeDetailNote, `${label} · ${moneyPairCompact(point.totals)}`);
    },
  });
}

function entryHour(entry, fallbackHour = 12) {
  const created = new Date(entry.createdAt || "");
  if (!Number.isNaN(created.getTime()) && toLocalIso(created) === entry.date) {
    return created.getHours() + created.getMinutes() / 60;
  }
  return fallbackHour;
}

function hourBucketIndex(hour, anchors) {
  const index = anchors.findIndex((anchor) => hour <= anchor);
  return index === -1 ? anchors.length - 1 : index;
}

function openSavingsDetail() {
  state.savingsDetailRange = state.savingsDetailRange || "month";
  renderSavingsDetail();
  els.savingsDetailOverlay.hidden = false;
}

function closeSavingsDetail() {
  els.savingsDetailOverlay.hidden = true;
}

function renderSavingsDetail() {
  if (!els.savingsDetailChart || !els.savingsDetailAxis) return;

  const data = savingsDetailData(state.savingsDetailRange || "month");
  state.savingsDetailRange = data.range;
  document.querySelectorAll("[data-savings-detail-range]").forEach((button) => {
    button.classList.toggle("active", button.dataset.savingsDetailRange === data.range);
  });

  setText(els.savingsDetailPeriodLabel, data.title);
  setText(els.savingsDetailTotalLek, moneyLekShort(data.totalLek));
  setText(els.savingsDetailTotalEuro, moneyEuroCompact(data.totalLek / state.exchangeRate));
  setText(els.savingsDetailNote, data.note);
  renderSavingsDetailBars(data.points);
}

function savingsDetailData(range, now = new Date()) {
  if (range === "today") return savingsTodayDetail(now);
  if (range === "week") return savingsWeekDetail(now);
  if (range === "year") return savingsYearDetail(now);
  return savingsMonthDetail(now);
}

function savingsTodayDetail(now) {
  const anchors = [0, 6, 12, 15, 18, 24];
  const today = toLocalIso(now);
  const todayEntries = state.entries.filter((entry) => entry.date === today);
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const totalLek = todayEntries.reduce((sum, entry) => sum + signedEntryValueLek(entry), 0);

  return {
    range: "today",
    title: "Sot",
    totalLek,
    note: "Çdo shtyllë tregon bilancin neto të regjistruar deri në atë orë: të ardhura minus shpenzime.",
    points: anchors.map((hour, index) => {
      const effectiveHour = Math.min(hour, currentHour);
      const value = todayEntries
        .filter((entry) => entryHour(entry) <= effectiveHour)
        .reduce((sum, entry) => sum + signedEntryValueLek(entry), 0);
      return {
        label: String(hour).padStart(2, "0"),
        detailLabel: `Ora ${String(hour).padStart(2, "0")}:00`,
        value,
        muted: hour > currentHour,
        current: index === hourBucketIndex(currentHour, anchors),
      };
    }),
  };
}

function savingsWeekDetail(now) {
  const monday = startOfWeek(now);
  const labels = ["H", "M", "M", "E", "P", "S", "D"];
  const today = toLocalIso(now);
  const points = labels.map((label, index) => {
    const date = addDays(monday, index);
    const iso = toLocalIso(date);
    return {
      label,
      detailLabel: capitalizeFirst(date.toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "short" })),
      value: iso <= today ? savingsForDate(date) : 0,
      muted: iso > today,
      current: iso === today,
    };
  });

  return {
    range: "week",
    title: "Kjo javë",
    totalLek: sumPointValues(points),
    note: "Çdo shtyllë tregon të ardhurat minus shpenzimet e asaj dite.",
    points,
  };
}

function savingsMonthDetail(now) {
  const totalDays = daysInMonth(now);
  const today = toLocalIso(now);
  const labelDays = new Set([1, 5, 10, 15, 20, 25, totalDays]);
  const points = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    const iso = toLocalIso(date);
    return {
      label: labelDays.has(index + 1) ? String(index + 1) : "",
      detailLabel: `Dita ${index + 1}`,
      value: iso <= today ? savingsForDate(date) : 0,
      muted: iso > today,
      current: iso === today,
    };
  });

  return {
    range: "month",
    title: capitalizeFirst(monthNames[now.getMonth()]),
    totalLek: sumPointValues(points),
    note: "Çdo shtyllë tregon të ardhurat minus shpenzimet e asaj dite.",
    points,
  };
}

function savingsYearDetail(now) {
  const monthLetters = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"];
  const points = monthlySavingsTotals(now.getFullYear(), now).map((totals, index) => {
    const isFuture = index > now.getMonth();
    return {
      label: monthLetters[index],
      detailLabel: capitalizeFirst(monthNames[index]),
      value: isFuture ? 0 : totalsToLek(totals),
      muted: isFuture,
      current: index === now.getMonth(),
    };
  });

  return {
    range: "year",
    title: String(now.getFullYear()),
    totalLek: sumPointValues(points),
    note: "Çdo shtyllë tregon të ardhurat minus shpenzimet e muajit përkatës.",
    points,
  };
}

function renderSavingsDetailBars(points) {
  renderDetailBarChart({
    container: els.savingsDetailChart,
    axisContainer: els.savingsDetailAxis,
    points,
    chartType: "savings",
    valueForPoint: (point) => Number(point.value) || 0,
    titleForPoint: (point, value) => `${point.detailLabel || point.label || "Periudha"}: ${moneyLekShort(value)} / ${moneyEuroCompact(value / state.exchangeRate)}`,
    onSelect: (point, value) => {
      const label = point.detailLabel || point.label || "Periudha";
      setText(els.savingsDetailTotalLek, moneyLekShort(value));
      setText(els.savingsDetailTotalEuro, moneyEuroCompact(value / state.exchangeRate));
      setText(els.savingsDetailNote, `${label} · ${value >= 0 ? "kursim neto" : "bilanc neto negativ"} ${moneyLekShort(value)}`);
    },
  });
}

function renderDetailBarChart({ container, axisContainer, points, chartType, valueForPoint, titleForPoint, onSelect }) {
  if (!container || !axisContainer) return;

  const values = points.map((point) => Number(valueForPoint(point)) || 0);
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1);

  container.innerHTML = "";
  axisContainer.innerHTML = "";
  container.style.setProperty("--point-count", points.length);
  axisContainer.style.setProperty("--point-count", points.length);
  container.classList.toggle("is-dense", points.length > 16);
  axisContainer.classList.toggle("is-dense", points.length > 16);

  points.forEach((point, index) => {
    const value = values[index];
    const height = point.muted || value === 0 ? 6 : scaledMonthlyBarHeight(Math.abs(value), maxAbs);
    const bar = document.createElement("button");
    bar.className = [
      "detail-chart-bar",
      `${chartType}-detail-bar`,
      value < 0 ? "is-negative" : value > 0 ? "has-value" : "is-zero",
      point.current ? "is-current" : "",
      point.muted ? "is-future" : "",
    ].filter(Boolean).join(" ");
    bar.type = "button";
    bar.style.setProperty("--bar-height", `${height}%`);
    bar.title = titleForPoint(point, value);
    bar.setAttribute("aria-label", bar.title);
    bar.addEventListener("click", () => {
      container.querySelectorAll(".detail-chart-bar.is-selected").forEach((item) => item.classList.remove("is-selected"));
      bar.classList.add("is-selected");
      onSelect(point, value);
    });
    container.append(bar);

    const axis = document.createElement("span");
    axis.textContent = point.label;
    axisContainer.append(axis);
  });
}

function savingsForDate(date) {
  const isoDate = toLocalIso(date);
  return totalsToLek(incomesForDate(isoDate)) - totalsToLek(expensesForDate(isoDate));
}

function signedEntryValueLek(entry) {
  const value = normalizeCurrency(entry.currency) === "EUR"
    ? (Number(entry.amount) || 0) * state.exchangeRate
    : Number(entry.amount) || 0;
  return entry.type === "income" ? value : -value;
}

function expensesForDate(isoDate) {
  return state.entries
    .filter((entry) => entry.type === "expense" && entry.date === isoDate)
    .reduce(sumMoneyTotals, emptyMoneyTotals());
}

function incomesForDate(isoDate) {
  return state.entries
    .filter((entry) => entry.type === "income" && entry.date === isoDate)
    .reduce(sumMoneyTotals, emptyMoneyTotals());
}

function startOfWeek(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return start;
}

function sumPointValues(points) {
  return points.reduce((sum, point) => sum + (point.muted ? 0 : Number(point.value) || 0), 0);
}

function syncSavingsGoalForm() {
  els.savingsGoalAmountInput.value = state.savingsGoal.amount || "";
  els.savingsGoalCurrencyInput.value = normalizeCurrency(state.savingsGoal.currency);
  els.savingsGoalMonthsInput.value = String([1, 2, 6, 12].includes(Number(state.savingsGoal.months)) ? state.savingsGoal.months : 12);
}

function renderSavingsGoalSummary() {
  if (!els.savingsGoalMonthlyValue) return;

  const goal = normalizeSavingsGoal({
    amount: Number(els.savingsGoalAmountInput.value) || 0,
    currency: els.savingsGoalCurrencyInput.value,
    months: Number(els.savingsGoalMonthsInput.value) || 12,
  });
  const now = new Date();
  const incomeMonth = monthlyTotalsByType(now.getFullYear(), "income")[now.getMonth()];
  const plan = savingsGoalPlan(now, incomeMonth, goal);
  const monthlyTargetLek = plan.monthlyTargetLek;
  const dailyTargetLek = monthlyTargetLek / Math.max(plan.monthDays, 1);

  els.savingsGoalMonthlyValue.textContent = `${moneyLekShort(monthlyTargetLek)} / ${moneyEuroCompact(monthlyTargetLek / state.exchangeRate)} në muaj`;
  els.savingsGoalDailyValue.textContent = `${moneyLekShort(dailyTargetLek)} / ${moneyEuroCompact(dailyTargetLek / state.exchangeRate)} në ditë`;
  els.savingsGoalBudgetValue.textContent = `Mund të shpenzosh ${moneyLekShort(plan.monthlySpendBudgetLek)} / ${moneyEuroCompact(plan.monthlySpendBudgetLek / state.exchangeRate)} këtë muaj.`;
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

function loadHomeOrder() {
  try {
    return normalizeHomeOrder(JSON.parse(localStorage.getItem(HOME_ORDER_KEY)));
  } catch {
    return [...DEFAULT_HOME_ORDER];
  }
}

function normalizeHomeOrder(order) {
  const valid = Array.isArray(order) ? order.filter((id) => DEFAULT_HOME_ORDER.includes(id)) : [];
  return [...new Set([...valid, ...DEFAULT_HOME_ORDER])];
}

function currentHomeBlocks() {
  return els.overviewHome ? Array.from(els.overviewHome.querySelectorAll(":scope > [data-home-block]")) : [];
}

function currentHomeOrder() {
  return currentHomeBlocks().map((block) => block.dataset.homeBlock).filter(Boolean);
}

function applyHomeOrder(order = state.homeOrder) {
  if (!els.overviewHome) return;

  const blocks = currentHomeBlocks();
  const byId = new Map(blocks.map((block) => [block.dataset.homeBlock, block]));
  const normalized = [...new Set([...(Array.isArray(order) ? order : []), ...DEFAULT_HOME_ORDER])].filter((id) => byId.has(id));
  normalized.forEach((id) => {
    const block = byId.get(id);
    els.overviewHome.append(block);
    if (id === "safe-spend" && els.homeSetupHint) els.overviewHome.append(els.homeSetupHint);
  });
  state.homeOrder = normalized;
}

function saveHomeOrder(order = currentHomeOrder()) {
  state.homeOrder = normalizeHomeOrder(order);
  localStorage.setItem(HOME_ORDER_KEY, JSON.stringify(state.homeOrder));
}

function handleHomeReorderPointerDown(event) {
  if (event.pointerType === "touch") return;
  if (!event.isPrimary || event.button > 0) return;
  const block = homeBlockFromPressTarget(event.target);
  if (!block) return;
  beginHomeReorderPress(block, "pointer", event.pointerId, event.clientX, event.clientY);
}

function handleHomeReorderPointerMove(event) {
  if (homeReorderSession.inputType !== "pointer" || event.pointerId !== homeReorderSession.pointerId) return;
  updateHomeReorderPress(event.clientX, event.clientY, event);
}

function handleHomeReorderPointerUp(event) {
  if (homeReorderSession.inputType !== "pointer" || event.pointerId !== homeReorderSession.pointerId) return;
  endHomeReorderPress();
}

function handleHomeReorderPointerCancel(event) {
  if (homeReorderSession.inputType !== "pointer" || event.pointerId !== homeReorderSession.pointerId) return;
  endHomeReorderPress(false);
}

function handleHomeReorderTouchStart(event) {
  if (event.touches.length !== 1) return;
  const block = homeBlockFromPressTarget(event.target);
  if (!block) return;
  const touch = event.touches[0];
  beginHomeReorderPress(block, "touch", touch.identifier, touch.clientX, touch.clientY);
}

function handleHomeReorderTouchMove(event) {
  if (homeReorderSession.inputType !== "touch") return;
  const touch = Array.from(event.touches).find((item) => item.identifier === homeReorderSession.touchId);
  if (!touch) return;
  updateHomeReorderPress(touch.clientX, touch.clientY, event);
}

function handleHomeReorderTouchEnd(event) {
  if (homeReorderSession.inputType !== "touch") return;
  const ended = Array.from(event.changedTouches).some((item) => item.identifier === homeReorderSession.touchId);
  if (ended) endHomeReorderPress();
}

function handleHomeReorderTouchCancel(event) {
  if (homeReorderSession.inputType !== "touch") return;
  const cancelled = Array.from(event.changedTouches).some((item) => item.identifier === homeReorderSession.touchId);
  if (cancelled) endHomeReorderPress(false);
}

function handleHomeReorderContextMenu(event) {
  if (!homeReorderSession.active) return;
  event.preventDefault();
}

function homeBlockFromPressTarget(target) {
  if (!(target instanceof Element)) return null;
  if (target.closest("button, a, input, select, textarea")) return null;
  const block = target.closest("[data-home-block]");
  return block && els.overviewHome?.contains(block) ? block : null;
}

function beginHomeReorderPress(block, inputType, inputId, clientX, clientY) {
  if (homeReorderSession.active) finishHomeReorder(false);
  clearTimeout(homeReorderSession.timer);
  homeReorderSession.inputType = inputType;
  homeReorderSession.pointerId = inputType === "pointer" ? inputId : null;
  homeReorderSession.touchId = inputType === "touch" ? inputId : null;
  homeReorderSession.block = block;
  homeReorderSession.startX = clientX;
  homeReorderSession.startY = clientY;
  homeReorderSession.moved = false;
  homeReorderSession.timer = window.setTimeout(() => activateHomeReorder(block, clientX, clientY), 480);
}

function updateHomeReorderPress(clientX, clientY, event) {
  if (!homeReorderSession.block) return;
  const distance = Math.hypot(clientX - homeReorderSession.startX, clientY - homeReorderSession.startY);

  if (!homeReorderSession.active) {
    if (distance > 10) cancelHomeReorderPress();
    return;
  }

  event.preventDefault();
  moveDraggedHomeBlock(clientY);
  homeReorderSession.moved = homeReorderSession.moved || distance > 4;
}

function handleHomeReorderClick(event) {
  if (Date.now() < homeReorderSession.suppressClickUntil) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function activateHomeReorder(block, clientX, clientY) {
  if (!block || homeReorderSession.block !== block) return;
  const rect = block.getBoundingClientRect();
  const placeholder = document.createElement("div");
  placeholder.className = "home-reorder-placeholder";
  placeholder.style.height = `${rect.height}px`;
  placeholder.setAttribute("aria-hidden", "true");
  block.before(placeholder);

  homeReorderSession.timer = 0;
  homeReorderSession.active = true;
  homeReorderSession.moved = false;
  homeReorderSession.placeholder = placeholder;
  homeReorderSession.grabOffsetY = Math.max(0, Math.min(clientY - rect.top, rect.height));
  homeReorderSession.dragHeight = rect.height;
  homeReorderSession.originalStyle = block.getAttribute("style");
  document.body.classList.add("home-reorder-active");
  block.classList.add("is-reordering");
  block.setAttribute("aria-grabbed", "true");
  block.style.position = "fixed";
  block.style.left = `${rect.left}px`;
  block.style.top = `${rect.top}px`;
  block.style.width = `${rect.width}px`;
  block.style.height = `${rect.height}px`;
  block.style.margin = "0";
  navigator.vibrate?.(30);
  showInfoToast("Zvarrite bllokun dhe lëshoje në pozicionin e ri.");
}

function moveDraggedHomeBlock(clientY) {
  const { block, placeholder, grabOffsetY, dragHeight } = homeReorderSession;
  if (!block || !placeholder || !els.overviewHome) return;

  const maxTop = Math.max(window.innerHeight - dragHeight - 8, 8);
  block.style.top = `${Math.max(8, Math.min(clientY - grabOffsetY, maxTop))}px`;

  const candidates = currentHomeBlocks().filter((item) => item !== block);
  const before = candidates.find((item) => {
    const rect = item.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2;
  });
  if (before) els.overviewHome.insertBefore(placeholder, before);
  else els.overviewHome.append(placeholder);

  if (clientY < 88) window.scrollBy(0, -12);
  else if (clientY > window.innerHeight - 110) window.scrollBy(0, 12);
}

function endHomeReorderPress(announce = true) {
  clearTimeout(homeReorderSession.timer);
  if (!homeReorderSession.active) {
    cancelHomeReorderPress();
    return;
  }
  homeReorderSession.suppressClickUntil = Date.now() + 500;
  finishHomeReorder(announce);
}

function cancelHomeReorderPress() {
  clearTimeout(homeReorderSession.timer);
  homeReorderSession.timer = 0;
  homeReorderSession.inputType = "";
  homeReorderSession.pointerId = null;
  homeReorderSession.touchId = null;
  if (!homeReorderSession.active) {
    homeReorderSession.block = null;
    homeReorderSession.placeholder = null;
  }
}

function finishHomeReorder(announce = false) {
  clearTimeout(homeReorderSession.timer);
  const { block, placeholder, originalStyle } = homeReorderSession;
  if (homeReorderSession.active && block && placeholder) {
    els.overviewHome?.insertBefore(block, placeholder);
    if (block.dataset.homeBlock === "safe-spend" && els.homeSetupHint) {
      els.overviewHome?.insertBefore(els.homeSetupHint, placeholder);
    }
    placeholder.remove();
    if (originalStyle === null) block.removeAttribute("style");
    else block.setAttribute("style", originalStyle);
    block.classList.remove("is-reordering");
    block.removeAttribute("aria-grabbed");
    saveHomeOrder();
  }
  document.body.classList.remove("home-reorder-active");
  const suppressClickUntil = homeReorderSession.suppressClickUntil;
  homeReorderSession = {
    timer: 0,
    inputType: "",
    pointerId: null,
    touchId: null,
    block: null,
    placeholder: null,
    startX: 0,
    startY: 0,
    grabOffsetY: 0,
    dragHeight: 0,
    originalStyle: null,
    active: false,
    moved: false,
    suppressClickUntil,
  };
  if (announce) showInfoToast("Renditja e Home u ruajt.");
}

function openQuickAdd() {
  if (!els.quickAddOverlay) {
    openEntryEditor("expense");
    return;
  }
  els.quickAddOverlay.hidden = false;
  setQuickAddAiStatus("AI do ta përgatisë zërin; ti e kontrollon para ruajtjes.");
  window.setTimeout(() => els.quickAddAiInput?.focus(), 40);
}

function closeQuickAdd() {
  stopQuickAddVoice({ discard: true });
  if (els.quickAddOverlay) els.quickAddOverlay.hidden = true;
  if (els.quickAddAiInput) els.quickAddAiInput.value = "";
  setQuickAddAiStatus("Shkruaj ose fol; AI e përgatit zërin dhe ti e kontrollon para ruajtjes.");
}

async function toggleQuickAddVoice() {
  if (quickAddRecorder?.state === "recording") {
    stopQuickAddVoice();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    setQuickAddAiStatus("Ky browser nuk mbështet regjistrimin e zërit. Përdor tekstin.");
    return;
  }

  try {
    quickAddVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    quickAddVoiceChunks = [];

    const preferredTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
    quickAddRecorder = mimeType
      ? new MediaRecorder(quickAddVoiceStream, { mimeType })
      : new MediaRecorder(quickAddVoiceStream);

    quickAddRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) quickAddVoiceChunks.push(event.data);
    });

    quickAddRecorder.addEventListener("stop", async () => {
      const chunks = quickAddVoiceChunks;
      const recorderType = quickAddRecorder?.mimeType || "audio/webm";
      cleanupQuickAddVoice();

      if (!chunks.length) {
        setQuickAddAiStatus("Nuk u regjistrua zë. Provoje përsëri.");
        return;
      }

      const audio = new Blob(chunks, { type: recorderType });
      await transcribeQuickAddVoice(audio);
    });

    quickAddRecorder.start();
    els.quickAddVoiceBtn?.classList.add("is-recording");
    els.quickAddVoiceBtn?.setAttribute("aria-pressed", "true");
    if (els.quickAddVoiceBtn) {
      els.quickAddVoiceBtn.setAttribute("aria-label", "Ndal regjistrimin");
      els.quickAddVoiceBtn.setAttribute("title", "Ndal regjistrimin");
    }
    setQuickAddAiStatus("Po dëgjoj... Thuaje shpenzimin ose të ardhurën dhe shtyp përsëri mikrofonin.");

    quickAddVoiceTimer = window.setTimeout(() => stopQuickAddVoice(), VOICE_MAX_RECORDING_MS);
  } catch (error) {
    cleanupQuickAddVoice();
    const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
    setQuickAddAiStatus(
      denied
        ? "Mikrofoni nuk u lejua. Jep leje për mikrofonin në browser dhe provo përsëri."
        : "Nuk u hap dot mikrofoni. Provoje përsëri.",
    );
  }
}

function stopQuickAddVoice({ discard = false } = {}) {
  if (quickAddVoiceTimer) {
    window.clearTimeout(quickAddVoiceTimer);
    quickAddVoiceTimer = null;
  }

  if (quickAddRecorder?.state === "recording") {
    if (discard) {
      quickAddVoiceChunks = [];
      quickAddRecorder.ondataavailable = null;
    }
    quickAddRecorder.stop();
    return;
  }

  cleanupQuickAddVoice();
}

function cleanupQuickAddVoice() {
  if (quickAddVoiceTimer) {
    window.clearTimeout(quickAddVoiceTimer);
    quickAddVoiceTimer = null;
  }
  quickAddVoiceStream?.getTracks?.().forEach((track) => track.stop());
  quickAddVoiceStream = null;
  quickAddRecorder = null;
  if (els.quickAddVoiceBtn) {
    els.quickAddVoiceBtn.classList.remove("is-recording");
    els.quickAddVoiceBtn.setAttribute("aria-pressed", "false");
    els.quickAddVoiceBtn.setAttribute("aria-label", "Fol");
    els.quickAddVoiceBtn.setAttribute("title", "Fol");
  }
}

async function transcribeQuickAddVoice(audioBlob) {
  setQuickAddAiBusy(true);
  if (els.quickAddVoiceBtn) els.quickAddVoiceBtn.disabled = true;
  setQuickAddAiStatus("Po kthehet zëri në tekst...");

  try {
    const endpoint = transcribeAiEndpoint();
    let token = receiptAiToken();
    let response = await sendTranscriptionRequest(endpoint, token, audioBlob);
    let result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem(RECEIPT_AI_TOKEN_KEY);
      token = prompt("Ky backend kërkon kod aksesi. Vendose kodin që krijove në Cloudflare.")?.trim() || "";
      if (!token) throw new Error("U anulua vendosja e kodit të aksesit.");
      localStorage.setItem(RECEIPT_AI_TOKEN_KEY, token);
      response = await sendTranscriptionRequest(endpoint, token, audioBlob);
      result = await response.json().catch(() => ({}));
    }

    if (!response.ok) throw new Error(result.error || "Zëri nuk u kthye në tekst.");

    const transcript = String(result.text || "").trim().slice(0, 220);
    if (!transcript) throw new Error("Nuk u dëgjua tekst i qartë.");

    if (els.quickAddAiInput) els.quickAddAiInput.value = transcript;
    setQuickAddAiStatus(`U dëgjua: “${transcript}” — po e kuptoj me AI...`);
    await handleQuickAddAi();
  } catch (error) {
    setQuickAddAiStatus(error?.message || "Zëri nuk u përpunua.");
  } finally {
    setQuickAddAiBusy(false);
    if (els.quickAddVoiceBtn) els.quickAddVoiceBtn.disabled = false;
  }
}

async function sendTranscriptionRequest(endpoint, token, audioBlob) {
  const formData = new FormData();
  const extension = audioBlob.type.includes("mp4") ? "m4a" : audioBlob.type.includes("ogg") ? "ogg" : "webm";
  formData.append("audio", audioBlob, `voice.${extension}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), RECEIPT_AI_TIMEOUT_MS);
  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: token ? { "X-Receipt-Token": token } : {},
      body: formData,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function transcribeAiEndpoint() {
  const url = new URL(receiptAiEndpoint());
  url.pathname = "/api/transcribe";
  return url.toString();
}

async function handleQuickAddAi() {
  const text = String(els.quickAddAiInput?.value || "").trim();
  if (!text) {
    setQuickAddAiStatus("Shkruaj një fjali, p.sh. “2400 lekë karburant sot”.");
    els.quickAddAiInput?.focus();
    return;
  }

  setQuickAddAiBusy(true);
  setQuickAddAiStatus("Po përgatitet zëri...");

  try {
    const endpoint = quickAddAiEndpoint();
    let token = receiptAiToken();
    let response = await sendQuickAddRequest(endpoint, token, text);
    let result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem(RECEIPT_AI_TOKEN_KEY);
      token = prompt("Ky backend kërkon kod aksesi. Vendose kodin që krijove në Cloudflare.")?.trim() || "";
      if (!token) throw new Error("U anulua vendosja e kodit të aksesit.");
      localStorage.setItem(RECEIPT_AI_TOKEN_KEY, token);
      setQuickAddAiStatus("Po provohet me kodin e ri...");
      response = await sendQuickAddRequest(endpoint, token, text);
      result = await response.json().catch(() => ({}));
    }

    if (!response.ok) throw new Error(result.error || "AI nuk e kuptoi zërin.");

    const parsed = validateQuickAddResult(result);
    closeQuickAdd();
    openEntryEditor(parsed.type);
    applyQuickAddResult(parsed);

    const accountNote = parsed.suggestedAccountName ? ` Llogaria: ${parsed.suggestedAccountName}.` : "";
    const confidenceNote = parsed.confidence < 0.7 ? " Kontrolloje me kujdes." : "";
    const warningNote = parsed.warning ? ` ${parsed.warning}` : "";
    setReceiptAiStatus(`U përgatit nga teksti.${accountNote}${confidenceNote}${warningNote}`);
  } catch (error) {
    const message = error?.name === "AbortError" ? "AI po vonon. Provoje përsëri." : error?.message;
    setQuickAddAiStatus(message || "AI nuk e kuptoi zërin.");
  } finally {
    setQuickAddAiBusy(false);
  }
}

async function sendQuickAddRequest(endpoint, token, text) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), RECEIPT_AI_TIMEOUT_MS);
  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "X-Receipt-Token": token } : {}),
      },
      body: JSON.stringify({
        text,
        today: todayIso(),
        expenseCategories: getCategories("expense"),
        incomeCategories: getCategories("income"),
        accounts: state.banks.map((bank) => ({
          id: bank.id,
          name: bank.name,
          currency: bank.currency,
        })),
      }),
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function quickAddAiEndpoint() {
  const url = new URL(receiptAiEndpoint());
  url.pathname = "/api/quick-add";
  return url.toString();
}

function validateQuickAddResult(result) {
  if (!result || typeof result !== "object") throw new Error("Përgjigjja e AI nuk është e vlefshme.");

  const type = result.type === "income" ? "income" : result.type === "expense" ? "expense" : "";
  if (!type) throw new Error("Nuk u kuptua nëse është shpenzim apo e ardhur.");

  const amount = Number(result.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Nuk u kuptua një vlerë e vlefshme.");

  if (!isRecognizedCurrency(result.currency)) throw new Error("Nuk u kuptua monedha.");
  const currency = normalizeCurrency(result.currency);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(result.date || "")) ? String(result.date) : todayIso();
  const description = String(result.description || "Zë").trim().slice(0, 60) || "Zë";
  const allowedCategories = getCategories(type);
  const category = categoryExists(type, result.category)
    ? allowedCategories.find((item) => item.toLowerCase() === normalizeCategoryName(result.category).toLowerCase())
    : allowedCategories.find((item) => item.toLowerCase() === "tjetër") || allowedCategories[0];

  const suggestedBank = findBank(String(result.suggestedAccountId || "").trim());
  let suggestedAccountId = suggestedBank && suggestedBank.currency === currency ? suggestedBank.id : "";

  if (!suggestedAccountId && type === "expense" && !["Biznes", "Abonime"].includes(category)) {
    const personalBank = state.banks.find(
      (bank) => bank.currency === currency && /personale/i.test(bank.name),
    );
    if (personalBank) suggestedAccountId = personalBank.id;
  }

  const suggestedAccountName = suggestedAccountId ? findBank(suggestedAccountId)?.name || "" : "";
  const confidence = Math.min(Math.max(Number(result.confidence) || 0, 0), 1);
  const warning = String(result.warning || "").trim().slice(0, 160);

  return {
    type,
    amount,
    currency,
    date,
    description,
    category,
    suggestedAccountId,
    suggestedAccountName,
    confidence,
    warning,
  };
}

function applyQuickAddResult(result) {
  state.type = result.type;
  syncTypeControls();
  els.currencyInput.value = result.currency;
  renderBankOptions();
  if (result.suggestedAccountId) els.bankInput.value = result.suggestedAccountId;
  els.amountInput.value = String(result.amount);
  els.noteInput.value = result.description;
  els.categoryInput.value = result.category;
  els.dateInput.value = result.date;
}

function setQuickAddAiStatus(text) {
  if (els.quickAddAiStatus) els.quickAddAiStatus.textContent = text;
}

function setQuickAddAiBusy(isBusy) {
  if (els.quickAddAiBtn) els.quickAddAiBtn.disabled = isBusy;
  if (els.quickAddAiInput) els.quickAddAiInput.disabled = isBusy;
  if (els.quickAddVoiceBtn && quickAddRecorder?.state !== "recording") els.quickAddVoiceBtn.disabled = isBusy;
}

function chooseQuickAddType(type) {
  closeQuickAdd();
  openEntryEditor(type === "income" ? "income" : "expense");
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
  document.body.classList.add("entry-editor-open");
  els.amountInput.focus();
}

function closeEntryEditor() {
  state.editingEntryId = "";
  els.entryOverlay.hidden = true;
  document.body.classList.remove("entry-editor-open");
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

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  state.banks = state.banks.filter((item) => item.id !== bank.id);
  state.entries = state.entries.map((entry) => (entry.bankId === bank.id ? { ...entry, bankId: "" } : entry));
  state.goals = normalizeGoals(state.goals).map((goal) => (goal.bankId === bank.id ? { ...goal, bankId: "" } : goal));
  ensureDefaultBanks();
  saveBanks();
  saveEntries();
  saveGoals();
  closeAccountEditor();
  render();
  showUndoToast("Llogaria u fshi.", () => restoreFinanceSnapshot(snapshot));
}

function handleEntryListClick(event) {
  const editButton = event.target.closest("[data-edit-entry]");
  const duplicateButton = event.target.closest("[data-duplicate-entry]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    openEntryEditor(undefined, editButton.dataset.editEntry);
    return;
  }

  if (duplicateButton) {
    duplicateEntry(duplicateButton.dataset.duplicateEntry);
    return;
  }

  if (!deleteButton) return;
  deleteEntry(deleteButton.dataset.delete);
}

function duplicateEntry(entryId) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (!entry) return;

  openEntryEditor(entry.type);
  els.amountInput.value = entry.amount;
  els.noteInput.value = entry.note;
  els.dateInput.value = todayIso();
  els.currencyInput.value = normalizeCurrency(entry.currency);
  syncTypeControls();
  els.categoryInput.value = entry.category;
  renderBankOptions();
  if (entry.bankId && findBank(entry.bankId)) els.bankInput.value = entry.bankId;
  setText(els.submitLabel, entry.type === "income" ? "Shto kopjen e të ardhurës" : "Shto kopjen e shpenzimit");
}

function deleteEntry(entryId, options = {}) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (!entry) return;
  if (!confirm("A dëshiron ta fshish këtë zë?")) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  if (entry.bankId) applyBankDelta(entry.bankId, entry.type === "income" ? -entry.amount : entry.amount);
  state.entries = state.entries.filter((item) => item.id !== entry.id);
  saveBanks();
  saveEntries();
  if (options.closeEditor) closeEntryEditor();
  render();
  showUndoToast(entry.type === "income" ? "E ardhura u fshi." : "Shpenzimi u fshi.", () => restoreFinanceSnapshot(snapshot));
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
  state.archiveSearch.expense = "";
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
  state.archiveSearch.income = "";
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
  const query = archiveSearchQuery(type);
  const months = entryMonths(type, query);
  const currentMonth = monthKey(new Date());
  const hasCurrentMonth = months.some((month) => month.key === currentMonth);
  const list = type === "income" ? els.incomeArchiveList : els.expenseArchiveList;
  const emptyText = query
    ? `Nuk u gjet asnjë zë për “${escapeHtml(state.archiveSearch[type])}”.`
    : type === "income"
      ? "Nuk ka të ardhura për t'u shfaqur."
      : "Nuk ka shpenzime për t'u shfaqur.";

  syncArchiveSearchControls(type);
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

function entryMonths(type, query = "") {
  const groups = new Map();
  const sortedEntries = state.entries
    .filter((entry) => entry.type === type && entryMatchesSearch(entry, query))
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

function archiveSearchQuery(type) {
  return normalizeSearchText(state.archiveSearch[type]);
}

function syncArchiveSearchControls(type) {
  const input = type === "income" ? els.incomeArchiveSearch : els.expenseArchiveSearch;
  const clearButton = type === "income" ? els.incomeArchiveSearchClear : els.expenseArchiveSearchClear;
  if (input && input.value !== state.archiveSearch[type]) input.value = state.archiveSearch[type];
  if (clearButton) clearButton.hidden = !archiveSearchQuery(type);
}

function updateArchiveSearch(type, value) {
  state.archiveSearch[type] = value;
  renderEntryArchive(type);
}

function clearArchiveSearch(type) {
  state.archiveSearch[type] = "";
  renderEntryArchive(type);
  const input = type === "income" ? els.incomeArchiveSearch : els.expenseArchiveSearch;
  input?.focus({ preventScroll: true });
}

function entryMatchesSearch(entry, query) {
  if (!query) return true;
  return entrySearchText(entry).includes(query);
}

function entrySearchText(entry) {
  const bank = findBank(entry.bankId);
  const values = [
    entry.note,
    entry.category,
    entry.currency,
    entry.type === "income" ? "te ardhura income hyrje" : "shpenzim expense dalje",
    bank?.name,
    formatDate(entry.date),
    monthLabel(entry.date.slice(0, 7)),
    entry.amount,
  ];
  return normalizeSearchText(values.filter(Boolean).join(" "));
}

function normalizeSearchText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
      <div class="entry-actions">
        <button class="duplicate-entry-button" type="button" data-duplicate-entry="${entry.id}">Kopjo</button>
        <button class="edit-entry-button" type="button" data-edit-entry="${entry.id}">Edit</button>
        <button class="delete-entry-button" type="button" data-delete="${entry.id}">Fshi</button>
      </div>
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

  const selectedCategory = els.categoryInput.value;
  const options = getCategories(state.type);
  els.categoryInput.innerHTML = options.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  if (options.includes(selectedCategory)) els.categoryInput.value = selectedCategory;
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

    state.type = "expense";
    syncTypeControls();
    setReceiptAiStatus("Po lexohet fatura...");
    setReceiptAiBusy(true);

    const image = await resizeReceiptImage(file);
    if (image.size > RECEIPT_AI_MAX_IMAGE_BYTES) {
      throw new Error("Fotoja është shumë e madhe. Provo një foto tjetër.");
    }

    let token = receiptAiToken();
    let response = await sendReceiptRequest(endpoint, token, image);
    let result = await response.json().catch(() => ({}));
    if (response.status === 401) {
      localStorage.removeItem(RECEIPT_AI_TOKEN_KEY);
      token = prompt("Ky backend kërkon kod aksesi. Vendose kodin që krijove në Cloudflare.")?.trim() || "";
      if (!token) throw new Error("Nevojitet kodi i aksesit për AI.");
      localStorage.setItem(RECEIPT_AI_TOKEN_KEY, token);
      setReceiptAiStatus("Po provohet me kodin e ri...");
      response = await sendReceiptRequest(endpoint, token, image);
      result = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      throw new Error(result.error || "Fatura nuk u lexua.");
    }

    const receipt = validateReceiptResult(result);

    if (els.quickAddOverlay && !els.quickAddOverlay.hidden) {
      closeQuickAdd();
      openEntryEditor("expense");
    }

    applyReceiptResult(receipt);
    const confidenceNote = receipt.confidence < 0.7 ? " Leximi nuk është plotësisht i sigurt." : "";
    const accountNote = receipt.suggestedAccountName ? ` Llogaria e propozuar: ${receipt.suggestedAccountName}.` : "";
    const warningNote = receipt.warning ? ` ${receipt.warning}` : "";
    setReceiptAiStatus(`U mbush nga fatura. Kontrolloje para se ta ruash.${accountNote}${confidenceNote}${warningNote}`);
  } catch (error) {
    const message = error?.name === "AbortError" ? "Leximi zgjati shumë. Provoje përsëri." : error?.message;
    setReceiptAiStatus(message || "Fatura nuk u lexua.");
  } finally {
    setReceiptAiBusy(false);
    event.target.value = "";
  }
}

async function sendReceiptRequest(endpoint, token, image) {
  const formData = new FormData();
  formData.append("receipt", image, image.name || "receipt.jpg");
  formData.append("categories", JSON.stringify(getCategories("expense")));
  formData.append("today", todayIso());
  formData.append("accounts", JSON.stringify(
    state.banks.map((bank) => ({
      id: bank.id,
      name: bank.name,
      currency: bank.currency,
    })),
  ));
  const headers = token ? { "X-Receipt-Token": token } : {};
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), RECEIPT_AI_TIMEOUT_MS);
  try {
    return await fetch(endpoint, { method: "POST", headers, body: formData, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function resetReceiptAiConnection() {
  localStorage.removeItem(RECEIPT_AI_TOKEN_KEY);
  setReceiptAiStatus("Kodi i AI u rivendos. Kliko Foto fature për ta vendosur përsëri.");
}

function receiptAiEndpoint() {
  // Backend-i i këtij aplikacioni është fiks dhe nuk i kërkohet më përdoruesit.
  return normalizeReceiptAiEndpoint("https://financat-e-mia-ai.dorielezaj.workers.dev");
}

function receiptAiToken() {
  return localStorage.getItem(RECEIPT_AI_TOKEN_KEY)?.trim() || "";
}

function normalizeReceiptAiEndpoint(value) {
  let url;
  try {
    url = new URL(String(value).trim());
  } catch {
    throw new Error("Adresa e AI backend nuk është e vlefshme.");
  }

  const localDevelopment = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(localDevelopment && url.protocol === "http:")) {
    throw new Error("AI backend duhet të përdorë HTTPS.");
  }
  if (url.pathname === "/" || url.pathname === "") url.pathname = "/api/receipt";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function validateReceiptResult(result) {
  if (!result || typeof result !== "object") throw new Error("Përgjigjja e AI nuk është e vlefshme.");
  if (result.isReceipt === false) throw new Error(result.warning || "Fotoja nuk duket si faturë.");

  const amount = Number(result.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Nuk u gjet një total i vlefshëm në faturë.");
  }

  if (!isRecognizedCurrency(result.currency)) throw new Error("Nuk u dallua monedha e faturës.");
  const currency = normalizeCurrency(result.currency);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(result.date || "")) ? String(result.date) : todayIso();
  const description = String(result.description || result.merchant || "Faturë").trim().slice(0, 60) || "Faturë";
  const expenseCategories = getCategories("expense");
  const category = categoryExists("expense", result.category)
    ? expenseCategories.find((item) => item.toLowerCase() === normalizeCategoryName(result.category).toLowerCase())
    : expenseCategories.find((item) => item.toLowerCase() === "tjetër") || expenseCategories[0];
  const confidence = Math.min(Math.max(Number(result.confidence) || 0, 0), 1);
  const warning = String(result.warning || "").trim().slice(0, 160);
  const suggestedBank = findBank(String(result.suggestedAccountId || "").trim());
  const suggestedAccountId = suggestedBank && suggestedBank.currency === currency ? suggestedBank.id : "";
  const suggestedAccountName = suggestedAccountId ? suggestedBank.name : "";

  return {
    amount,
    currency,
    date,
    description,
    category,
    confidence,
    warning,
    suggestedAccountId,
    suggestedAccountName,
  };
}

function applyReceiptResult(result) {
  els.currencyInput.value = result.currency;
  renderBankOptions();
  if (result.suggestedAccountId) els.bankInput.value = result.suggestedAccountId;
  els.amountInput.value = String(result.amount);
  els.categoryInput.value = result.category;
  els.noteInput.value = result.description;
  els.dateInput.value = result.date;
}

function setReceiptAiStatus(text) {
  els.receiptAiStatus.textContent = text;
}

function setReceiptAiBusy(isBusy) {
  els.receiptAiTools?.classList.toggle("is-loading", isBusy);
  if (els.receiptImageInput) els.receiptImageInput.disabled = isBusy;
  if (els.resetReceiptAiBtn) els.resetReceiptAiBtn.disabled = isBusy;
  els.receiptAiTools?.setAttribute("aria-busy", String(isBusy));
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
    version: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    entries: state.entries,
    banks: state.banks,
    recurringExpenses: state.recurringExpenses,
    netWorthHistory: state.netWorthHistory,
    limits: state.limits,
    savingsGoal: state.savingsGoal,
    goals: normalizeGoals(state.goals),
    categories: normalizeCategoriesData(state.categories),
    exchangeRate: state.exchangeRate,
    setupComplete: state.setupComplete,
    homeOrder: currentHomeOrder(),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `financat-e-mia-${todayIso()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showInfoToast("Backup-u JSON u shkarkua.");
}

function importData(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const imported = normalizeImportedBackup(parsed);
      if (!imported.hasSupportedData) {
        throw new Error("Ky backup nuk ka të dhëna financiare të njohura.");
      }
      state.pendingImport = imported;
      renderImportPreview(imported);
      if (els.importPreviewOverlay) els.importPreviewOverlay.hidden = false;
    } catch (error) {
      alert(error?.message || "Nuk u importuan të dhënat. Kontrollo skedarin JSON.");
    } finally {
      event.target.value = "";
    }
  };
  reader.onerror = () => {
    event.target.value = "";
    alert("Skedari nuk u lexua. Provoje përsëri.");
  };
  reader.readAsText(file);
}

function renderImportPreview(imported) {
  if (!els.importPreviewSummary || !els.importPreviewWarning) return;
  const range = imported.dateRange;
  const period = range.from
    ? range.from === range.to
      ? formatSlashDate(range.from)
      : `${formatSlashDate(range.from)} – ${formatSlashDate(range.to)}`
    : "Pa zëra me datë";
  const cards = [
    ["Versioni", `v${imported.version}`],
    ["Zërat", String(imported.entries.length)],
    ["Llogaritë", String(imported.banks.length)],
    ["Objektivat", String(imported.goals.length)],
    ["Periudha", period],
    ["Veprimi", imported.isCompleteBackup ? "Zëvendësim" : "Përditësim"],
  ];
  els.importPreviewSummary.innerHTML = cards
    .map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`)
    .join("");

  const warnings = [];
  if (imported.version < 9) warnings.push("Backup i vjetër: fushat e reja do të përshtaten automatikisht.");
  if (imported.invalidEntryCount || imported.invalidBankCount) {
    warnings.push(`${imported.invalidEntryCount} zëra dhe ${imported.invalidBankCount} llogari të pavlefshme do të anashkalohen.`);
  }
  const currentMonth = monthKey(new Date());
  if (imported.entries.length && !imported.entries.some((entry) => entry.date.startsWith(currentMonth))) {
    warnings.push(`Nuk ka zëra për ${monthLabel(currentMonth)}; kartat e muajit aktual do të shfaqin zero.`);
  }
  warnings.push("Para importit ruhet automatikisht një kopje e gjendjes aktuale.");
  els.importPreviewWarning.textContent = warnings.join(" ");
}

function closeImportPreview() {
  state.pendingImport = null;
  if (els.importPreviewOverlay) els.importPreviewOverlay.hidden = true;
}

function confirmPendingImport() {
  const imported = state.pendingImport;
  if (!imported) return;

  const snapshot = snapshotFinanceState();
  createAutoBackup();
  applyImportedBackup(imported);
  persistFinanceState();
  state.pendingImport = null;
  closePanelsAfterImport();
  syncTypeControls();
  if (els.eurToLekRateInput) els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
  render();
  requestAnimationFrame(() => {
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  showUndoToast(importSummaryText(imported), () => restoreFinanceSnapshot(snapshot));
}

function normalizeImportedBackup(parsed) {
  const isEntryList = Array.isArray(parsed);
  if (!isEntryList && (!parsed || typeof parsed !== "object")) {
    throw new Error("Skedari JSON nuk ka format të vlefshëm.");
  }

  const source = isEntryList ? { entries: parsed } : parsed;
  const rawEntries = Array.isArray(source.entries) ? source.entries : [];
  const validEntries = rawEntries.filter(isValidEntry).map(normalizeEntryForImport);
  if (rawEntries.length && !validEntries.length) {
    throw new Error("Backup-i ka zëra, por asnjë prej tyre nuk ka vlerë dhe datë të vlefshme.");
  }
  const entries = mergeEntries([], validEntries);
  const rawBanks = Array.isArray(source.banks) ? source.banks : [];
  const banks = rawBanks.length
    ? normalizeBanks(rawBanks.filter(isValidBank))
    : legacySavingsToBanks(normalizeMoneyTotals(source.savings));
  if (rawBanks.length && !banks.length) {
    throw new Error("Backup-i ka llogari, por asnjë prej tyre nuk është e vlefshme.");
  }
  const recurringExpenses = normalizeRecurringExpenses(source.recurringExpenses || []);
  const importedRate = Number(source.exchangeRate);
  const exchangeRate = Number.isFinite(importedRate) && importedRate > 0 ? importedRate : DEFAULT_EUR_TO_ALL_RATE;
  const limits = source.limits ? normalizeLimits(source.limits) : { ...DEFAULT_LIMITS };
  const hasSavingsGoal = Boolean(source.savingsGoal && typeof source.savingsGoal === "object");
  let savingsGoal = hasSavingsGoal
    ? normalizeSavingsGoal(source.savingsGoal)
    : normalizeSavingsGoal({ amount: 0, currency: DEFAULT_SAVINGS_GOAL.currency, months: DEFAULT_SAVINGS_GOAL.months });
  let goals = Array.isArray(source.goals) ? normalizeGoals(source.goals) : [];

  if (!Array.isArray(source.goals) && hasSavingsGoal && savingsGoal.amount > 0) {
    goals = [goalFromSavingsGoal(savingsGoal, { name: "Objektivi kryesor" })];
  }
  if (!hasSavingsGoal && goals.length) savingsGoal = normalizeSavingsGoal(goals.find((goal) => goal.active !== false) || goals[0]);

  const categorySeed = source.categories ? normalizeCategoriesData(source.categories) : cloneDefaultCategories();
  const categories = learnCategoriesFromData(categorySeed, entries, recurringExpenses);
  const referenceDate = importedReferenceDate(source, entries);
  let netWorthHistory = normalizeNetWorthHistory(source.netWorthHistory || source.netWorth || [], exchangeRate);
  if (!netWorthHistory.length && banks.length) {
    netWorthHistory = [netWorthSnapshotFromBanks(banks, exchangeRate, referenceDate)];
  }

  const supportedFields = [
    "entries",
    "banks",
    "savings",
    "recurringExpenses",
    "netWorthHistory",
    "netWorth",
    "limits",
    "savingsGoal",
    "goals",
    "categories",
    "exchangeRate",
    "setupComplete",
    "homeOrder",
  ];
  const hasSupportedData = isEntryList || supportedFields.some((key) => Object.prototype.hasOwnProperty.call(source, key));
  const hasFullBackupFields = [
    "banks",
    "savings",
    "recurringExpenses",
    "netWorthHistory",
    "netWorth",
    "limits",
    "savingsGoal",
    "goals",
    "categories",
    "exchangeRate",
    "setupComplete",
    "homeOrder",
  ].some((key) => Object.prototype.hasOwnProperty.call(source, key));

  return {
    isCompleteBackup: !isEntryList && (source.app === "financat-e-mia" || hasFullBackupFields),
    version: Number(source.version) || 1,
    entries,
    invalidEntryCount: Math.max(rawEntries.length - validEntries.length, 0),
    banks,
    invalidBankCount: Math.max(rawBanks.length - banks.length, 0),
    recurringExpenses,
    netWorthHistory,
    limits,
    savingsGoal,
    goals,
    categories,
    exchangeRate,
    setupComplete: Object.prototype.hasOwnProperty.call(source, "setupComplete") ? Boolean(source.setupComplete) : true,
    homeOrder: Array.isArray(source.homeOrder) ? normalizeHomeOrder(source.homeOrder) : null,
    referenceDate,
    dateRange: entryDateRange(entries),
    hasSupportedData,
  };
}

function applyImportedBackup(imported) {
  if (imported.isCompleteBackup) {
    state.banks = imported.banks;
    state.entries = reconcileEntryBankReferences(imported.entries, state.banks);
    state.recurringExpenses = imported.recurringExpenses;
    state.netWorthHistory = imported.netWorthHistory;
    state.limits = imported.limits;
    state.savingsGoal = imported.savingsGoal;
    state.goals = imported.goals;
    state.categories = imported.categories;
    state.exchangeRate = imported.exchangeRate;
    state.setupComplete = imported.setupComplete;
    if (Array.isArray(imported.homeOrder)) state.homeOrder = imported.homeOrder;
  } else {
    state.entries = mergeEntries(state.entries, reconcileEntryBankReferences(imported.entries, state.banks));
    state.categories = learnCategoriesFromData(state.categories, state.entries, state.recurringExpenses);
  }

  ensureDefaultBanks();
  syncPrimarySavingsGoal();
  applyHomeOrder(state.homeOrder);
}

function reconcileEntryBankReferences(entries, banks) {
  const bankIds = new Set((Array.isArray(banks) ? banks : []).map((bank) => bank.id));
  return entries.map((entry) => ({
    ...entry,
    bankId: entry.bankId && bankIds.has(entry.bankId) ? entry.bankId : "",
  }));
}

function persistFinanceState() {
  saveEntries();
  saveBanks();
  saveRecurringExpenses();
  saveNetWorthHistory();
  saveLimits();
  saveSavingsGoal();
  saveGoals();
  saveCategories();
  saveExchangeRate(state.exchangeRate);
  saveSetupComplete();
  saveHomeOrder(state.homeOrder);
}

function closePanelsAfterImport() {
  document.querySelectorAll(".editor-overlay").forEach((overlay) => {
    overlay.hidden = true;
  });
  state.activeZone = "home";
  state.editingEntryId = "";
  state.editingRecurringId = "";
  state.editingGoalId = "";
  document.body.classList.remove("entry-editor-open", "goal-editor-open", "profile-menu-open");
  if (els.themeToggle) els.themeToggle.setAttribute("aria-expanded", "false");
  syncZoneNav();
}

function importedReferenceDate(source, entries) {
  const exportedDate = normalizeImportedDate(source.exportedAt);
  if (exportedDate) return exportedDate;
  const range = entryDateRange(entries);
  return range.to || todayIso();
}

function normalizeImportedDate(value) {
  const candidate = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return "";
  const date = parseLocalDate(candidate);
  return Number.isNaN(date.getTime()) || toLocalIso(date) !== candidate ? "" : candidate;
}

function entryDateRange(entries) {
  const dates = entries.map((entry) => normalizeImportedDate(entry.date)).filter(Boolean).sort();
  return { from: dates[0] || "", to: dates[dates.length - 1] || "" };
}

function netWorthSnapshotFromBanks(banks, exchangeRate, date) {
  const totals = banks.reduce((sum, bank) => {
    sum[normalizeCurrency(bank.currency)] += Number(bank.balance) || 0;
    return sum;
  }, emptyMoneyTotals());
  const totalLek = totals.ALL + totals.EUR * exchangeRate;
  return {
    date: normalizeImportedDate(date) || todayIso(),
    totalLek,
    totalEuro: exchangeRate > 0 ? totalLek / exchangeRate : 0,
    accountsLek: totals.ALL,
    accountsEuro: totals.EUR,
    manual: true,
    updatedAt: new Date().toISOString(),
  };
}

function importSummaryText(imported) {
  const range = imported.dateRange;
  const rangeText = range.from
    ? range.from === range.to
      ? ` Data: ${formatSlashDate(range.from)}.`
      : ` Periudha: ${formatSlashDate(range.from)} – ${formatSlashDate(range.to)}.`
    : "";
  const skippedText = imported.invalidEntryCount || imported.invalidBankCount
    ? ` U anashkaluan ${imported.invalidEntryCount} zëra dhe ${imported.invalidBankCount} llogari të pavlefshme.`
    : "";
  const currentMonth = monthKey(new Date());
  const hasCurrentMonthEntries = imported.entries.some((entry) => entry.date.startsWith(currentMonth));
  const currentMonthText = !hasCurrentMonthEntries && imported.entries.length
    ? ` Kartat “Këtë muaj” tregojnë 0 sepse backup-i nuk ka zëra për ${monthLabel(currentMonth)}; historiku vjetor dhe gjendjet janë rifreskuar.`
    : " Të gjitha kartat dhe grafikët u rillogaritën.";

  return (
    `Importi u krye saktë: ${imported.entries.length} zëra, ${imported.banks.length} llogari, ` +
    `${imported.goals.length} objektiva dhe kursi 1€ = ${formatRateInput(imported.exchangeRate)} L.` +
    rangeText + skippedText + currentMonthText
  );
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

function loadNetWorthHistory() {
  try {
    return normalizeNetWorthHistory(JSON.parse(localStorage.getItem(NET_WORTH_HISTORY_KEY)), loadExchangeRate());
  } catch {
    return [];
  }
}

function saveNetWorthHistory() {
  localStorage.setItem(NET_WORTH_HISTORY_KEY, JSON.stringify(normalizeNetWorthHistory(state.netWorthHistory, state.exchangeRate)));
}

function normalizeNetWorthHistory(items, exchangeRate = DEFAULT_EUR_TO_ALL_RATE) {
  if (!Array.isArray(items)) return [];
  const safeRate = Number(exchangeRate) > 0 ? Number(exchangeRate) : DEFAULT_EUR_TO_ALL_RATE;

  return items
    .map((item) => {
      const rawDate = String(item?.date || item?.savedAt || item?.updatedAt || "").slice(0, 10);
      const date = normalizeImportedDate(rawDate) || todayIso();
      const accountsLek = Number(item?.accountsLek ?? item?.ALL) || 0;
      const accountsEuro = Number(item?.accountsEuro ?? item?.EUR) || 0;
      const totalLekValue = Number(item?.totalLek);
      const totalLek = Number.isFinite(totalLekValue) ? totalLekValue : accountsLek + accountsEuro * safeRate;
      const totalEuroValue = Number(item?.totalEuro);

      return {
        date,
        totalLek,
        totalEuro: Number.isFinite(totalEuroValue) ? totalEuroValue : totalLek / safeRate,
        accountsLek,
        accountsEuro,
        manual: Boolean(item?.manual),
        updatedAt: typeof item?.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
      };
    })
    .filter((item) => item.date && Number.isFinite(item.totalLek))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function mergeNetWorthHistory(current = [], imported = [], exchangeRate = DEFAULT_EUR_TO_ALL_RATE) {
  const byDate = new Map();

  [...normalizeNetWorthHistory(current, exchangeRate), ...normalizeNetWorthHistory(imported, exchangeRate)].forEach((item) => {
    const existing = byDate.get(item.date);
    const itemTime = Date.parse(item.updatedAt) || 0;
    const existingTime = existing ? Date.parse(existing.updatedAt) || 0 : 0;
    if (!existing || item.manual || itemTime >= existingTime) {
      byDate.set(item.date, item);
    }
  });

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function loadRecurringExpenses() {
  try {
    return normalizeRecurringExpenses(JSON.parse(localStorage.getItem(RECURRING_KEY)));
  } catch {
    return [];
  }
}

function saveRecurringExpenses() {
  localStorage.setItem(RECURRING_KEY, JSON.stringify(state.recurringExpenses));
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

function loadSavingsGoal() {
  try {
    return normalizeSavingsGoal(JSON.parse(localStorage.getItem(SAVINGS_GOAL_KEY)));
  } catch {
    return { ...DEFAULT_SAVINGS_GOAL };
  }
}

function normalizeSavingsGoal(goal) {
  const months = Number(goal?.months) || Number(goal?.period) || DEFAULT_SAVINGS_GOAL.months;
  const amount = Number(goal?.amount);
  return {
    amount: Number.isFinite(amount) ? Math.max(amount, 0) : DEFAULT_SAVINGS_GOAL.amount,
    currency: normalizeCurrency(goal?.currency || DEFAULT_SAVINGS_GOAL.currency),
    months: [1, 2, 6, 12].includes(months) ? months : DEFAULT_SAVINGS_GOAL.months,
  };
}

function saveSavingsGoal() {
  localStorage.setItem(SAVINGS_GOAL_KEY, JSON.stringify(state.savingsGoal));
}

function cloneDefaultCategories() {
  return {
    expense: [...DEFAULT_CATEGORIES.expense],
    income: [...DEFAULT_CATEGORIES.income],
  };
}

function normalizeCategoryName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 32);
}

function addCategoryToList(list, value) {
  const name = normalizeCategoryName(value);
  const next = Array.isArray(list) ? [...list] : [];
  if (!name) return next;
  return next.some((item) => String(item).toLowerCase() === name.toLowerCase()) ? next : [...next, name];
}

function normalizeCategoriesData(data) {
  const next = cloneDefaultCategories();

  ["expense", "income"].forEach((type) => {
    const source = Array.isArray(data?.[type]) ? data[type] : [];
    source.forEach((category) => {
      next[type] = addCategoryToList(next[type], category);
    });
    if (!next[type].some((category) => category.toLowerCase() === "tjetër")) next[type].push("Tjetër");
  });

  return next;
}

function loadCategories() {
  try {
    return normalizeCategoriesData(JSON.parse(localStorage.getItem(CATEGORIES_KEY)));
  } catch {
    return cloneDefaultCategories();
  }
}

function saveCategories() {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(normalizeCategoriesData(state.categories)));
}

function getCategories(type = state.type) {
  const normalizedType = type === "income" ? "income" : "expense";
  return normalizeCategoriesData(state.categories)[normalizedType];
}

function categoryExists(type, value) {
  const name = normalizeCategoryName(value).toLowerCase();
  return getCategories(type).some((category) => category.toLowerCase() === name);
}

function categoryExistsInData(data, type, value) {
  const name = normalizeCategoryName(value).toLowerCase();
  return normalizeCategoriesData(data)[type === "income" ? "income" : "expense"].some((category) => category.toLowerCase() === name);
}

function isDefaultCategory(type, value) {
  const name = normalizeCategoryName(value).toLowerCase();
  return (DEFAULT_CATEGORIES[type === "income" ? "income" : "expense"] || []).some((category) => category.toLowerCase() === name);
}

function learnCategoriesFromData(base, entries = [], recurring = []) {
  const next = normalizeCategoriesData(base);

  entries.forEach((entry) => {
    const type = entry?.type === "income" ? "income" : "expense";
    next[type] = addCategoryToList(next[type], entry.category);
  });

  recurring.forEach((item) => {
    next.expense = addCategoryToList(next.expense, item.category);
  });

  return normalizeCategoriesData(next);
}

function mergeCategories(current, imported) {
  const next = normalizeCategoriesData(current);
  const source = normalizeCategoriesData(imported);

  ["expense", "income"].forEach((type) => {
    source[type].forEach((category) => {
      next[type] = addCategoryToList(next[type], category);
    });
  });

  return normalizeCategoriesData(next);
}

function loadGoals() {
  try {
    return normalizeGoals(JSON.parse(localStorage.getItem(GOALS_KEY)));
  } catch {
    return [];
  }
}

function saveGoals() {
  localStorage.setItem(GOALS_KEY, JSON.stringify(normalizeGoals(state.goals)));
}

function normalizeGoalName(value) {
  return (
    String(value || "Objektiv kursimi")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 60) || "Objektiv kursimi"
  );
}

function normalizeGoal(goal = {}, fallback = {}) {
  const months = Number(goal?.months) || Number(goal?.period) || Number(fallback.months) || DEFAULT_SAVINGS_GOAL.months;
  const amount = Math.max(Number(goal?.amount ?? fallback.amount ?? DEFAULT_SAVINGS_GOAL.amount) || 0, 0);
  const savedAmount = Math.max(Number(goal?.savedAmount ?? fallback.savedAmount) || 0, 0);
  const monthlyContribution = Math.max(Number(goal?.monthlyContribution ?? fallback.monthlyContribution) || 0, 0);
  const contributionMode = goal?.contributionMode === "automatic" ? "automatic" : "manual";

  return {
    id: String(goal?.id || fallback.id || crypto.randomUUID()),
    name: normalizeGoalName(goal?.name || fallback.name || "Objektiv kursimi"),
    amount,
    currency: normalizeCurrency(goal?.currency || fallback.currency || DEFAULT_SAVINGS_GOAL.currency),
    months: [1, 2, 6, 12].includes(months) ? months : DEFAULT_SAVINGS_GOAL.months,
    savedAmount,
    contributionMode,
    monthlyContribution,
    bankId: String(goal?.bankId || fallback.bankId || ""),
    active: goal?.active === false ? false : true,
    createdAt: typeof goal?.createdAt === "string" ? goal.createdAt : new Date().toISOString(),
    updatedAt: typeof goal?.updatedAt === "string" ? goal.updatedAt : new Date().toISOString(),
  };
}

function goalSavedAmount(goal, now = new Date()) {
  const normalized = normalizeGoal(goal);
  let saved = normalized.savedAmount;
  if (normalized.contributionMode === "automatic" && normalized.monthlyContribution > 0) {
    const created = new Date(normalized.createdAt);
    if (!Number.isNaN(created.getTime())) {
      const elapsedMonths = Math.max((now.getFullYear() - created.getFullYear()) * 12 + now.getMonth() - created.getMonth(), 0);
      saved += elapsedMonths * normalized.monthlyContribution;
    }
  }
  return Math.min(saved, normalized.amount || saved);
}

function goalSavedAmountLabel(goal, now = new Date()) {
  const saved = goalSavedAmount(goal, now);
  return normalizeCurrency(goal.currency) === "EUR" ? moneyEuroCompact(saved) : moneyLekShort(saved);
}

function goalSavedLek(goal, now = new Date()) {
  const saved = goalSavedAmount(goal, now);
  return normalizeCurrency(goal.currency) === "EUR" ? saved * state.exchangeRate : saved;
}

function normalizeGoals(goals) {
  if (!Array.isArray(goals)) return [];
  const seen = new Set();

  return goals
    .map((goal) => normalizeGoal(goal))
    .filter((goal) => {
      const key = goalKey(goal);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function goalFromSavingsGoal(goal, options = {}) {
  return normalizeGoal(
    {
      ...(goal || {}),
      id: options.id || "primary-savings-goal",
      name: options.name || "Objektivi kryesor",
      active: true,
    },
    { id: "primary-savings-goal" }
  );
}

function goalKey(goal) {
  return String(goal?.id || `${goal?.name}-${goal?.currency}-${goal?.amount}-${goal?.months}`).toLowerCase();
}

function mergeGoals(current = [], imported = []) {
  const map = new Map();
  [...normalizeGoals(current), ...normalizeGoals(imported)].forEach((goal) => {
    const existing = map.get(goalKey(goal));
    const goalTime = Date.parse(goal.updatedAt || goal.createdAt || "") || 0;
    const existingTime = existing ? Date.parse(existing.updatedAt || existing.createdAt || "") || 0 : 0;
    if (!existing || goalTime >= existingTime) map.set(goalKey(goal), goal);
  });

  return Array.from(map.values()).sort((a, b) => (Date.parse(a.createdAt || "") || 0) - (Date.parse(b.createdAt || "") || 0));
}

function syncPrimarySavingsGoal() {
  const goals = normalizeGoals(state.goals);
  const activeGoals = goals.filter((goal) => goal.active !== false);
  state.savingsGoal = activeGoals.length
    ? normalizeSavingsGoal(activeGoals[0])
    : !goals.length
      ? normalizeSavingsGoal({ amount: 0, currency: state.savingsGoal?.currency, months: state.savingsGoal?.months })
      : normalizeSavingsGoal(state.savingsGoal);
  saveSavingsGoal();
}

function upsertPrimaryGoalFromSavingsGoal(goal) {
  const next = goalFromSavingsGoal(goal, { name: "Objektivi kryesor" });
  const goals = normalizeGoals(state.goals);
  const index = goals.findIndex((item) => item.id === next.id);

  if (index >= 0) {
    goals[index] = {
      ...next,
      savedAmount: goals[index].savedAmount,
      contributionMode: goals[index].contributionMode,
      monthlyContribution: goals[index].monthlyContribution,
      bankId: goals[index].bankId,
      createdAt: goals[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
  }
  else goals.unshift(next);

  state.goals = normalizeGoals(goals);
  syncPrimarySavingsGoal();
}

function loadExchangeRate() {
  const saved = Number(localStorage.getItem(EXCHANGE_RATE_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : DEFAULT_EUR_TO_ALL_RATE;
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

function loadSetupComplete() {
  return localStorage.getItem(SETUP_KEY) === "true";
}

function saveSetupComplete(value = state.setupComplete) {
  state.setupComplete = Boolean(value);
  localStorage.setItem(SETUP_KEY, state.setupComplete ? "true" : "false");
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  els.themeToggle.removeAttribute("aria-pressed");
  syncProfileThemeState();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", state.theme === "dark" ? "#050506" : "#ffffff");
}

function syncProfileThemeState() {
  if (els.profileThemeState) els.profileThemeState.textContent = state.theme === "dark" ? "On" : "Off";
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
  const hasData =
    state.entries.length ||
    state.banks.length ||
    state.recurringExpenses.length ||
    state.netWorthHistory.length ||
    state.goals.length ||
    getCategories("expense").length ||
    getCategories("income").length;
  if (!hasData) return;

  localStorage.setItem(
    BACKUP_KEY,
    JSON.stringify({
      app: "financat-e-mia",
      version: BACKUP_SCHEMA_VERSION,
      entries: state.entries,
      banks: state.banks,
      recurringExpenses: state.recurringExpenses,
      netWorthHistory: state.netWorthHistory,
      goals: normalizeGoals(state.goals),
      categories: normalizeCategoriesData(state.categories),
      limits: state.limits,
      savingsGoal: state.savingsGoal,
      exchangeRate: state.exchangeRate,
      setupComplete: state.setupComplete,
      homeOrder: currentHomeOrder(),
      savedAt: new Date().toISOString(),
    })
  );
}

function restoreAutoBackup() {
  try {
    const backup = JSON.parse(localStorage.getItem(BACKUP_KEY));
    if (
      !backup ||
      (!Array.isArray(backup.entries) &&
        !Array.isArray(backup.banks) &&
        !Array.isArray(backup.recurringExpenses) &&
        !Array.isArray(backup.netWorthHistory) &&
        !Array.isArray(backup.goals) &&
        !backup.categories)
    ) {
      alert("Nuk ka backup lokal për të rikthyer.");
      return;
    }

    const confirmed = confirm("A dëshiron të rikthesh backup-in lokal? Të dhënat aktuale do ruhen si backup para rikthimit.");
    if (!confirmed) return;

    const snapshot = snapshotFinanceState();
    createAutoBackup();
    state.entries = Array.isArray(backup.entries) ? backup.entries.filter(isValidEntry).map(normalizeEntryForImport) : [];
    state.banks = normalizeBanks(Array.isArray(backup.banks) ? backup.banks.filter(isValidBank) : loadBanks());
    state.recurringExpenses = normalizeRecurringExpenses(backup.recurringExpenses || []);
    state.exchangeRate = Number(backup.exchangeRate) > 0 ? Number(backup.exchangeRate) : state.exchangeRate;
    if (Array.isArray(backup.netWorthHistory)) state.netWorthHistory = normalizeNetWorthHistory(backup.netWorthHistory, state.exchangeRate);
    if (Array.isArray(backup.goals)) state.goals = normalizeGoals(backup.goals);
    state.categories = backup.categories
      ? normalizeCategoriesData(backup.categories)
      : learnCategoriesFromData(state.categories, state.entries, state.recurringExpenses);
    state.limits = backup.limits ? normalizeLimits(backup.limits) : state.limits;
    state.savingsGoal = backup.savingsGoal ? normalizeSavingsGoal(backup.savingsGoal) : state.savingsGoal;
    syncPrimarySavingsGoal();
    if (typeof backup.setupComplete === "boolean") state.setupComplete = backup.setupComplete;
    if (Array.isArray(backup.homeOrder)) state.homeOrder = normalizeHomeOrder(backup.homeOrder);
    saveEntries();
    saveBanks();
    saveRecurringExpenses();
    saveNetWorthHistory();
    saveGoals();
    saveCategories();
    saveLimits();
    saveSavingsGoal();
    saveExchangeRate(state.exchangeRate);
    saveSetupComplete();
    applyHomeOrder(state.homeOrder);
    saveHomeOrder(state.homeOrder);
    els.eurToLekRateInput.value = formatRateInput(state.exchangeRate);
    syncTypeControls();
    render();
    showUndoToast("Backup-i lokal u rikthye.", () => restoreFinanceSnapshot(snapshot));
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

function recurringExpensesForMonth(now = new Date(), options = {}) {
  return normalizeRecurringExpenses(state.recurringExpenses)
    .filter((item) => options.includeInactive || item.active !== false)
    .sort((a, b) => a.dueDay - b.dueDay || a.name.localeCompare(b.name));
}

function recurringRemainingExpenses(now = new Date()) {
  return recurringExpensesForMonth(now).filter((item) => !hasRecurringBeenRecordedThisMonth(item, now));
}

function hasRecurringBeenRecordedThisMonth(item, now = new Date()) {
  if (!item || item.active === false) return false;

  const key = monthKey(now);
  const currency = normalizeCurrency(item.currency);
  const amount = Number(item.amount) || 0;
  const normalizedName = String(item.name || "").trim().toLowerCase();

  return state.entries.some((entry) => {
    if (entry.type !== "expense" || !String(entry.date || "").startsWith(key)) return false;
    if (normalizeCurrency(entry.currency) !== currency) return false;
    if (Math.abs((Number(entry.amount) || 0) - amount) > 0.01) return false;

    const note = String(entry.note || "").trim().toLowerCase();
    const categoryMatches = entry.category === item.category;
    const nameMatches = normalizedName && note && (note.includes(normalizedName) || normalizedName.includes(note));
    return categoryMatches || nameMatches;
  });
}

function recurringTotals(items) {
  return (Array.isArray(items) ? items : []).reduce((totals, item) => {
    totals[normalizeCurrency(item.currency)] += Number(item.amount) || 0;
    return totals;
  }, emptyMoneyTotals());
}

function recurringTotalsLek(items) {
  return totalsToLek(recurringTotals(items));
}

function normalizeRecurringExpenses(items) {
  return (Array.isArray(items) ? items : []).filter(isValidRecurringExpense).map(normalizeRecurringExpense);
}

function mergeRecurringExpenses(current, imported) {
  const merged = normalizeRecurringExpenses(current);
  const byId = new Map(merged.filter((item) => item.id).map((item) => [item.id, item]));
  const seen = new Set(merged.map(recurringKey));

  normalizeRecurringExpenses(imported).forEach((item) => {
    if (item.id && byId.has(item.id)) {
      Object.assign(byId.get(item.id), item);
      return;
    }

    const key = recurringKey(item);
    if (seen.has(key)) return;

    seen.add(key);
    merged.push(item);
  });

  return merged.sort((a, b) => a.dueDay - b.dueDay || a.name.localeCompare(b.name));
}

function normalizeRecurringExpense(item = {}) {
  const name = String(item.name || item.note || "Shpenzim fiks").trim() || "Shpenzim fiks";
  const dueDay = Math.max(1, Math.min(31, Math.round(Number(item.dueDay ?? item.day ?? item.dateDay) || 1)));
  const categorySource = (() => {
    try {
      return normalizeCategoriesData(JSON.parse(localStorage.getItem(CATEGORIES_KEY)));
    } catch {
      return cloneDefaultCategories();
    }
  })();
  const category = categoryExistsInData(categorySource, "expense", item.category) ? normalizeCategoryName(item.category) : "Fatura";

  return {
    id: item.id || crypto.randomUUID(),
    name,
    amount: Math.max(Number(item.amount) || 0, 0),
    currency: normalizeCurrency(item.currency),
    category,
    dueDay,
    active: item.active !== false,
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function isValidRecurringExpense(item) {
  return item && String(item.name || item.note || "").trim() && Number(item.amount) > 0;
}

function recurringKey(item) {
  return [
    normalizeCurrency(item.currency),
    String(item.name || item.note || "").trim().toLowerCase(),
    Number(item.amount) || 0,
    Number(item.dueDay ?? item.day ?? item.dateDay) || 1,
  ].join("|");
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
  const rawBalance = Number(bank.balance);
  return {
    id: bank.id || crypto.randomUUID(),
    name: String(bank.name || "Llogari").trim(),
    currency: normalizeCurrency(bank.currency),
    balance: Number.isFinite(rawBalance) ? rawBalance : 0,
    isDefault: Boolean(bank.isDefault),
    createdAt: bank.createdAt || new Date().toISOString(),
  };
}

function bankIdentity(bank) {
  return `${normalizeCurrency(bank.currency)}|${String(bank.name || "").trim().toLowerCase()}`;
}

function isValidEntry(entry) {
  const amount = Number(entry?.amount);
  return (
    entry &&
    ["income", "expense"].includes(normalizeEntryType(entry.type)) &&
    Number.isFinite(amount) &&
    amount > 0 &&
    isRecognizedCurrency(entry.currency) &&
    Boolean(normalizeImportedDate(entry.date))
  );
}

function isValidBank(bank) {
  const balance = Number(bank?.balance);
  return bank && bank.name && Number.isFinite(balance) && isRecognizedCurrency(bank.currency);
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
    date: normalizeImportedDate(entry.date),
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

function multiplyMoneyTotals(totals, multiplier) {
  return {
    ALL: (Number(totals?.ALL) || 0) * multiplier,
    EUR: (Number(totals?.EUR) || 0) * multiplier,
  };
}

function normalizeCurrency(currency) {
  const value = String(currency || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return ["EUR", "EURO", "€"].includes(value) ? "EUR" : "ALL";
}

function isRecognizedCurrency(currency) {
  const value = String(currency || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return ["ALL", "LEK", "LEKE", "EUR", "EURO", "€"].includes(value);
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

function monthToDateLabel(date) {
  const day = Math.max(date.getDate(), 1);
  const month = monthNames[date.getMonth()];
  return day === 1 ? `1 ${month}` : `1-${day} ${month}`;
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
  return Number.isFinite(number) && number >= 0 ? number : fallback;
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
