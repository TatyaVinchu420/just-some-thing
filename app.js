const STORAGE_KEY = "playslot_bookings";

const form = document.getElementById("booking-form");
const statusMessage = document.getElementById("status-message");
const bookingsList = document.getElementById("bookings-list");
const clearBookingsBtn = document.getElementById("clear-bookings");
const venueFilter = document.getElementById("venue-filter");
const statsElement = document.getElementById("stats");

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatDate = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatRange = (startTime, duration) => {
  const start = toMinutes(startTime);
  const end = start + Number(duration) * 60;
  const h = Math.floor(end / 60)
    .toString()
    .padStart(2, "0");
  const m = (end % 60).toString().padStart(2, "0");
  return `${startTime} - ${h}:${m}`;
};

const readBookings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveBookings = (bookings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

const showStatus = (text, type) => {
  statusMessage.textContent = text;
  statusMessage.className = `status ${type === "ok" ? "status--ok" : "status--error"}`;
};

const hasTimeConflict = (newBooking, existingBooking) => {
  const sameVenue = newBooking.venue === existingBooking.venue;
  const sameDate = newBooking.date === existingBooking.date;

  if (!sameVenue || !sameDate) return false;

  const newStart = toMinutes(newBooking.startTime);
  const newEnd = newStart + Number(newBooking.duration) * 60;

  const existingStart = toMinutes(existingBooking.startTime);
  const existingEnd = existingStart + Number(existingBooking.duration) * 60;

  return newStart < existingEnd && existingStart < newEnd;
};

const renderStats = (bookings) => {
  const upcoming = bookings.length;
  const venues = new Set(bookings.map((b) => b.venue)).size;
  const sports = new Set(bookings.map((b) => b.sport)).size;

  statsElement.innerHTML = `
    <strong>${upcoming}</strong> upcoming booking(s) •
    <strong>${venues}</strong> venue(s) in use •
    <strong>${sports}</strong> sport type(s)
  `;
};

const renderBookings = () => {
  const selectedVenue = venueFilter.value;
  const bookings = readBookings().sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  const filteredBookings =
    selectedVenue === "all" ? bookings : bookings.filter((booking) => booking.venue === selectedVenue);

  renderStats(bookings);
  bookingsList.innerHTML = "";

  if (!filteredBookings.length) {
    bookingsList.innerHTML = `<li class="booking-item">No bookings found for this filter.</li>`;
    return;
  }

  for (const booking of filteredBookings) {
    const item = document.createElement("li");
    item.className = "booking-item";
    item.innerHTML = `
      <div class="booking-main">
        <strong>${booking.venue}</strong>
        <span class="tag">${booking.sport}</span>
      </div>
      <p class="booking-meta">
        ${formatDate(booking.date)} • ${formatRange(booking.startTime, booking.duration)}
      </p>
      <p class="booking-meta">Booked by ${booking.name} (${booking.phone})</p>
      ${booking.notes ? `<p class="booking-meta">Note: ${booking.notes}</p>` : ""}
      <button class="delete-btn" data-id="${booking.id}" type="button">Cancel booking</button>
    `;

    bookingsList.appendChild(item);
  }
};

const ensureDateNotPast = () => {
  const dateInput = form.elements.date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateInput.min = today.toISOString().slice(0, 10);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    showStatus("Please fill all required fields.", "error");
    form.reportValidity();
    return;
  }

  const booking = {
    id: crypto.randomUUID(),
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    sport: form.elements.sport.value,
    venue: form.elements.venue.value,
    date: form.elements.date.value,
    startTime: form.elements.startTime.value,
    duration: form.elements.duration.value,
    notes: form.elements.notes.value.trim(),
  };

  const bookings = readBookings();
  const conflicting = bookings.find((existing) => hasTimeConflict(booking, existing));

  if (conflicting) {
    showStatus(
      `That slot overlaps with an existing booking at ${conflicting.startTime} for ${conflicting.venue}.`,
      "error"
    );
    return;
  }

  bookings.push(booking);
  saveBookings(bookings);
  form.reset();
  ensureDateNotPast();
  showStatus("Booking confirmed successfully.", "ok");
  renderBookings();
});

bookingsList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const id = button.dataset.id;
  const updated = readBookings().filter((booking) => booking.id !== id);
  saveBookings(updated);
  renderBookings();
});

clearBookingsBtn.addEventListener("click", () => {
  saveBookings([]);
  renderBookings();
  showStatus("All bookings cleared.", "ok");
});

venueFilter.addEventListener("change", renderBookings);

ensureDateNotPast();
renderBookings();
