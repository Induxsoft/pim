/*
 * openRecurrenceDialog(options)
 *
 * options:
 *   startDatetime {string} ISO date inicial (yyyy-MM-dd HH:mm). Default: hoy.
 *   duration   {integer}  Duración en minutos. Default: 60.
 *   onConfirm  {function} Callback(config) cuando el usuario pulsa "Crear serie".
 *   onCancel   {function} Callback cuando el usuario cancela.
 *
 * La función inyecta el overlay y los estilos en el DOM.
 * Al cerrar limpia todo lo que inyectó.
 */
function openRecurrenceDialog(options = {})
{
  /* ── Estilos ──────────────────────────────────────────────────── */
  const STYLE_ID = '__rec_dialog_styles';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .rec-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(0,0,0,.45);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
        animation: rec-fade-in .15s ease;
      }
      @keyframes rec-fade-in { from { opacity: 0 } to { opacity: 1 } }

      .rec-dialog {
        background: #fff;
        border-radius: 14px;
        border: 1px solid rgba(0,0,0,.08);
        width: 100%; max-width: 520px;
        box-shadow: 0 8px 32px rgba(0,0,0,.12);
        overflow: hidden;
        animation: rec-slide-up .18s ease;
      }
      @keyframes rec-slide-up {
        from { opacity: 0; transform: translateY(12px) }
        to   { opacity: 1; transform: translateY(0) }
      }

      /* Header */
      .rec-header {
        padding: 1.1rem 1.4rem .9rem;
        border-bottom: 1px solid #ebebeb;
        display: flex; align-items: center; justify-content: space-between;
      }
      .rec-header-title {
        font-size: 15px; font-weight: 600; color: #111;
        display: flex; align-items: center; gap: 8px;
      }
      .rec-header-title svg { color: #2563eb; }
      .rec-btn-close {
        background: none; border: none; cursor: pointer;
        color: #888; padding: 4px; border-radius: 6px;
        display: flex; align-items: center;
        transition: background .1s;
      }
      .rec-btn-close:hover { background: #f4f4f5; color: #111; }

      /* Body */
      .rec-body { padding: 1.2rem 1.4rem; }

      /* Campos genéricos */
      .rec-field { margin-bottom: .9rem; }
      .rec-field label {
        display: block; font-size: 12px; font-weight: 500;
        color: #666; margin-bottom: 5px; letter-spacing: .01em;
      }
      .rec-field input,
      .rec-field select {
        width: 100%;
        height: 36px;
        padding: 0 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 13px;
        color: #111;
        background: #fff;
        font-family: inherit;
        outline: none;
        transition: border-color .15s;
      }
      .rec-field input[type="datetime-local"] {
        padding: 0 8px;
        font-size: 12.5px;   /* el valor datetime-local suele ser algo más ancho */
      }
      .rec-field input:focus,
      .rec-field select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

      .rec-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

      /* Separador con etiqueta */
      .rec-section-label {
        font-size: 11px; font-weight: 600; color: #999;
        text-transform: uppercase; letter-spacing: .07em;
        margin: 1.1rem 0 .7rem;
      }
      .rec-divider {
        border: none; border-top: 1px solid #ebebeb;
        margin: 1.1rem 0 0;
      }

      /* Pills de frecuencia */
      .rec-freq-pills { display: flex; gap: 6px; flex-wrap: wrap; }
      .rec-pill {
        padding: 5px 13px;
        border-radius: 999px;
        border: 1px solid #ddd;
        background: transparent;
        font-size: 12px; font-weight: 500;
        cursor: pointer; color: #444;
        font-family: inherit;
        transition: background .1s, border-color .1s, color .1s;
      }
      .rec-pill:hover { background: #f4f4f5; }
      .rec-pill.active {
        background: #eff6ff; border-color: #2563eb; color: #1d4ed8;
      }

      /* Intervalo */
      .rec-interval-row {
        display: flex; align-items: center; gap: 8px;
        margin-top: 10px;
      }
      .rec-interval-row input {
        width: 64px !important;
        text-align: center;
      }
      .rec-interval-row span { font-size: 13px; color: #555; }

      /* Días de la semana */
      .rec-weekdays { display: flex; gap: 5px; margin-top: 8px; }
      .rec-day-btn {
        width: 34px; height: 34px; border-radius: 50%;
        border: 1px solid #ddd; background: transparent;
        font-size: 11px; font-weight: 600; cursor: pointer;
        color: #444; font-family: inherit;
        display: flex; align-items: center; justify-content: center;
        transition: background .1s, border-color .1s, color .1s;
      }
      .rec-day-btn:hover { background: #f4f4f5; }
      .rec-day-btn.active {
        background: #2563eb; border-color: #2563eb; color: #fff;
      }

      /* Opciones de fin */
      .rec-end-opts { display: flex; flex-direction: column; gap: 9px; }
      .rec-end-opt {
        display: flex; align-items: center; gap: 9px;
        font-size: 13px; color: #333;
      }
      .rec-end-opt input[type="radio"] {
        width: 15px; height: 15px; accent-color: #2563eb;
        flex-shrink: 0;
      }
      .rec-end-opt-fields {
        display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
      }
      .rec-end-opt-fields input {
        width: 72px !important;
        text-align: center;
      }
      .rec-end-opt-fields span { font-size: 13px; color: #555; }

      /* Preview */
      .rec-preview {
        background: #f8faff;
        border: 1px solid #dce8fc;
        border-radius: 8px;
        padding: .65rem .9rem;
        font-size: 12.5px; color: #3b4e6e;
        display: flex; align-items: flex-start; gap: 7px;
        margin-top: .9rem; line-height: 1.5;
      }
      .rec-preview svg { flex-shrink: 0; margin-top: 2px; color: #2563eb; }

      /* Footer */
      .rec-footer {
        padding: .9rem 1.4rem;
        border-top: 1px solid #ebebeb;
        display: flex; align-items: center; justify-content: space-between;
      }
      .rec-count {
        font-size: 12.5px; color: #777;
      }
      .rec-count strong { color: #111; font-weight: 600; }
      .rec-footer-actions { display: flex; gap: 8px; }
      .rec-btn-cancel {
        background: none; border: 1px solid #ddd; border-radius: 8px;
        padding: 7px 15px; font-size: 13px; cursor: pointer;
        color: #333; font-family: inherit;
        transition: background .1s;
      }
      .rec-btn-cancel:hover { background: #f4f4f5; }
      .rec-btn-confirm {
        background: #2563eb; border: none; border-radius: 8px;
        padding: 7px 18px; font-size: 13px; font-weight: 600;
        cursor: pointer; color: #fff; font-family: inherit;
        display: flex; align-items: center; gap: 6px;
        transition: background .1s;
      }
      .rec-btn-confirm:hover { background: #1d4ed8; }

      .rec-hidden { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  /* ── Estado interno ───────────────────────────────────────────── */
  const DAYS = ['D','L','M','X','J','V','S'];

  let startDatetime = options.startDatetime || (dateFormat(new Date()) + 'T09:00');
  let startDate = dateFormat(startDatetime);
  let activeDays = [ DAYS[(new Date(startDatetime)).getDay()] ]; // Día de la semana seleccionado por defecto

  const state = {
    startDatetime,
    startDate,
    duration  : parseInt(options.duration) || 60,
    freq      : 'semanal',
    interval  : 1,
    activeDays,
    endMode   : 'count',
    endCount  : 12,
    endDate   : '',
  };

  /* ── Helpers ──────────────────────────────────────────────────── */
  function fmtDate(d) {
    const m = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
  }
  function addDays(iso, n) {
    const d = new Date(iso.replace(/-/g, '/'));
    d.setDate(d.getDate() + n);
    return d;
  }
  function daysPerOccurrence(freq, interval) {
    return { diario: 1, semanal: 7, quincenal: 14, mensual: 30, anual: 365, personalizado: 1 }[freq] * interval;
  }
  function dateFormat(value) {
    const date = (value instanceof Date) ? value : new Date(value);

    const yyyy = date.getFullYear().toString();
    const MM = (date.getMonth() + 1).toString().padStart(2,'0');
    const dd = date.getDate().toString().padStart(2,'0');

    return yyyy +"-"+ MM +"-"+ dd;
  }
  function datetimeFormat(value) {
    const date = (value instanceof Date) ? value : new Date(value);

    const HH = date.getHours().toString().padStart(2,'0');
    const mm = date.getMinutes().toString().padStart(2,'0');

    return this.dateFormat(date) +" "+ HH +":"+ mm;
  }

  /* ── HTML ─────────────────────────────────────────────────────── */
  function durationsOptions() {
    const DURATIONS = {15:"15 min", 30:"30 min", 45:"45 min", 60:"1 hr", 90:"1.5 hrs", 120:"2 hrs", 150:"2.5 hrs", 180:"3 hrs", 210:"3.5 hrs", 240:"4 hrs"};
    
    let options = '';
    Object.entries(DURATIONS).forEach(entry => {
      const [duration, label] = entry;
      options += `<option value="${duration}" ${(duration == state.duration) ? 'selected' : ''}>${label}</option>`;
    });
    return options;
  }

  const daysHtml = DAYS.map(d =>
    `<button type="button" class="rec-day-btn${(state.activeDays.includes(d)) ? ' active' : ''}" data-day="${d}">${d}</button>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.className = 'rec-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Configurar eventos recurrentes');

  overlay.innerHTML = `
    <div class="rec-dialog">

      <div class="rec-header">
        <div class="rec-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
            <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
            <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
          </svg>
          Repetición del evento
        </div>
        <button type="button" class="rec-btn-close" id="rec-close" aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="rec-body">

        <!-- Fecha inicio + duración -->
        <div class="rec-row">
          <div class="rec-field">
            <label>Fecha y hora de inicio</label>
            <input type="datetime-local" id="rec-start" value="${state.startDatetime}">
          </div>
          <div class="rec-field">
            <label>Duración</label>
            <select id="rec-duration">
              ${durationsOptions(state.duration)}
            </select>
          </div>
        </div>

        <hr class="rec-divider">
        <div class="rec-section-label">Frecuencia</div>

        <div class="rec-freq-pills">
          <button type="button" class="rec-pill" data-freq="diario">Diario</button>
          <button type="button" class="rec-pill active" data-freq="semanal">Semanal</button>
          <button type="button" class="rec-pill" data-freq="quincenal">Quincenal</button>
          <button type="button" class="rec-pill" data-freq="mensual">Mensual</button>
          <button type="button" class="rec-pill" data-freq="anual">Anual</button>
          <button type="button" class="rec-pill" data-freq="personalizado" hidden>Personalizado</button>
        </div>

        <div class="rec-interval-row">
          <span>Cada</span>
          <input type="number" id="rec-interval" min="1" max="99" value="1">
          <span id="rec-interval-unit">semana(s)</span>
        </div>

        <!-- Días de la semana (semanal / quincenal) -->
        <div id="rec-weekday-section">
          <div style="font-size:12px;color:#888;margin-top:10px;margin-bottom:6px">Días</div>
          <div class="rec-weekdays">${daysHtml}</div>
        </div>

        <!-- Opción mensual -->
        <div id="rec-monthly-section" class="rec-hidden">
          <div style="font-size:12px;color:#888;margin-top:10px;margin-bottom:6px">Repetir en</div>
          <div class="rec-field" style="margin-bottom:0">
            <select id="rec-month-mode">
              <option>El mismo día del mes</option>
              <option>El mismo día de la semana</option>
              <option>El último día del mes</option>
            </select>
          </div>
        </div>

        <hr class="rec-divider">
        <div class="rec-section-label">Fin de la serie</div>

        <div class="rec-end-opts">
          <label class="rec-end-opt" hidden>
            <input type="radio" name="rec_end" value="never">
            <span>Sin fecha de fin</span>
          </label>
          <label class="rec-end-opt">
            <input type="radio" name="rec_end" value="count" checked>
            <div class="rec-end-opt-fields">
              <span>Terminar después de</span>
              <input type="number" id="rec-end-count" min="1" max="365" value="12">
              <span>ocurrencias</span>
            </div>
          </label>
          <label class="rec-end-opt">
            <input type="radio" name="rec_end" value="date">
            <div class="rec-end-opt-fields">
              <span>Terminar el</span>
              <input type="date" id="rec-end-date" disabled>
            </div>
          </label>
        </div>

        <!-- Preview -->
        <div class="rec-preview">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span id="rec-preview-text"></span>
        </div>
      </div>

      <div class="rec-footer">
        <div class="rec-count">Se crearán <strong id="rec-count-num">12</strong> eventos</div>
        <div class="rec-footer-actions">
          <button type="button" class="rec-btn-cancel" id="rec-cancel">Cancelar</button>
          <button type="button" class="rec-btn-confirm" id="rec-confirm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  stroke-linejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Crear serie
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  /* ── Referencias ──────────────────────────────────────────────── */
  const $ = id => overlay.querySelector(`#${id}`);
  const startInput     = $('rec-start');
  const durationInput  = $('rec-duration');
  const intervalInput  = $('rec-interval');
  const intervalUnit   = $('rec-interval-unit');
  const weekdaySection = $('rec-weekday-section');
  const monthlySection = $('rec-monthly-section');
  const endCountInput  = $('rec-end-count');
  const endDateInput   = $('rec-end-date');
  const previewText    = $('rec-preview-text');
  const countNum       = $('rec-count-num');

  /* ── Lógica de preview ────────────────────────────────────────── */
  function buildPreview() {
    const { freq, interval, activeDays, endMode, endCount, startDate } = state;
    const dayLabels = { L:'lun', M:'mar', X:'mié', J:'jue', V:'vie', S:'sáb', D:'dom' };
    const dayNames  = activeDays.map(d => dayLabels[d]).join(', ') || 'ningún día';

    let desc = '';
    if (freq === 'diario') desc = `Cada ${interval} día${interval > 1 ? 's' : ''}`;
    else if (freq === 'semanal' || freq === 'quincenal')
      desc = `Cada ${interval} semana${interval > 1 ? 's' : ''} — ${dayNames}`;
    else if (freq === 'mensual') desc = `Cada ${interval} mes${interval > 1 ? 'es' : ''}`;
    else if (freq === 'anual')   desc = `Cada año`;
    else desc = `Cada ${interval} día${interval > 1 ? 's' : ''}`;

    let count, endStr;
    if (endMode === 'never') {
      count  = '∞';
      endStr = 'sin fecha de fin';
    } else if (endMode === 'count') {
      count  = endCount;
      const dpf = daysPerOccurrence(freq, interval);
      const endD = addDays(startDate, (count - 1) * dpf);
      endStr = `del ${fmtDate(new Date(startDate.replace(/-/g, '/')))} al ${fmtDate(endD)}`;
    } else {
      const ed = state.endDate || startDate;
      const span = (new Date(ed.replace(/-/g,'/')) - new Date(startDate.replace(/-/g,'/'))) / 86400000;
      const dpf = daysPerOccurrence(freq, interval);
      count  = Math.max(1, Math.floor(span / dpf) + 1);
      endStr = `hasta el ${fmtDate(new Date(ed.replace(/-/g,'/')))}`;
    }

    const countLabel = count === '∞' ? 'sin límite de' : `${count}`;
    previewText.textContent = `${desc}, ${countLabel} veces · ${endStr}`;
    countNum.textContent     = count;
  }

  /* ── Event listeners ──────────────────────────────────────────── */
  startInput.addEventListener('change', () => {
    state.startDatetime = startInput.value;
    state.startDate = startInput.value.split('T')[0];
    buildPreview();
  });

  durationInput.addEventListener('change', () => {
    state.duration = parseInt(durationInput.value);
    buildPreview();
  });

  intervalInput.addEventListener('change', () => {
    state.interval = parseInt(intervalInput.value) || 1;
    buildPreview();
  });

  const freqUnits = {
    diario:'día(s)', semanal:'semana(s)', quincenal:'semana(s)',
    mensual:'mes(es)', anual:'año(s)', personalizado:'día(s)',
  };
  overlay.querySelectorAll('.rec-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      overlay.querySelectorAll('.rec-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.freq = pill.dataset.freq;
      intervalUnit.textContent = freqUnits[state.freq];
      if (state.freq === 'quincenal') { state.interval = 2; intervalInput.value = 2; }
      else if (state.freq !== 'semanal') { state.interval = 1; intervalInput.value = 1; }
      weekdaySection.classList.toggle('rec-hidden', !['semanal','quincenal'].includes(state.freq));
      monthlySection.classList.toggle('rec-hidden', state.freq !== 'mensual');
      buildPreview();
    });
  });

  overlay.querySelectorAll('.rec-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      state.activeDays = Array.from(overlay.querySelectorAll('.rec-day-btn.active'))
                              .map(b => b.dataset.day);
      buildPreview();
    });
  });

  overlay.querySelectorAll('input[name="rec_end"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.endMode = radio.value;
      endCountInput.disabled = (state.endMode !== 'count');
      endDateInput.disabled  = (state.endMode !== 'date');
      buildPreview();
    });
  });

  endCountInput.addEventListener('change', () => {
    state.endCount = parseInt(endCountInput.value) || 1;
    buildPreview();
  });

  endDateInput.addEventListener('change', () => {
    state.endDate = endDateInput.value;
    buildPreview();
  });

  /* ── Cierre ───────────────────────────────────────────────────── */
  function close() {
    overlay.remove();
    // No elimina el <style> por si hay varios diálogos abiertos
  }

  $('rec-close').addEventListener('click', () => {
    close();
    options.onCancel?.();
  });

  $('rec-cancel').addEventListener('click', () => {
    close();
    options.onCancel?.();
  });

  // Clic fuera del diálogo
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { close(); options.onCancel?.(); }
  });

  // Escape
  function onKeyDown(e) {
    if (e.key === 'Escape') { close(); options.onCancel?.(); document.removeEventListener('keydown', onKeyDown); }
  }
  document.addEventListener('keydown', onKeyDown);

  $('rec-confirm').addEventListener('click', () => {

    /* ── Parseo de la hora seleccionada ─────────────────────────── */
    const dtVal = startInput.value;                          // "2025-06-18T10:00"
    const [startHour, startMin] = dtVal.split('T')[1].split(':').map(Number);
    const totalEnd = startHour * 60 + startMin + state.duration;
    const endHour  = Math.floor(totalEnd / 60) % 24;
    const endMin   = totalEnd % 60;

    /* ── Regla de recurrencia (RFC 5545-like) ───────────────────── */
    const FREQ_MAP = {
      diario: 'DAILY', semanal: 'WEEKLY', quincenal: 'WEEKLY',
      mensual: 'MONTHLY', anual: 'YEARLY', personalizado: 'DAILY',
    };
    const DAY_RRULE = { L:'MO', M:'TU', X:'WE', J:'TH', V:'FR', S:'SA', D:'SU' };

    const rrule = {
      freq    : FREQ_MAP[state.freq],
      interval: state.freq === 'quincenal' ? 2 : state.interval,
      ...((['semanal','quincenal'].includes(state.freq) && state.activeDays.length)
          && { byDay: state.activeDays.map(d => DAY_RRULE[d]) }),
      ...(state.freq === 'mensual'
          && { byMonthMode: overlay.querySelector('#rec-month-mode').value }),
    };

    /* ── Límite de la serie ──────────────────────────────────────── */
    const seriesEnd =
      state.endMode === 'count' ? { type: 'count', value: state.endCount } :
      state.endMode === 'date'  ? { type: 'date',  value: state.endDate  } :
                                  { type: 'never',  value: null           };

    /* ── Expansión de ocurrencias ────────────────────────────────── */
    function expandSeries(rule, startISO, end, maxEvents = 365) {
      const occurrences = [];
      const d = new Date(startISO.replace(/-/g, '/'));
      const endDate = end.type === 'date' ? new Date(end.value.replace(/-/g,'/')) : null;
      const limit   = end.type === 'count' ? end.value : (end.type === 'never' ? maxEvents : maxEvents);

      const isoDate = dt =>
        `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;

      // Para frecuencias con byDay generamos avanzando de a 1 día
      // y filtrando; para el resto avanzamos directamente.
      const byDay = rule.byDay || null;
      const stepDays = { DAILY: rule.interval, WEEKLY: 7 * rule.interval, MONTHLY: 0, YEARLY: 0 };

      let cursor = new Date(d);

      while (occurrences.length < limit) {
        if (endDate && cursor > endDate) break;

        const include = byDay
          ? byDay.includes(['SU','MO','TU','WE','TH','FR','SA'][cursor.getDay()])
          : true;

        if (include) occurrences.push(isoDate(cursor));

        // Avance
        if (rule.freq === 'MONTHLY') {
          cursor.setMonth(cursor.getMonth() + rule.interval);
        } else if (rule.freq === 'YEARLY') {
          cursor.setFullYear(cursor.getFullYear() + rule.interval);
        } else if (byDay) {
          cursor.setDate(cursor.getDate() + stepDays[rule.freq]); // día a día filtrando
          // Evitar iterar más allá de un intervalo completo sin hit
          if (!byDay.includes(['SU','MO','TU','WE','TH','FR','SA'][cursor.getDay()]) &&
              occurrences.length > 0) {
            // Saltar al inicio de la siguiente semana-intervalo si ya pasamos 6 días sin día activo
            const daysSinceLastHit = (cursor - new Date(occurrences[occurrences.length-1].replace(/-/g,'/'))) / 86400000;
            if (daysSinceLastHit >= 7 * rule.interval) {
              cursor.setDate(cursor.getDate() + 7 * rule.interval - (daysSinceLastHit % (7 * rule.interval)));
            }
          }
        } else {
          cursor.setDate(cursor.getDate() + stepDays[rule.freq]);
        }
      }
      return occurrences;
    }

    const occurrences = expandSeries(rrule, state.startDate, seriesEnd);

    /* ── Objeto final ────────────────────────────────────────────── */
    const config = {
      // Regla de recurrencia
      recurrence: {
        freq    : rrule.freq,
        interval: rrule.interval,
        ...(rrule.byDay       && { byDay: rrule.byDay }),
        ...(rrule.byMonthMode && { byMonthMode: rrule.byMonthMode }),
        end     : seriesEnd,
      },

      // Horario de cada evento
      time: {
        start        : `${String(startHour).padStart(2,'0')}:${String(startMin).padStart(2,'0')}`,
        end          : `${String(endHour).padStart(2,'0')}:${String(endMin).padStart(2,'0')}`,
        durationMins : state.duration,
        label        : `${String(startHour).padStart(2,'0')}:${String(startMin).padStart(2,'0')} - ${String(endHour).padStart(2,'0')}:${String(endMin).padStart(2,'0')}`,
      },

      // Primera y última fecha de la serie
      seriesStart : state.startDate,
      seriesEnd   : occurrences.at(-1) ?? state.startDate,

      // Fechas expandidas de cada ocurrencia
      occurrences,

      // Total de eventos que se crearán
      count: occurrences.length,
    };

    close();
    options.onConfirm?.(config);
  });

  /* ── Init ─────────────────────────────────────────────────────── */
  buildPreview();
}