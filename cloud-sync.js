(() => {
  "use strict";

  const SUPABASE_URL = String(document.querySelector('meta[name="supabase-url"]')?.content || "")
    .trim()
    .replace(/[.\/]+$/, "");
  const SUPABASE_KEY = String(document.querySelector('meta[name="supabase-publishable-key"]')?.content || "").trim();
  const AUTH_STORAGE_KEY = "financat-e-mia:supabase-session:v1";
  const SYNC_META_PREFIX = "financat-e-mia:cloud-sync:v1:";
  const LOCAL_VAULT_KEY = "financat-e-mia:secure-vault:v1";
  const LOCAL_VAULT_BACKUP_KEY = "financat-e-mia:secure-vault-backup:v1";
  const VAULT_FORMAT = "financat-e-mia-encrypted";
  const AUTO_SYNC_DELAY_MS = 900;

  const cloudState = {
    mode: "signin",
    session: null,
    user: null,
    profile: null,
    busy: false,
    syncing: false,
    syncTimer: 0,
    retryTimer: 0,
    vaultWatchTimer: 0,
    observedVaultValue: localStorage.getItem(LOCAL_VAULT_KEY),
    avatarUrl: "",
  };

  const ui = {
    overlay: document.querySelector("#cloudAccountOverlay"),
    close: document.querySelector("#closeCloudAccountBtn"),
    profileButton: document.querySelector("#profileCloudBtn"),
    profileState: document.querySelector("#profileCloudState"),
    description: document.querySelector("#cloudAccountDescription"),
    authPanel: document.querySelector("#cloudAuthPanel"),
    signedInPanel: document.querySelector("#cloudSignedInPanel"),
    signInTab: document.querySelector("#cloudSignInTab"),
    signUpTab: document.querySelector("#cloudSignUpTab"),
    authForm: document.querySelector("#cloudAuthForm"),
    fullNameLabel: document.querySelector("#cloudFullNameLabel"),
    fullNameInput: document.querySelector("#cloudFullNameInput"),
    emailInput: document.querySelector("#cloudEmailInput"),
    passwordInput: document.querySelector("#cloudPasswordInput"),
    authSubmit: document.querySelector("#cloudAuthSubmit"),
    userEmail: document.querySelector("#cloudUserEmail"),
    lastSync: document.querySelector("#cloudLastSync"),
    profileForm: document.querySelector("#cloudProfileForm"),
    profileName: document.querySelector("#cloudProfileNameInput"),
    avatarInput: document.querySelector("#cloudAvatarInput"),
    profileSave: document.querySelector("#cloudProfileSaveBtn"),
    syncNow: document.querySelector("#cloudSyncNowBtn"),
    upload: document.querySelector("#cloudUploadBtn"),
    download: document.querySelector("#cloudDownloadBtn"),
    signOut: document.querySelector("#cloudSignOutBtn"),
    status: document.querySelector("#cloudAccountStatus"),
    menuName: document.querySelector("#profileMenuName"),
    menuEmail: document.querySelector("#profileMenuEmail"),
    greeting: document.querySelector("#heroGreeting"),
  };

  if (!SUPABASE_URL || !SUPABASE_KEY || !ui.overlay) return;

  function parseJson(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function setStatus(message = "", tone = "") {
    if (!ui.status) return;
    ui.status.textContent = message;
    ui.status.classList.toggle("is-error", tone === "error");
    ui.status.classList.toggle("is-warning", tone === "warning");
  }

  function setCloudBadge(label) {
    if (ui.profileState) ui.profileState.textContent = label;
  }

  function setBusy(isBusy) {
    cloudState.busy = isBusy;
    [ui.authSubmit, ui.profileSave, ui.syncNow, ui.upload, ui.download, ui.signOut]
      .filter(Boolean)
      .forEach((button) => {
        button.disabled = isBusy;
      });
  }

  function showToast(message) {
    if (typeof window.showInfoToast === "function") window.showInfoToast(message);
  }

  function setAuthMode(mode) {
    cloudState.mode = mode === "signup" ? "signup" : "signin";
    const isSignup = cloudState.mode === "signup";
    ui.signInTab?.classList.toggle("active", !isSignup);
    ui.signUpTab?.classList.toggle("active", isSignup);
    ui.signInTab?.setAttribute("aria-selected", String(!isSignup));
    ui.signUpTab?.setAttribute("aria-selected", String(isSignup));
    if (ui.fullNameLabel) ui.fullNameLabel.hidden = !isSignup;
    if (ui.fullNameInput) ui.fullNameInput.required = isSignup;
    if (ui.passwordInput) ui.passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
    if (ui.authSubmit) ui.authSubmit.textContent = isSignup ? "Krijo llogarinë" : "Hyr";
    if (ui.description) {
      ui.description.textContent = isSignup
        ? "Krijo llogarinë që vault-i i enkriptuar të ruhet edhe në cloud."
        : "Hyr që backup-i i enkriptuar të sinkronizohet mes pajisjeve.";
    }
    setStatus("");
  }

  function openCloudAccount() {
    if (typeof window.closeProfileMenu === "function") window.closeProfileMenu();
    ui.overlay.hidden = false;
    document.body.classList.add("cloud-account-open");
    renderAuthState();
    window.setTimeout(() => {
      if (!cloudState.user) ui.emailInput?.focus();
    }, 40);
  }

  function closeCloudAccount() {
    if (cloudState.busy) return;
    ui.overlay.hidden = true;
    document.body.classList.remove("cloud-account-open");
    ui.authForm?.reset();
    setStatus("");
  }

  function renderAuthState() {
    const signedIn = Boolean(cloudState.user && cloudState.session?.access_token);
    if (ui.authPanel) ui.authPanel.hidden = signedIn;
    if (ui.signedInPanel) ui.signedInPanel.hidden = !signedIn;
    if (ui.description) {
      ui.description.textContent = signedIn
        ? "Financat mbeten të enkriptuara para se të largohen nga kjo pajisje."
        : cloudState.mode === "signup"
          ? "Krijo llogarinë që vault-i i enkriptuar të ruhet edhe në cloud."
          : "Hyr që backup-i i enkriptuar të sinkronizohet mes pajisjeve.";
    }
    if (signedIn) {
      if (ui.userEmail) ui.userEmail.textContent = cloudState.user.email || "Llogari Supabase";
      if (ui.profileName) ui.profileName.value = cloudState.profile?.full_name || userDisplayName();
      setCloudBadge("Lidhur");
    } else {
      setCloudBadge(navigator.onLine ? "Jo e lidhur" : "Offline");
    }
  }

  function userDisplayName() {
    return String(
      cloudState.profile?.full_name
      || cloudState.user?.user_metadata?.full_name
      || cloudState.user?.email?.split("@")[0]
      || "Dorian Elezaj",
    ).trim();
  }

  function applyProfileToApp() {
    if (!cloudState.user) {
      if (ui.menuEmail) ui.menuEmail.textContent = "Ruajtur në këtë pajisje";
      return;
    }
    const name = userDisplayName();
    const firstName = name.split(/\s+/)[0] || "Dorian";
    if (ui.menuName) ui.menuName.textContent = name;
    if (ui.menuEmail) ui.menuEmail.textContent = cloudState.user.email || "Llogari cloud";
    if (ui.greeting) ui.greeting.textContent = `Hi ${firstName}`;
  }

  function saveSession(session) {
    if (!session?.access_token) {
      cloudState.session = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    const expiresAt = Number(session.expires_at)
      || Math.floor(Date.now() / 1000) + Math.max(Number(session.expires_in) || 3600, 60);
    cloudState.session = { ...session, expires_at: expiresAt };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(cloudState.session));
  }

  function loadSession() {
    const value = parseJson(localStorage.getItem(AUTH_STORAGE_KEY), null);
    return value?.access_token && value?.refresh_token ? value : null;
  }

  function consumeAuthRedirect() {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (!accessToken || !refreshToken) return false;
    saveSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: Number(hash.get("expires_in")) || 3600,
      token_type: hash.get("token_type") || "bearer",
    });
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
    return true;
  }

  async function parseResponse(response, responseType) {
    if (response.status === 204) return null;
    if (responseType === "blob") return response.blob();
    const text = await response.text();
    if (!text) return null;
    const parsed = parseJson(text, null);
    return parsed === null ? text : parsed;
  }

  function responseError(response, payload) {
    const message = payload?.msg || payload?.message || payload?.error_description || payload?.error
      || (typeof payload === "string" ? payload : "Kërkesa dështoi.");
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    return error;
  }

  async function refreshSession() {
    const refreshToken = cloudState.session?.refresh_token;
    if (!refreshToken) throw new Error("Sesioni ka përfunduar. Hyr përsëri.");
    const refreshed = await apiRequest("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      auth: false,
      body: { refresh_token: refreshToken },
      retry: false,
    });
    saveSession(refreshed);
    cloudState.user = refreshed?.user || cloudState.user;
    return cloudState.session.access_token;
  }

  async function accessToken() {
    if (!cloudState.session) throw new Error("Hyr në llogari për të vazhduar.");
    const expiresAt = Number(cloudState.session.expires_at) || 0;
    if (expiresAt && expiresAt <= Math.floor(Date.now() / 1000) + 45) await refreshSession();
    return cloudState.session.access_token;
  }

  async function apiRequest(path, options = {}) {
    const {
      method = "GET",
      body,
      auth = true,
      headers: extraHeaders = {},
      responseType = "json",
      retry = true,
    } = options;
    const headers = {
      apikey: SUPABASE_KEY,
      Accept: responseType === "blob" ? "*/*" : "application/json",
      ...extraHeaders,
    };
    if (auth) headers.Authorization = `Bearer ${await accessToken()}`;

    let requestBody = body;
    const rawBody = body instanceof Blob || body instanceof FormData || body instanceof ArrayBuffer;
    if (body !== undefined && !rawBody) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      requestBody = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(`${SUPABASE_URL}${path}`, { method, headers, body: requestBody });
    } catch (error) {
      const offlineError = new Error(navigator.onLine ? "Supabase nuk u arrit. Provo përsëri." : "Nuk ka internet. Të dhënat mbetën të ruajtura në pajisje.");
      offlineError.cause = error;
      offlineError.offline = true;
      throw offlineError;
    }

    if (response.status === 401 && auth && retry && cloudState.session?.refresh_token) {
      await refreshSession();
      return apiRequest(path, { ...options, retry: false });
    }
    const payload = await parseResponse(response, responseType);
    if (!response.ok) throw responseError(response, payload);
    return payload;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    if (cloudState.busy) return;
    const email = String(ui.emailInput?.value || "").trim().toLowerCase();
    const password = ui.passwordInput?.value || "";
    const fullName = String(ui.fullNameInput?.value || "").trim();
    if (!email || password.length < 8 || (cloudState.mode === "signup" && !fullName)) {
      setStatus("Plotëso të gjitha fushat. Fjalëkalimi duhet të ketë të paktën 8 shenja.", "error");
      return;
    }

    setBusy(true);
    setStatus(cloudState.mode === "signup" ? "Po krijohet llogaria…" : "Po hyhet…");
    try {
      const result = cloudState.mode === "signup"
        ? await apiRequest(`/auth/v1/signup?redirect_to=${encodeURIComponent(`${window.location.origin}${window.location.pathname}`)}`, {
          method: "POST",
          auth: false,
          body: { email, password, data: { full_name: fullName } },
        })
        : await apiRequest("/auth/v1/token?grant_type=password", {
          method: "POST",
          auth: false,
          body: { email, password },
        });

      if (!result?.access_token) {
        setAuthMode("signin");
        setStatus("Llogaria u krijua. Kontrollo email-in për konfirmim, pastaj hyr.");
        return;
      }
      saveSession(result);
      cloudState.user = result.user;
      ui.authForm?.reset();
      await finishSignIn({ preferredName: fullName });
      setStatus("Llogaria u lidh me sukses.");
    } catch (error) {
      setStatus(friendlyAuthError(error), "error");
    } finally {
      setBusy(false);
    }
  }

  function friendlyAuthError(error) {
    const message = String(error?.message || "");
    if (/invalid login credentials/i.test(message)) return "Email-i ose fjalëkalimi është i pasaktë.";
    if (/already registered|already been registered/i.test(message)) return "Ky email është regjistruar. Provo të hysh.";
    if (/email not confirmed/i.test(message)) return "Konfirmo email-in dhe provo përsëri.";
    if (/password/i.test(message) && /weak|characters|least/i.test(message)) return "Zgjidh një fjalëkalim më të fortë me të paktën 8 shenja.";
    return message || "Lidhja me llogarinë dështoi.";
  }

  async function restoreAuthSession() {
    cloudState.session = loadSession();
    if (!cloudState.session) {
      renderAuthState();
      applyProfileToApp();
      return;
    }
    cloudState.user = cloudState.session.user || null;
    if (!navigator.onLine) {
      renderAuthState();
      applyProfileToApp();
      setCloudBadge("Offline");
      setStatus("Nuk ka internet. Llogaria mbetet e ruajtur dhe sinkronizimi do të rifillojë automatikisht.", "warning");
      return;
    }
    try {
      if (Number(cloudState.session.expires_at) <= Math.floor(Date.now() / 1000) + 45) await refreshSession();
      cloudState.user = await apiRequest("/auth/v1/user");
      cloudState.session.user = cloudState.user;
      saveSession(cloudState.session);
      await finishSignIn();
    } catch (error) {
      console.warn("Supabase session restore failed", error);
      if (error?.offline) {
        renderAuthState();
        applyProfileToApp();
        setCloudBadge("Offline");
        setStatus("Nuk ka internet. Llogaria mbetet e ruajtur dhe sinkronizimi do të rifillojë automatikisht.", "warning");
        return;
      }
      localStorage.removeItem(AUTH_STORAGE_KEY);
      cloudState.session = null;
      cloudState.user = null;
      cloudState.profile = null;
      renderAuthState();
      applyProfileToApp();
      setCloudBadge(navigator.onLine ? "Hyr përsëri" : "Offline");
    }
  }

  async function finishSignIn(options = {}) {
    await loadOrCreateProfile(options.preferredName || "");
    renderAuthState();
    applyProfileToApp();
    scheduleCloudSync(120);
  }

  async function signOut() {
    if (cloudState.busy) return;
    setBusy(true);
    setStatus("Po mbyllet sesioni…");
    try {
      await apiRequest("/auth/v1/logout", { method: "POST" });
    } catch (error) {
      if (!error?.offline) console.warn("Supabase sign out failed", error);
    } finally {
      window.clearTimeout(cloudState.syncTimer);
      window.clearTimeout(cloudState.retryTimer);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      cloudState.session = null;
      cloudState.user = null;
      cloudState.profile = null;
      clearRemoteAvatar();
      setBusy(false);
      renderAuthState();
      applyProfileToApp();
      setStatus("Dole nga llogaria. Të dhënat lokale nuk u prekën.");
    }
  }

  async function loadOrCreateProfile(preferredName = "") {
    if (!cloudState.user) return;
    const id = encodeURIComponent(cloudState.user.id);
    const rows = await apiRequest(`/rest/v1/profiles?select=id,full_name,avatar_path,updated_at&id=eq.${id}&limit=1`);
    let profile = Array.isArray(rows) ? rows[0] : null;
    if (!profile) {
      const fullName = preferredName || userDisplayName();
      const created = await apiRequest("/rest/v1/profiles?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: { id: cloudState.user.id, full_name: fullName, updated_at: new Date().toISOString() },
      });
      profile = Array.isArray(created) ? created[0] : { id: cloudState.user.id, full_name: fullName, avatar_path: null };
    }
    cloudState.profile = profile;
    if (profile?.avatar_path) await loadRemoteAvatar(profile.avatar_path);
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!cloudState.user || cloudState.busy) return;
    const fullName = String(ui.profileName?.value || "").trim();
    if (!fullName) {
      setStatus("Vendos emrin e profilit.", "error");
      return;
    }
    const file = ui.avatarInput?.files?.[0] || null;
    if (file && (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024)) {
      setStatus("Fotoja duhet të jetë JPG, PNG ose WebP dhe maksimumi 5 MB.", "error");
      return;
    }

    setBusy(true);
    setStatus("Po ruhet profili…");
    try {
      let avatarPath = cloudState.profile?.avatar_path || null;
      if (file) avatarPath = await uploadAvatar(file);
      const rows = await apiRequest("/rest/v1/profiles?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: {
          id: cloudState.user.id,
          full_name: fullName,
          avatar_path: avatarPath,
          updated_at: new Date().toISOString(),
        },
      });
      cloudState.profile = Array.isArray(rows) ? rows[0] : { ...cloudState.profile, full_name: fullName, avatar_path: avatarPath };
      if (avatarPath) await loadRemoteAvatar(avatarPath);
      applyProfileToApp();
      setStatus("Profili u ruajt.");
      showToast("Profili u përditësua.");
    } catch (error) {
      setStatus(error.message || "Profili nuk u ruajt.", "error");
    } finally {
      if (ui.avatarInput) ui.avatarInput.value = "";
      setBusy(false);
    }
  }

  async function uploadAvatar(file) {
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${cloudState.user.id}/profile-${Date.now()}.${extension}`;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    await apiRequest(`/storage/v1/object/avatars/${encodedPath}`, {
      method: "POST",
      body: file,
      headers: { "Content-Type": file.type, "x-upsert": "true" },
    });
    return path;
  }

  async function loadRemoteAvatar(path) {
    try {
      const encodedPath = String(path).split("/").map(encodeURIComponent).join("/");
      const blob = await apiRequest(`/storage/v1/object/authenticated/avatars/${encodedPath}`, { responseType: "blob" });
      clearRemoteAvatar();
      cloudState.avatarUrl = URL.createObjectURL(blob);
      const safeUrl = cloudState.avatarUrl.replace(/["\\]/g, "");
      document.documentElement.style.setProperty("--profile-avatar-image", `url("${safeUrl}")`);
    } catch (error) {
      console.warn("Avatar load failed", error);
    }
  }

  function clearRemoteAvatar() {
    if (cloudState.avatarUrl) URL.revokeObjectURL(cloudState.avatarUrl);
    cloudState.avatarUrl = "";
    document.documentElement.style.removeProperty("--profile-avatar-image");
  }

  function syncMetaKey() {
    return `${SYNC_META_PREFIX}${cloudState.user?.id || "anonymous"}`;
  }

  function loadSyncMeta() {
    return parseJson(localStorage.getItem(syncMetaKey()), null);
  }

  function saveSyncMeta(meta) {
    localStorage.setItem(syncMetaKey(), JSON.stringify(meta));
    if (ui.lastSync && meta?.syncedAt) ui.lastSync.textContent = `Sinkronizuar ${formatSyncTime(meta.syncedAt)}`;
  }

  function formatSyncTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "tani";
    return new Intl.DateTimeFormat("sq-AL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function isVault(value) {
    return Boolean(
      value
      && typeof value === "object"
      && value.format === VAULT_FORMAT
      && Number(value.version) === 1
      && value.kdf?.salt
      && value.cipher?.iv
      && value.ciphertext,
    );
  }

  function localVault() {
    const vault = parseJson(localStorage.getItem(LOCAL_VAULT_KEY), null);
    return isVault(vault) ? vault : null;
  }

  function canonicalJson(value) {
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  async function fingerprintVault(vault) {
    const bytes = new TextEncoder().encode(canonicalJson(vault));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function readRemoteVault() {
    const id = encodeURIComponent(cloudState.user.id);
    const rows = await apiRequest(`/rest/v1/user_vaults?select=user_id,encrypted_payload,payload_version,revision,device_updated_at,updated_at&user_id=eq.${id}&limit=1`);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return null;
    const encryptedPayload = typeof row.encrypted_payload === "string"
      ? parseJson(row.encrypted_payload, null)
      : row.encrypted_payload;
    if (!isVault(encryptedPayload)) throw new Error("Backup-i në cloud nuk ka format të vlefshëm.");
    return { ...row, encrypted_payload: encryptedPayload, revision: Number(row.revision) || 0 };
  }

  async function createRemoteVault(vault) {
    const now = new Date().toISOString();
    const rows = await apiRequest("/rest/v1/user_vaults", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: {
        user_id: cloudState.user.id,
        encrypted_payload: vault,
        payload_version: Number(vault.version) || 1,
        revision: 1,
        device_updated_at: now,
      },
    });
    return Array.isArray(rows) ? rows[0] : { revision: 1, updated_at: now };
  }

  async function updateRemoteVault(vault, expectedRevision, force = false) {
    const nextRevision = Math.max(Number(expectedRevision) || 0, 0) + 1;
    const now = new Date().toISOString();
    const payload = {
      user_id: cloudState.user.id,
      encrypted_payload: vault,
      payload_version: Number(vault.version) || 1,
      revision: nextRevision,
      device_updated_at: now,
    };

    if (force) {
      const rows = await apiRequest("/rest/v1/user_vaults?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: payload,
      });
      return Array.isArray(rows) ? rows[0] : { revision: nextRevision, updated_at: now };
    }

    const id = encodeURIComponent(cloudState.user.id);
    const rows = await apiRequest(`/rest/v1/user_vaults?user_id=eq.${id}&revision=eq.${Number(expectedRevision) || 0}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: payload,
    });
    if (!Array.isArray(rows) || !rows.length) {
      const error = new Error("Cloud-i ndryshoi nga një pajisje tjetër. Zgjidh cilin version dëshiron të mbash.");
      error.conflict = true;
      throw error;
    }
    return rows[0];
  }

  async function rememberSuccessfulSync(vault, row) {
    const syncedAt = new Date().toISOString();
    saveSyncMeta({
      revision: Number(row?.revision) || 0,
      fingerprint: await fingerprintVault(vault),
      syncedAt,
      serverUpdatedAt: row?.updated_at || syncedAt,
    });
    setCloudBadge("Sinkronizuar");
    setStatus("Të dhënat janë të sinkronizuara.");
  }

  async function applyRemoteVault(row, options = {}) {
    const remote = row?.encrypted_payload;
    if (!isVault(remote)) throw new Error("Nuk u gjet një backup i vlefshëm në cloud.");
    const current = localStorage.getItem(LOCAL_VAULT_KEY);
    if (current) localStorage.setItem(LOCAL_VAULT_BACKUP_KEY, current);
    localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(remote));
    if (typeof window.clearPlaintextSensitiveStorage === "function") window.clearPlaintextSensitiveStorage();
    await rememberSuccessfulSync(remote, row);
    setStatus("Backup-i nga cloud u rikthye. Po hapen të dhënat…");
    if (options.reload !== false) window.setTimeout(() => window.location.reload(), 450);
  }

  async function performCloudSync(options = {}) {
    if (!cloudState.user || cloudState.syncing) return;
    cloudState.syncing = true;
    try {
    if (!navigator.onLine) {
      setCloudBadge("Offline");
      setStatus("Nuk ka internet. Ndryshimet mbeten të ruajtura në pajisje.", "warning");
      scheduleRetry();
      return;
    }

    const local = localVault();
    const remote = await readRemoteVault();

    if (options.forceDownload) {
      if (!remote) throw new Error("Nuk ka ende backup në cloud.");
      await applyRemoteVault(remote);
      return;
    }
    if (!local) {
      if (remote) await applyRemoteVault(remote);
      else setStatus("Aktivizo Sigurinë që të krijohet vault-i i enkriptuar.", "warning");
      return;
    }

    const localFingerprint = await fingerprintVault(local);
    if (!remote) {
      const created = await createRemoteVault(local);
      await rememberSuccessfulSync(local, created);
      return;
    }

    if (options.forceUpload) {
      const updated = await updateRemoteVault(local, remote.revision, true);
      await rememberSuccessfulSync(local, updated);
      return;
    }

    const remoteFingerprint = await fingerprintVault(remote.encrypted_payload);
    const meta = loadSyncMeta();
    if (!meta) {
      if (localFingerprint === remoteFingerprint) {
        await rememberSuccessfulSync(local, remote);
        return;
      }
      const error = new Error("Ka të dhëna si në këtë pajisje, ashtu edhe në cloud. Zgjidh ‘Ruaj këtë pajisje’ ose ‘Rikthe nga cloud’. ");
      error.conflict = true;
      throw error;
    }

    const localChanged = localFingerprint !== meta.fingerprint;
    const remoteChanged = Number(remote.revision) !== Number(meta.revision);
    if (!localChanged && !remoteChanged) {
      await rememberSuccessfulSync(local, remote);
      return;
    }
    if (localChanged && !remoteChanged) {
      const updated = await updateRemoteVault(local, remote.revision);
      await rememberSuccessfulSync(local, updated);
      return;
    }
    if (!localChanged && remoteChanged) {
      await applyRemoteVault(remote);
      return;
    }

    const error = new Error("Të dhënat janë ndryshuar në dy pajisje. Asgjë nuk u mbishkrua; zgjidh versionin që dëshiron të mbash.");
    error.conflict = true;
    throw error;
    } finally {
      cloudState.syncing = false;
    }
  }

  function scheduleRetry() {
    window.clearTimeout(cloudState.retryTimer);
    cloudState.retryTimer = window.setTimeout(() => {
      if (navigator.onLine) scheduleCloudSync(0);
    }, 30_000);
  }

  function scheduleCloudSync(delay = AUTO_SYNC_DELAY_MS) {
    if (!cloudState.user || !cloudState.session || cloudState.syncing) return;
    window.clearTimeout(cloudState.syncTimer);
    cloudState.syncTimer = window.setTimeout(async () => {
      try {
        await performCloudSync();
      } catch (error) {
        console.warn("Cloud sync failed", error);
        setCloudBadge(error?.offline ? "Offline" : error?.conflict ? "Konflikt" : "Gabim");
        setStatus(error.message || "Sinkronizimi dështoi.", error?.conflict ? "warning" : "error");
        if (error?.offline) scheduleRetry();
      }
    }, Math.max(Number(delay) || 0, 0));
  }

  function observeLocalVault() {
    const current = localStorage.getItem(LOCAL_VAULT_KEY);
    if (current === cloudState.observedVaultValue) return;
    cloudState.observedVaultValue = current;
    if (current && cloudState.user) scheduleCloudSync(160);
  }

  async function runSyncAction(options, pendingText) {
    if (!cloudState.user || cloudState.busy) return;
    setBusy(true);
    setStatus(pendingText);
    try {
      await performCloudSync(options);
      if (!options.forceDownload) showToast("Backup-i cloud u sinkronizua.");
    } catch (error) {
      setCloudBadge(error?.offline ? "Offline" : error?.conflict ? "Konflikt" : "Gabim");
      setStatus(error.message || "Sinkronizimi dështoi.", error?.conflict ? "warning" : "error");
    } finally {
      setBusy(false);
    }
  }

  function confirmForceUpload() {
    if (!confirm("Kjo do ta zëvendësojë backup-in në cloud me të dhënat e kësaj pajisjeje. Të vazhdojmë?")) return;
    runSyncAction({ forceUpload: true }, "Po ngarkohet versioni i kësaj pajisjeje…");
  }

  function confirmForceDownload() {
    if (!confirm("Kjo do t’i zëvendësojë të dhënat në këtë pajisje me backup-in nga cloud. Gjendja aktuale do të ruhet si backup lokal. Të vazhdojmë?")) return;
    runSyncAction({ forceDownload: true }, "Po rikthehet backup-i nga cloud…");
  }

  async function handleOnline() {
    setCloudBadge(cloudState.user ? "Po lidhet…" : "Jo e lidhur");
    if (cloudState.session && !cloudState.user) await restoreAuthSession();
    scheduleCloudSync(100);
  }

  function handleOffline() {
    if (cloudState.user) {
      setCloudBadge("Offline");
      setStatus("Nuk ka internet. Aplikacioni vazhdon të punojë dhe do të sinkronizohet më vonë.", "warning");
    }
  }

  function bindEvents() {
    ui.profileButton?.addEventListener("click", openCloudAccount);
    ui.close?.addEventListener("click", closeCloudAccount);
    ui.overlay?.addEventListener("click", (event) => {
      if (event.target === ui.overlay) closeCloudAccount();
    });
    ui.signInTab?.addEventListener("click", () => setAuthMode("signin"));
    ui.signUpTab?.addEventListener("click", () => setAuthMode("signup"));
    ui.authForm?.addEventListener("submit", handleAuthSubmit);
    ui.profileForm?.addEventListener("submit", saveProfile);
    ui.syncNow?.addEventListener("click", () => runSyncAction({}, "Po kontrollohen ndryshimet…"));
    ui.upload?.addEventListener("click", confirmForceUpload);
    ui.download?.addEventListener("click", confirmForceDownload);
    ui.signOut?.addEventListener("click", signOut);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") scheduleCloudSync(250);
    });
  }

  async function init() {
    bindEvents();
    cloudState.vaultWatchTimer = window.setInterval(observeLocalVault, 800);
    setAuthMode("signin");
    renderAuthState();
    consumeAuthRedirect();
    const meta = loadSyncMeta();
    if (meta?.syncedAt && ui.lastSync) ui.lastSync.textContent = `Sinkronizuar ${formatSyncTime(meta.syncedAt)}`;
    await restoreAuthSession();
  }

  window.scheduleCloudSync = scheduleCloudSync;
  window.financeCloud = Object.freeze({
    sync: () => performCloudSync(),
    open: openCloudAccount,
    isSignedIn: () => Boolean(cloudState.user),
  });

  init().catch((error) => {
    console.error("Cloud account initialization failed", error);
    setCloudBadge("Gabim");
    setStatus(error.message || "Llogaria cloud nuk u inicializua.", "error");
  });
})();
