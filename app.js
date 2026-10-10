const STORAGE_KEY = "schoolHolidayList_v1";

const DEFAULT_HOLIDAYS = [
  { type: "STATE HOLIDAY", holiday: "GOOD FRIDAY", from: "2026-04-03", to: "2026-04-03" },
  { type: "STATE HOLIDAY", holiday: "DR. AMBEDKAR JAYANTI", from: "2026-04-14", to: "2026-04-14" },
  { type: "STATE HOLIDAY", holiday: "BUDDHA POORNIMA", from: "2026-05-01", to: "2026-05-01" },
  { type: "STATE HOLIDAY", holiday: "BAKRA EID", from: "2026-05-27", to: "2026-05-27" },
  { type: "STATE HOLIDAY", holiday: "LAST DAY OF MOHARRAM", from: "2026-06-26", to: "2026-06-26" },
  { type: "STATE HOLIDAY", holiday: "SHAHID UDHAM SINGH MARTYRDOM DAY", from: "2026-07-31", to: "2026-07-31" },
  { type: "STATE HOLIDAY", holiday: "HARIYALI TEEJ", from: "2026-08-15", to: "2026-08-15" },
  { type: "NATIONAL HOLIDAY", holiday: "INDEPENDENCE DAY", from: "2026-08-15", to: "2026-08-15" },
  { type: "STATE HOLIDAY", holiday: "EID-E-MILAD", from: "2026-08-26", to: "2026-08-26" },
  { type: "STATE HOLIDAY", holiday: "RAKSHA BANDHAN", from: "2026-08-28", to: "2026-08-28" },
  { type: "CITY HOLIDAY", holiday: "ANMASHTAMI", from: "2026-09-04", to: "2026-09-04" },
  { type: "NATIONAL HOLIDAY", holiday: "GANDHI JAYANTI", from: "2026-10-02", to: "2026-10-02" },
  { type: "STATE HOLIDAY", holiday: "MAHA-ASHTAMI", from: "2026-10-19", to: "2026-10-19" },
  { type: "STATE HOLIDAY", holiday: "MAHANAVAMI / AYUDHAPOOJA", from: "2026-10-20", to: "2026-10-20" },
  { type: "STATE HOLIDAY", holiday: "VIJAYADASAMI / DASSEHRA", from: "2026-10-21", to: "2026-10-21" },
  { type: "STATE HOLIDAY", holiday: "STATE FORMATION DAY (MADHYA PRADESH / HARYANA / KARNATAKA / TAMILNADU)", from: "2026-11-01", to: "2026-11-01" },
  { type: "STATE HOLIDAY", holiday: "DIWALI", from: "2026-11-09", to: "2026-11-09" },
  { type: "STATE HOLIDAY", holiday: "DIWALI (NEW YEAR)", from: "2026-11-10", to: "2026-11-10" },
  { type: "STATE HOLIDAY", holiday: "DIWALI (BHAI DUJ)", from: "2026-11-11", to: "2026-11-11" },
  { type: "STATE HOLIDAY", holiday: "GURU NANAK JAYANTI / KARTIK POORNIMA", from: "2026-11-24", to: "2026-11-24" },
  { type: "STATE HOLIDAY", holiday: "CHRISTMAS DAY", from: "2026-12-25", to: "2026-12-25" },
  { type: "STATE HOLIDAY", holiday: "NEW YEAR DAY", from: "2027-01-01", to: "2027-01-01" },
  { type: "NATIONAL HOLIDAY", holiday: "REPUBLIC DAY", from: "2027-01-26", to: "2027-01-26" },
  { type: "STATE HOLIDAY", holiday: "MAHA SHIVRATRI", from: "2027-03-06", to: "2027-03-06" },
  { type: "CITY HOLIDAY", holiday: "RAMZAN EID", from: "2027-03-10", to: "2027-03-10" },
  { type: "STATE HOLIDAY", holiday: "HOLI", from: "2027-03-22", to: "2027-03-22" },
  { type: "STATE HOLIDAY", holiday: "HOLI / DHULANDI / PANGUNI UTHIRAM", from: "2027-03-23", to: "2027-03-23" },
  { type: "STATE HOLIDAY", holiday: "GOOD FRIDAY", from: "2027-03-26", to: "2027-03-26" }
];

let showAllUpcoming = false;
let deferredPrompt = null;

