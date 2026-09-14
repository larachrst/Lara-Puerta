"use strict";

// PERSONALIZACIÓN: instante inicial con desfase explícito (no es UTC).
// 25 de julio de 2026, 14:40 en Ciudad de México = 20:40 UTC.
const TIME_ZONE = "America/Mexico_City";
const relationshipStart = new Date("2026-07-25T14:40:00-06:00");

// Cambia aquí el enlace de la playlist. También existe un enlace de respaldo en index.html.
const PLAYLIST_URL = "https://open.spotify.com/playlist/5QHjeTMbXn9gg1KQ9jpVIE?si=MbZfCyoORVeagJxXU8hp9w&utm_source=copy-link&pi=D6EYwWaESGC-x&pt=a8857941120dca815d912df38e5d5713";

const civilFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE, calendar: "gregory", numberingSystem: "latn",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
});
const DAY_MS = 86400000;

// Partes de calendario de un instante, siempre en la zona de referencia.
// Nunca se utilizan los getters de la zona local del dispositivo.
function civilParts(instant) {
  const result = {};
  for (const part of civilFormatter.formatToParts(instant)) {
    if (part.type !== "literal") result[part.type] = Number(part.value);
  }
  return result;
}

// Date UTC se usa solamente como herramienta de aritmética de calendario.
function civilScalar(p) {
  const date = new Date(0);
  date.setUTCFullYear(p.year, p.month - 1, p.day);
  date.setUTCHours(p.hour || 0, p.minute || 0, p.second || 0, 0);
  return date.getTime();
}

// Convierte hora civil de México a un instante usando las reglas IANA del navegador.
// Así los aniversarios no dependen de la zona donde se visite la página.
function civilInstant(p) {
  const target = civilScalar(p);
  let guess = target;
  for (let i = 0; i < 6; i += 1) {
    const difference = target - civilScalar(civilParts(new Date(guess)));
    if (difference === 0) return new Date(guess);
    guess += difference;
  }
  throw new RangeError("La hora configurada no existe en la zona horaria elegida.");
}

function daysInMonth(year, month) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, 0);
  return date.getUTCDate();
}

// Aniversarios anclados al día ORIGINAL; 31 de enero + 1 mes = último día de febrero.
// + 2 meses vuelve al 31 de marzo, sin acumular el recorte de febrero.
function addMonths(start, count) {
  const index = start.year * 12 + start.month - 1 + count;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return { ...start, year, month, day: Math.min(start.day, daysInMonth(year, month)) };
}
function addDays(start, count) {
  const date = new Date(civilScalar(start) + count * DAY_MS);
  return {
    year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(),
    hour: start.hour, minute: start.minute, second: start.second
  };
}

// Primero meses completos de calendario, luego días completos y finalmente tiempo real.
// No se divide la duración total entre 365 ni entre 30.
function calendarDifference(now = new Date(), startDate = relationshipStart) {
  if (!Number.isFinite(now.getTime()) || !Number.isFinite(startDate.getTime())) {
    throw new RangeError("Fecha inválida.");
  }
  const empty = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (now < startDate) return { ...empty, future: true };
  const start = civilParts(startDate);
  const current = civilParts(now);
  let totalMonths = (current.year - start.year) * 12 + current.month - start.month;
  let anchor = addMonths(start, totalMonths);
  if (civilInstant(anchor) > now) anchor = addMonths(start, --totalMonths);
  let days = Math.floor((civilScalar({ ...current, hour: 0, minute: 0, second: 0 }) -
    civilScalar({ ...anchor, hour: 0, minute: 0, second: 0 })) / DAY_MS);
  let dayAnchor = civilInstant(addDays(anchor, days));
  if (dayAnchor > now) dayAnchor = civilInstant(addDays(anchor, --days));
  const remaining = Math.floor((now.getTime() - dayAnchor.getTime()) / 1000);
  return {
    years: Math.floor(totalMonths / 12), months: totalMonths % 12, days,
    hours: Math.floor(remaining / 3600),
    minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60, future: false
  };
}

function initializePage() {
  const labels = {
    years: ["año", "años"], months: ["mes", "meses"], days: ["día", "días"],
    hours: ["hora", "horas"], minutes: ["minuto", "minutos"], seconds: ["segundo", "segundos"]
  };
  const status = document.getElementById("counter-status");
  const playlist = document.getElementById("playlist-link");
  playlist.href = PLAYLIST_URL;
  const startLabel = document.getElementById("start-date");
  const dateLabel = new Intl.DateTimeFormat("es-MX", {
    timeZone: TIME_ZONE, day: "numeric", month: "long", year: "numeric"
  }).format(relationshipStart);
  const timeLabel = new Intl.DateTimeFormat("es-MX", {
    timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).format(relationshipStart);
  startLabel.textContent = dateLabel + " · " + timeLabel;
  startLabel.dateTime = relationshipStart.toISOString();
  const parts = civilParts(relationshipStart);
  const shortDate = [parts.day, parts.month, parts.year].map(n => String(n).padStart(2, "0")).join(".");
  document.querySelectorAll("[data-short-date]").forEach(el => {
    el.textContent = shortDate;
    el.dateTime = [parts.year, String(parts.month).padStart(2, "0"), String(parts.day).padStart(2, "0")].join("-");
  });

  function render() {
    try {
      const elapsed = calendarDifference(new Date());
      for (const key of Object.keys(labels)) {
        const value = String(elapsed[key]).padStart(2, "0");
        const number = document.getElementById(key);
        if (number.textContent !== value) number.textContent = value;
        document.getElementById(key + "-label").textContent = labels[key][elapsed[key] === 1 ? 0 : 1];
      }
      status.hidden = !elapsed.future;
      status.textContent = elapsed.future ? "Nuestra historia está por comenzar." : "";
    } catch (error) {
      status.hidden = false;
      status.textContent = "No pudimos calcular la fecha. Revisa la hora del dispositivo y vuelve a abrir la página.";
      console.error(error);
    }
  }

  // El temporizador solo pide un nuevo cálculo; nunca acumula segundos.
  // Navegadores pueden pausar pestañas: al regresar se recupera el tiempo real.
  let timer;
  function tick() {
    clearTimeout(timer);
    render();
    if (!document.hidden) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
  }
  document.addEventListener("visibilitychange", tick);
  window.addEventListener("pageshow", tick);
  tick();
}

// Script clásico para funcionar también al abrir index.html con file://.
if (typeof document !== "undefined") initializePage();
// Permite probar el mismo código con Node; el navegador no necesita Node.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calendarDifference, civilParts, civilInstant, addMonths, relationshipStart };
}
