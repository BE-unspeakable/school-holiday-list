const STORAGE_KEY = "schoolHolidayList_v3";

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
  { type: "STATE HOLIDAY", holiday: "STATE FORMATION DAY", from: "2026-11-01", to: "2026-11-01" },
  { type: "STATE HOLIDAY", holiday: "DIWALI", from: "2026-11-09", to: "2026-11-09" },
  { type: "STATE HOLIDAY", holiday: "DIWALI (NEW YEAR)", from: "2026-11-10", to: "2026-11-10" },
  { type: "STATE HOLIDAY", holiday: "DIWALI (BHAI DUJ)", from: "2026-11-11", to: "2026-11-11" },
  { type: "STATE HOLIDAY", holiday: "GURU NANAK JAYANTI", from: "2026-11-24", to: "2026-11-24" },
  { type: "STATE HOLIDAY", holiday: "CHRISTMAS DAY", from: "2026-12-25", to: "2026-12-25" },
  { type: "STATE HOLIDAY", holiday: "NEW YEAR DAY", from: "2027-01-01", to: "2027-01-01" },
  { type: "NATIONAL HOLIDAY", holiday: "REPUBLIC DAY", from: "2027-01-26", to: "2027-01-26" },
  { type: "STATE HOLIDAY", holiday: "MAHA SHIVRATRI", from: "2027-03-06", to: "2027-03-06" },
  { type: "CITY HOLIDAY", holiday: "RAMZAN EID", from: "2027-03-10", to: "2027-03-10" },
  { type: "STATE HOLIDAY", holiday: "HOLI", from: "2027-03-22", to: "2027-03-22" },
  { type: "STATE HOLIDAY", holiday: "HOLI / DHULANDI", from: "2027-03-23", to: "2027-03-23" },
  { type: "STATE HOLIDAY", holiday: "GOOD FRIDAY", from: "2027-03-26", to: "2027-03-26" }
];

let currentFilter = "upcoming";
let visibleHolidayCount = 10;
let deferredPrompt = null;

const elements = {
  tableBody: document.getElementById("tableBody"),
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
  searchInput: document.getElementById("searchInput"),
  filterBtns: document.querySelectorAll(".filter-btn"),
  installBtn: document.getElementById("installBtn"),
  permissionModal: document.getElementById("permissionModal"),
  allowNotifyBtn: document.getElementById("allowNotifyBtn"),
  denyNotifyBtn: document.getElementById("denyNotifyBtn"),
  showMoreBtn: document.getElementById("showMoreBtn")
};