const elements = {
  upcomingList: document.getElementById("upcomingList"),
  pastList: document.getElementById("pastList"),
  notificationBar: document.getElementById("notificationBar"),
  notificationText: document.getElementById("notificationText"),
  todayEmoji: document.getElementById("todayEmoji"),
  todayStatusText: document.getElementById("todayStatusText"),
  tomorrowEmoji: document.getElementById("tomorrowEmoji"),
  tomorrowStatusText: document.getElementById("tomorrowStatusText"),
  addHolidayBtn: document.getElementById("addHolidayBtn"),
  holidayName: document.getElementById("holidayName"),
  holidayFromDate: document.getElementById("holidayFromDate"),
  holidayToDate: document.getElementById("holidayToDate"),
  showMoreBtn: document.getElementById("showMoreBtn"),
  installBtn: document.getElementById("installBtn"),
  permissionModal: document.getElementById("permissionModal"),
  allowNotifyBtn: document.getElementById("allowNotifyBtn"),
  denyNotifyBtn: document.getElementById("denyNotifyBtn")
};

function getStoredHolidays() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HOLIDAYS));
    return [...DEFAULT_HOLIDAYS];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_HOLIDAYS];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HOLIDAYS));
    return [...DEFAULT_HOLIDAYS];
  }
}

function saveHolidays(holidays) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
}

function toDate(dateString) {
  return new Date(dateString + "T00:00:00");
}

function formatDate(dateString) {
  return toDate(dateString).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function formatDay(dateString) {
  return toDate(dateString).toLocaleDateString(undefined, { weekday: "long" });
}

function dateKey(dateString) {
  const d = toDate(dateString);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

function normalizeRange(item) {
  const from = toDate(item.from);
  const to = toDate(item.to || item.from);
  return { ...item, from, to };
}

function getHolidayDurationInDays(item) {
  const from = toDate(item.from);
  const to = toDate(item.to || item.from);
  const diff = Math.round((to - from) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

function sortedHolidays(holidays) {
  return [...holidays].sort((a, b) => toDate(a.from) - toDate(b.from));
}

function getUpcomingHolidayEntries() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return sortedHolidays(getStoredHolidays()).filter((item) => {
    const holidayEnd = toDate(item.to || item.from);
    return holidayEnd >= startOfToday;
  });
}

function getPastHolidayEntries() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return sortedHolidays(getStoredHolidays())
    .filter((item) => toDate(item.to || item.from) < startOfToday)
    .reverse();
}

function getStatusForDate(dateString) {
  const holidays = getStoredHolidays();
  const target = new Date(dateString + "T00:00:00");

  const match = holidays.find((item) => {
    const from = toDate(item.from);
    const to = toDate(item.to || item.from);
    const current = new Date(target);
    return current >= from && current <= to;
  });

  return match ? { isHoliday: true, name: match.holiday } : { isHoliday: false, name: "Regular day" };
}

function renderStatus() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const tomorrowKey = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toISOString().slice(0, 10);

  const todayResult = getStatusForDate(todayKey);
  const tomorrowResult = getStatusForDate(tomorrowKey);

  elements.todayEmoji.textContent = todayResult.isHoliday ? "😊" : "🙂";
  elements.todayStatusText.textContent = todayResult.isHoliday ? `Holiday: ${todayResult.name}` : "Regular day";

  elements.tomorrowEmoji.textContent = tomorrowResult.isHoliday ? "😊" : "🙂";
  elements.tomorrowStatusText.textContent = tomorrowResult.isHoliday ? `Holiday: ${tomorrowResult.name}` : "Regular day";
}

function renderHolidayList() {
  const upcomingItems = getUpcomingHolidayEntries();
  const pastItems = getPastHolidayEntries();

  if (upcomingItems.length === 0) {
    elements.upcomingList.innerHTML = '<div class="empty-state">No upcoming holidays added.</div>';
  } else {
    const visibleItems = showAllUpcoming ? upcomingItems : upcomingItems.slice(0, 10);

    elements.upcomingList.innerHTML = visibleItems.map((item) => {
      const duration = getHolidayDurationInDays(item);
      const fromDate = formatDate(item.from);
      const toDate = formatDate(item.to || item.from);
      const fromDay = formatDay(item.from);
      const toDay = formatDay(item.to || item.from);
      const displayText = duration > 1 ? `${duration} days` : `${duration} day`;

      const todayDate = new Date();
      const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
      const endOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1);
      const startOfTomorrow = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1);
      const endOfTomorrow = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 2);
      const from = toDate(item.from);
      const to = toDate(item.to || item.from);
      let badge = "Upcoming";

      if (from <= endOfToday && to >= startOfToday) badge = "Today";
      else if (from <= endOfTomorrow && to >= startOfTomorrow) badge = "Tomorrow";

      return `
        <div class="holiday-item holiday-row">
          <div class="holiday-header-row">
            <div class="holiday-name-block">
              <span class="holiday-emoji">${badge === "Today" ? "😊" : badge === "Tomorrow" ? "🎉" : "📌"}</span>
              <div>
                <div class="holiday-name">${item.holiday}</div>
                <div class="holiday-meta">${item.type}</div>
              </div>
            </div>
            <div class="holiday-badge">${badge}</div>
          </div>

          <div class="holiday-date-grid">
            <div>
              <span class="label-small">From</span>
              <div class="date-box"><strong>${fromDate}</strong><small>${fromDay}</small></div>
            </div>
            <div>
              <span class="label-small">To</span>
              <div class="date-box"><strong>${toDate}</strong><small>${toDay}</small></div>
            </div>
            <div>
              <span class="label-small">Duration</span>
              <div class="date-box duration-box"><strong>${displayText}</strong></div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    elements.showMoreBtn.classList.toggle("hidden", upcomingItems.length <= 10 || showAllUpcoming);
  }

  if (pastItems.length === 0) {
    elements.pastList.innerHTML = '<div class="empty-state">No past holidays yet.</div>';
  } else {
    elements.pastList.innerHTML = pastItems.map((item) => {
      const duration = getHolidayDurationInDays(item);
      const fromDate = formatDate(item.from);
      const toDate = formatDate(item.to || item.from);
      const displayText = duration > 1 ? `${duration} days` : `${duration} day`;

      return `
        <div class="holiday-item holiday-row past-row">
          <div class="holiday-header-row">
            <div class="holiday-name-block">
              <span class="holiday-emoji">🗓️</span>
              <div>
                <div class="holiday-name">${item.holiday}</div>
                <div class="holiday-meta">${item.type}</div>
              </div>
            </div>
            <div class="holiday-badge past-badge">Past</div>
          </div>

          <div class="holiday-date-grid">
            <div>
              <span class="label-small">From</span>
              <div class="date-box"><strong>${fromDate}</strong></div>
            </div>
            <div>
              <span class="label-small">To</span>
              <div class="date-box"><strong>${toDate}</strong></div>
            </div>
            <div>
              <span class="label-small">Duration</span>
              <div class="date-box duration-box"><strong>${displayText}</strong></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }
}

function showHolidayTomorrowNotification() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toISOString().slice(0, 10);

  const match = getStoredHolidays().find((item) => {
    const from = item.from;
    const to = item.to || item.from;
    return tomorrowKey >= from && tomorrowKey <= to;
  });

  if (match) {
    const text = `Tomorrow is a holiday: ${match.holiday}! 😄`;
    elements.notificationText.textContent = text;
    elements.notificationBar.classList.remove("hidden");

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Holiday Tomorrow", { body: text });
    }
  } else {
    elements.notificationBar.classList.add("hidden");
  }
}

function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    elements.permissionModal.classList.remove("hidden");
  }
}

function addHoliday() {
  const type = "CUSTOM HOLIDAY";
  const holiday = elements.holidayName.value.trim();
  const from = elements.holidayFromDate.value;
  const to = elements.holidayToDate.value || from;

  if (!holiday || !from) {
    alert("Please add a holiday name and start date.");
    return;
  }

  if (to < from) {
    alert("The end date cannot be before the start date.");
    return;
  }

  const holidays = getStoredHolidays();
  const duplicate = holidays.some((item) => item.holiday.toLowerCase() === holiday.toLowerCase() && item.from === from && item.to === to);

  if (duplicate) {
    alert("This holiday already exists.");
    return;
  }

  const newHoliday = { type, holiday, from, to };
  const updated = sortedHolidays([...holidays, newHoliday]);
  saveHolidays(updated);

  elements.holidayName.value = "";
  elements.holidayFromDate.value = "";
  elements.holidayToDate.value = "";
  showAllUpcoming = false;
  renderAll();
}

function renderAll() {
  renderStatus();
  renderHolidayList();
  showHolidayTomorrowNotification();
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    elements.installBtn.classList.remove("hidden");
  });

  elements.installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log(choice.outcome);
    deferredPrompt = null;
    elements.installBtn.classList.add("hidden");
  });
}

function setupNotifications() {
  elements.allowNotifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      elements.permissionModal.classList.add("hidden");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      elements.notificationBar.classList.remove("hidden");
    }
    elements.permissionModal.classList.add("hidden");
  });

  elements.denyNotifyBtn.addEventListener("click", () => {
    elements.permissionModal.classList.add("hidden");
  });
}

elements.addHolidayBtn.addEventListener("click", addHoliday);
elements.showMoreBtn.addEventListener("click", () => {
  showAllUpcoming = true;
  renderHolidayList();
});

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  requestNotificationPermission();
  setupInstallPrompt();
  setupNotifications();
});