function getStoredHolidays() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HOLIDAYS));
    return [...DEFAULT_HOLIDAYS];
  }
  try {
    return JSON.parse(saved);
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

function isWeekend(dateString) {
  const day = toDate(dateString).getDay();
  return day === 0 || day === 6;
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getTomorrow() {
  const tomorrow = new Date(getToday());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function getDaysDifference(fromDateStr, toDateStr) {
  const from = toDate(fromDateStr);
  const to = toDate(toDateStr || fromDateStr);
  const today = getToday();

  const daysDiff = Math.round((from - today) / (1000 * 60 * 60 * 24));
  const pastDaysDiff = Math.round((today - to) / (1000 * 60 * 60 * 24));

  return { daysDiff, pastDaysDiff };
}

function getHolidayStatus(item) {
  const from = toDate(item.from);
  const to = toDate(item.to || item.from);
  const today = getToday();
  const tomorrow = getTomorrow();

  if (from <= today && to >= today) return "today";
  if (from <= tomorrow && to >= tomorrow) return "tomorrow";
  if (to < today) return "past";
  return "upcoming";
}

function sortedHolidays(holidays) {
  return [...holidays].sort((a, b) => toDate(a.from) - toDate(b.from));
}

function getFilteredHolidays() {
  let holidays = getStoredHolidays();

  if (currentFilter === "upcoming") {
    const today = getToday();
    holidays = holidays.filter(item => toDate(item.to || item.from) >= today);
  } else if (currentFilter === "past") {
    const today = getToday();
    holidays = holidays.filter(item => toDate(item.to || item.from) < today);
  }

  const searchTerm = elements.searchInput.value.toLowerCase();
  if (searchTerm) {
    holidays = holidays.filter(item =>
      item.holiday.toLowerCase().includes(searchTerm) ||
      item.type.toLowerCase().includes(searchTerm)
    );
  }

  return sortedHolidays(holidays);
}

function renderTable() {
  const holidays = getFilteredHolidays();

  if (holidays.length === 0) {
    elements.tableBody.innerHTML = '<tr class="no-data"><td colspan="7">No holidays found</td></tr>';
    elements.showMoreBtn.classList.add("hidden");
    return;
  }

  const visibleHolidays = holidays.slice(0, visibleHolidayCount);
  elements.tableBody.innerHTML = visibleHolidays.map(item => {
    const { daysDiff, pastDaysDiff } = getDaysDifference(item.from, item.to);
    const status = getHolidayStatus(item);
    const duration = Math.round((toDate(item.to || item.from) - toDate(item.from)) / (1000 * 60 * 60 * 24)) + 1;
    const isWeekendHoliday = isWeekend(item.from);

    let statusBadge = '';
    let daysDisplay = '';
    let rowClass = '';

    if (status === "today") {
      statusBadge = '<div class="status-badge status-today">🎉 Today</div>';
      daysDisplay = '<div class="days-counter soon">Today</div>';
    } else if (status === "tomorrow") {
      statusBadge = '<div class="status-badge status-upcoming">⭐ Tomorrow</div>';
      daysDisplay = '<div class="days-counter soon">1 day</div>';
    } else if (status === "upcoming") {
      statusBadge = `<div class="status-badge status-upcoming">📌 In ${daysDiff} days</div>`;
      daysDisplay = `<div class="days-counter upcoming">${daysDiff} days</div>`;
    } else {
      statusBadge = '<div class="status-badge status-past">📜 Past</div>';
      daysDisplay = `<div class="days-counter past">${pastDaysDiff} days ago</div>`;
    }

    if (isWeekendHoliday) {
      rowClass = ' weekend-row';
    }

    let typeBadge = `<div class="holiday-type">${item.type}</div>`;
    if (item.type.includes("CITY")) {
      typeBadge = `<div class="holiday-type city">${item.type}</div>`;
    } else if (item.type.includes("NATIONAL")) {
      typeBadge = `<div class="holiday-type national">${item.type}</div>`;
    } else if (item.type.includes("CUSTOM")) {
      typeBadge = `<div class="holiday-type custom">${item.type}</div>`;
    }

    return `
      <tr${rowClass}>
        <td><div class="holiday-name">${item.holiday}${isWeekendHoliday ? ' 🌟' : ''}</div></td>
        <td>${typeBadge}</td>
        <td>${formatDate(item.from)}</td>
        <td>${formatDate(item.to || item.from)}</td>
        <td>${duration} ${duration === 1 ? 'day' : 'days'}</td>
        <td>${statusBadge}</td>
        <td>${daysDisplay}</td>
      </tr>
    `;
  }).join("");

  if (holidays.length > visibleHolidayCount) {
    elements.showMoreBtn.classList.remove("hidden");
    elements.showMoreBtn.textContent = "Show more";
  } else {
    elements.showMoreBtn.classList.add("hidden");
  }
}

function renderStatus() {
  const today = getToday();
  const tomorrow = getTomorrow();
  const holidays = getStoredHolidays();

  const todayHoliday = holidays.find(item => {
    const from = toDate(item.from);
    const to = toDate(item.to || item.from);
    return from <= today && to >= today;
  });

  const tomorrowHoliday = holidays.find(item => {
    const from = toDate(item.from);
    const to = toDate(item.to || item.from);
    return from <= tomorrow && to >= tomorrow;
  });

  const todayIsWeekend = today.getDay() === 0 || today.getDay() === 6;
  const tomorrowIsWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;

  let todayText = "Regular day";
  if (todayHoliday) todayText = `Holiday: ${todayHoliday.holiday}`;
  else if (todayIsWeekend) todayText = "Weekend ✨";

  let tomorrowText = "Regular day";
  if (tomorrowHoliday) tomorrowText = `Holiday: ${tomorrowHoliday.holiday}`;
  else if (tomorrowIsWeekend) tomorrowText = "Weekend ✨";

  elements.todayEmoji.textContent = (todayHoliday || todayIsWeekend) ? "😊" : "🙂";
  elements.todayStatusText.textContent = todayText;

  elements.tomorrowEmoji.textContent = (tomorrowHoliday || tomorrowIsWeekend) ? "😊" : "🙂";
  elements.tomorrowStatusText.textContent = tomorrowText;
}

function showTomorrowNotification() {
  const tomorrow = getTomorrow();
  const holidays = getStoredHolidays();
  const tomorrowIsWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;

  const match = holidays.find(item => {
    const from = toDate(item.from);
    const to = toDate(item.to || item.from);
    return from <= tomorrow && to >= tomorrow;
  });

  if (match) {
    const text = `Tomorrow is a holiday: ${match.holiday}! 😄`;
    elements.notificationText.textContent = text;
    elements.notificationBar.classList.remove("hidden");

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Holiday Tomorrow", { body: text });
    }
  } else if (tomorrowIsWeekend) {
    const text = `Tomorrow is a weekend! 🌟 Enjoy your break!`;
    elements.notificationText.textContent = text;
    elements.notificationBar.classList.remove("hidden");
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
    alert("Please enter a holiday name and start date.");
    return;
  }

  if (to < from) {
    alert("End date cannot be before start date.");
    return;
  }

  const holidays = getStoredHolidays();
  const exists = holidays.some(item =>
    item.holiday.toLowerCase() === holiday.toLowerCase() &&
    item.from === from &&
    item.to === to
  );

  if (exists) {
    alert("This holiday already exists.");
    return;
  }

  holidays.push({ type, holiday, from, to });
  saveHolidays(sortedHolidays(holidays));

  elements.holidayName.value = "";
  elements.holidayFromDate.value = "";
  elements.holidayToDate.value = "";

  renderAll();
}

function renderAll() {
  renderStatus();
  renderTable();
  showTomorrowNotification();
}

function setupFilterButtons() {
  elements.filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      visibleHolidayCount = 10;
      renderTable();
    });
  });
}

function setupSearch() {
  elements.searchInput.addEventListener("input", () => {
    visibleHolidayCount = 10;
    renderTable();
  });
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
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    elements.installBtn.classList.add("hidden");
  });
}

function setupNotifications() {
  elements.allowNotifyBtn.addEventListener("click", async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
    elements.permissionModal.classList.add("hidden");
  });

  elements.denyNotifyBtn.addEventListener("click", () => {
    elements.permissionModal.classList.add("hidden");
  });
}

function setupShowMoreButton() {
  elements.showMoreBtn.addEventListener("click", () => {
    const holidays = getFilteredHolidays();
    visibleHolidayCount = holidays.length;
    renderTable();
  });
}

function setDefaultFilter() {
  elements.filterBtns.forEach(btn => {
    if (btn.dataset.filter === "upcoming") {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  currentFilter = "upcoming";
  visibleHolidayCount = 10;
}

document.addEventListener("DOMContentLoaded", () => {
  setDefaultFilter();
  renderAll();
  setupFilterButtons();
  setupSearch();
  requestNotificationPermission();
  setupInstallPrompt();
  setupNotifications();
  setupShowMoreButton();
});

elements.addHolidayBtn.addEventListener("click", addHoliday);
