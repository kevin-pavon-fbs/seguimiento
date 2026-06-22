const SLACK_BOT_TOKEN = 'REEMPLAZAR_CON_TOKEN';
const SLACK_USER_ID = 'U0AF826DU05';
const SHEET_ID = '1yiNp0-wGl_l9bAJBhnDuz7TiivXOl_fgy3LtKE-8xZI';

const TOQUES = [
  { num: 1,  nombre: 'Email resumen post-llamada',          dia: 0  },
  { num: 2,  nombre: 'Seguimiento WhatsApp',                 dia: 1  },
  { num: 3,  nombre: 'Caso de éxito similar',                dia: 3  },
  { num: 4,  nombre: 'Llamada - Romper objeción',            dia: 7  },
  { num: 5,  nombre: 'Testimonio + garantía reforzada',      dia: 10 },
  { num: 6,  nombre: 'Contenido de valor / Lead Magnet',     dia: 15 },
  { num: 7,  nombre: 'Check-in suave',                       dia: 21 },
  { num: 8,  nombre: 'Llamada - Nuevo ángulo',               dia: 35 },
  { num: 9,  nombre: 'Caso de estudio / Win reciente',       dia: 45 },
  { num: 10, nombre: 'Oferta especial por tiempo limitado',  dia: 60 },
  { num: 11, nombre: 'Check-in suave',                       dia: 70 },
  { num: 12, nombre: 'Llamada final - Decisión',             dia: 80 },
];

const ESTADOS_CONGELADOS = ['Ganado', 'No interesado', 'Perdido'];

// ─── WEB APP ENTRY POINT ───────────────────────────────────────────────────

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const action = e.parameter.action || '';

  try {
    let result;

    if (action === 'setup') {
      result = setupSheets();
    } else if (action === 'getLeads') {
      result = getLeads();
    } else if (action === 'addLead') {
      const data = JSON.parse(e.postData.contents);
      result = addLead(data);
    } else if (action === 'updateLead') {
      const data = JSON.parse(e.postData.contents);
      result = updateLead(data);
    } else if (action === 'deleteLead') {
      const data = JSON.parse(e.postData.contents);
      result = deleteLead(data.id);
    } else if (action === 'addNota') {
      const data = JSON.parse(e.postData.contents);
      result = addNota(data);
    } else if (action === 'getNotas') {
      result = getNotas(e.parameter.leadId);
    } else if (action === 'getConfig') {
      result = getConfig();
    } else if (action === 'getReporte') {
      result = getReporte();
    } else if (action === 'sendSlackReporte') {
      const data = JSON.parse(e.postData.contents);
      result = sendSlackReporte(data.stats);
    } else if (action === 'testSlackAlerta') {
      result = testSlackAlerta();
    } else {
      result = { error: 'Unknown action: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── SETUP ─────────────────────────────────────────────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  let leads = ss.getSheetByName('Leads');
  if (!leads) leads = ss.insertSheet('Leads');
  leads.clearContents();
  leads.getRange(1, 1, 1, 13).setValues([['ID', 'Nombre', 'Fuente', 'Closer', 'Fecha Ingreso', 'Estado', 'Toque Actual', 'Fecha Último Toque', 'Fecha Próximo Toque', 'Notas', 'Slack ID Closer', 'Largo Plazo', 'Próximo Contacto']]);
  leads.getRange(1, 1, 1, 13).setBackground('#1a1a2e').setFontColor('#ffffff').setFontWeight('bold');
  leads.setFrozenRows(1);

  let notas = ss.getSheetByName('Notas');
  if (!notas) notas = ss.insertSheet('Notas');
  notas.clearContents();
  notas.getRange(1, 1, 1, 5).setValues([['ID Nota', 'ID Lead', 'Fecha', 'Closer', 'Nota']]);
  notas.getRange(1, 1, 1, 5).setBackground('#1a1a2e').setFontColor('#ffffff').setFontWeight('bold');

  let config = ss.getSheetByName('Config');
  if (!config) config = ss.insertSheet('Config');
  config.clearContents();
  config.getRange('A1').setValue('NOMBRE CLOSER').setFontWeight('bold');
  config.getRange('B1').setValue('SLACK ID').setFontWeight('bold');
  config.getRange('A2').setValue('Kevin Pavon');
  config.getRange('B2').setValue(SLACK_USER_ID);
  config.getRange('C1').setValue('TOQUE').setFontWeight('bold');
  config.getRange('D1').setValue('DÍA').setFontWeight('bold');
  config.getRange('E1').setValue('DESCRIPCIÓN').setFontWeight('bold');
  TOQUES.forEach(function(t, i) {
    config.getRange(i + 2, 3).setValue(t.num);
    config.getRange(i + 2, 4).setValue(t.dia);
    config.getRange(i + 2, 5).setValue(t.nombre);
  });

  let reportes = ss.getSheetByName('Reportes');
  if (!reportes) reportes = ss.insertSheet('Reportes');
  reportes.clearContents();
  reportes.getRange(1, 1, 1, 7).setValues([['Fecha', 'Total Leads', 'Activos', 'Ganados', 'Cerrados', 'Toques Semana', 'Detalle por Closer']]);
  reportes.getRange(1, 1, 1, 7).setBackground('#1a1a2e').setFontColor('#ffffff').setFontWeight('bold');

  return { message: 'Sheets initialized successfully' };
}

// ─── LEADS ─────────────────────────────────────────────────────────────────

function getLeads() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Leads');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  return data.slice(1).filter(function(r) { return r[0]; }).map(function(row) {
    return {
      id: row[0],
      nombre: row[1],
      fuente: row[2],
      closer: row[3],
      fechaIngreso: row[4] ? formatDateArg(new Date(row[4])) : '',
      estado: row[5] || 'Activo',
      toqueActual: Number(row[6]) || 1,
      fechaUltimoToque: row[7] ? formatDateArg(new Date(row[7])) : '',
      fechaProximoToque: row[8] ? formatDateArg(new Date(row[8])) : '',
      notas: row[9] || '',
      slackIdCloser: row[10] || '',
      largoplazo: row[11] === true || row[11] === 'TRUE',
      proximoContacto: row[12] || '',
    };
  });
}

function addLead(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Leads');
  const id = 'lead_' + Date.now();
  const fechaIngreso = data.fechaIngreso || formatDateArg(new Date());
  const ingresoDate = parseDate(fechaIngreso);
  const fechaProximo = formatDateArg(ingresoDate);

  sheet.appendRow([id, data.nombre, data.fuente, data.closer, fechaIngreso, 'Activo', 1, '', fechaProximo, '', data.slackIdCloser || '', data.largoplazo || false, data.proximoContacto || '']);
  return { id: id, mensaje: 'Lead creado' };
}

function updateLead(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Leads');
  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.id) {
      const row = allData[i];
      if (data.nombre !== undefined) sheet.getRange(i + 1, 2).setValue(data.nombre);
      if (data.fuente !== undefined) sheet.getRange(i + 1, 3).setValue(data.fuente);
      if (data.closer !== undefined) sheet.getRange(i + 1, 4).setValue(data.closer);
      if (data.fechaIngreso !== undefined) sheet.getRange(i + 1, 5).setValue(data.fechaIngreso);
      if (data.estado !== undefined) sheet.getRange(i + 1, 6).setValue(data.estado);
      if (data.toqueActual !== undefined) {
        sheet.getRange(i + 1, 7).setValue(data.toqueActual);
        sheet.getRange(i + 1, 8).setValue(formatDateArg(new Date()));
        const currentEstado = data.estado || row[5];
        if (!ESTADOS_CONGELADOS.includes(currentEstado)) {
          const nextToque = TOQUES.find(function(t) { return t.num === data.toqueActual + 1; });
          if (nextToque) {
            const fechaIngresoStr = typeof row[4] === 'string' ? row[4] : formatDateArg(new Date(row[4]));
            const ingresoDate = parseDate(fechaIngresoStr);
            const nextDate = new Date(ingresoDate.getTime() + nextToque.dia * 86400000);
            sheet.getRange(i + 1, 9).setValue(formatDateArg(nextDate));
          }
        }
      }
      if (data.notas !== undefined) sheet.getRange(i + 1, 10).setValue(data.notas);
      if (data.slackIdCloser !== undefined) sheet.getRange(i + 1, 11).setValue(data.slackIdCloser);
      if (data.largoplazo !== undefined) sheet.getRange(i + 1, 12).setValue(data.largoplazo);
      if (data.proximoContacto !== undefined) sheet.getRange(i + 1, 13).setValue(data.proximoContacto);
      return { mensaje: 'Lead actualizado' };
    }
  }
  throw new Error('Lead no encontrado: ' + data.id);
}

function deleteLead(id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Leads');
  const allData = sheet.getDataRange().getValues();
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { mensaje: 'Lead eliminado' };
    }
  }
  throw new Error('Lead no encontrado');
}

// ─── NOTAS ─────────────────────────────────────────────────────────────────

function addNota(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const notasSheet = ss.getSheetByName('Notas');
  const id = 'nota_' + Date.now();
  const hoy = formatDateArg(new Date());
  notasSheet.appendRow([id, data.leadId, hoy, data.closer, data.nota]);

  const leadsSheet = ss.getSheetByName('Leads');
  const leadsData = leadsSheet.getDataRange().getValues();
  for (let i = 1; i < leadsData.length; i++) {
    if (leadsData[i][0] === data.leadId) {
      leadsSheet.getRange(i + 1, 10).setValue(data.nota);
      break;
    }
  }
  return { id: id, mensaje: 'Nota guardada' };
}

function getNotas(leadId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Notas');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1)
    .filter(function(r) { return r[0] && r[1] === leadId; })
    .map(function(row) { return { id: row[0], leadId: row[1], fecha: row[2], closer: row[3], nota: row[4] }; })
    .reverse();
}

// ─── CONFIG ────────────────────────────────────────────────────────────────

function getConfig() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Config');
  if (!sheet) return { closers: [{ nombre: 'Kevin Pavon', slackId: SLACK_USER_ID }], toques: TOQUES };
  const data = sheet.getDataRange().getValues();
  const closers = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) closers.push({ nombre: data[i][0], slackId: data[i][1] || '' });
  }
  return { closers: closers, toques: TOQUES };
}

function getSlackIdPorCloser(nombreCloser) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Config');
  if (!sheet) return SLACK_USER_ID;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === nombreCloser && data[i][1]) return data[i][1];
  }
  return SLACK_USER_ID; // fallback al admin si el closer no tiene Slack ID
}

// ─── REPORTE ───────────────────────────────────────────────────────────────

function getReporte() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const leadsSheet = ss.getSheetByName('Leads');
  const notasSheet = ss.getSheetByName('Notas');

  const leadsData = leadsSheet.getDataRange().getValues().slice(1).filter(function(r) { return r[0]; });
  const notasData = notasSheet ? notasSheet.getDataRange().getValues().slice(1).filter(function(r) { return r[0]; }) : [];

  const hoy = new Date();
  const hace7dias = new Date(hoy.getTime() - 7 * 86400000);

  const activos = leadsData.filter(function(r) { return r[5] === 'Activo'; }).length;
  const ganados = leadsData.filter(function(r) { return r[5] === 'Ganado'; }).length;
  const cerrados = leadsData.filter(function(r) { return ESTADOS_CONGELADOS.includes(r[5]); }).length;

  const toquesSemana = notasData.filter(function(r) {
    const fecha = new Date(r[2]);
    return fecha >= hace7dias && fecha <= hoy;
  }).length;

  const porCloser = {};
  leadsData.forEach(function(r) {
    const closer = r[3] || 'Sin asignar';
    if (!porCloser[closer]) porCloser[closer] = { activos: 0, ganados: 0, toques: 0 };
    if (r[5] === 'Activo') porCloser[closer].activos++;
    if (r[5] === 'Ganado') porCloser[closer].ganados++;
  });
  notasData.forEach(function(r) {
    const fecha = new Date(r[2]);
    if (fecha >= hace7dias) {
      const closer = r[3] || 'Sin asignar';
      if (!porCloser[closer]) porCloser[closer] = { activos: 0, ganados: 0, toques: 0 };
      porCloser[closer].toques++;
    }
  });

  const stats = {
    totalLeads: leadsData.length,
    activos: activos,
    ganados: ganados,
    cerrados: cerrados,
    toquesSemana: toquesSemana,
    porCloser: porCloser,
    fechaGenerado: Utilities.formatDate(hoy, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy HH:mm'),
  };

  const reportesSheet = ss.getSheetByName('Reportes');
  if (reportesSheet) {
    reportesSheet.appendRow([
      stats.fechaGenerado, stats.totalLeads, stats.activos, stats.ganados,
      stats.cerrados, stats.toquesSemana, JSON.stringify(stats.porCloser)
    ]);
  }

  return stats;
}

// ─── SLACK ─────────────────────────────────────────────────────────────────

function sendSlackReporte(stats, slackToken) {
  const token = slackToken || SLACK_BOT_TOKEN;
  const lines = [
    '📊 *Reporte de Seguimiento — ' + stats.fechaGenerado + '*',
    '',
    '📋 *Resumen General*',
    '• Total leads: ' + stats.totalLeads,
    '• Activos: ' + stats.activos,
    '• Ganados: ' + stats.ganados,
    '• Cerrados/Congelados: ' + stats.cerrados,
    '• Toques última semana: ' + stats.toquesSemana,
    '',
    '👥 *Por Closer*',
  ];
  Object.keys(stats.porCloser).forEach(function(closer) {
    const d = stats.porCloser[closer];
    lines.push('• *' + closer + '*: ' + d.activos + ' activos, ' + d.ganados + ' ganados, ' + d.toques + ' toques');
  });

  UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ channel: SLACK_USER_ID, text: lines.join('\n'), mrkdwn: true }),
    muteHttpExceptions: true,
  });
  return { mensaje: 'Reporte enviado a Slack' };
}

function testSlackAlerta(slackToken) {
  const token = slackToken || SLACK_BOT_TOKEN;
  if (!token || token === 'REEMPLAZAR_CON_TOKEN') {
    throw new Error('SLACK_BOT_TOKEN no está configurado. Agregalo como env var en Vercel.');
  }
  const fechaStr = Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy HH:mm');
  const msg = '🔔 *Test de Alarma — ' + fechaStr + '*\n\n✅ Las notificaciones de seguimiento están funcionando.\n\nEste es el formato de cada mañana a las 5am:\n\n📋 *Seguimientos de HOY*\n• Lead Ejemplo - Toque #2: Seguimiento WhatsApp\n• Otro Lead - Toque #4: Llamada - Romper objeción';
  const resp = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ channel: SLACK_USER_ID, text: msg, mrkdwn: true }),
    muteHttpExceptions: true,
  });
  const json = JSON.parse(resp.getContentText());
  if (!json.ok) throw new Error('Slack error: ' + json.error);
  return { mensaje: 'Test enviado a Slack' };
}

// ─── DAILY TRIGGER ─────────────────────────────────────────────────────────

function checkLeadsDelDia() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Leads');
  const data = sheet.getDataRange().getValues();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const pendientes = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const nombre = row[1];
    const estado = row[5];
    const fechaIngreso = row[4] ? new Date(row[4]) : null;
    if (!nombre || ESTADOS_CONGELADOS.includes(estado) || !fechaIngreso || isNaN(fechaIngreso.getTime())) continue;
    const dias = Math.floor((hoy - fechaIngreso) / 86400000);
    const toque = TOQUES.find(function(t) { return t.dia === dias; });
    if (!toque) continue;

    // Update sheet
    sheet.getRange(i + 1, 7).setValue(toque.num);
    sheet.getRange(i + 1, 9).setValue(formatDateArg(hoy));

    pendientes.push({ nombre: nombre, toque: toque });
  }

  if (pendientes.length === 0) return;

  // Build ONE message for all pending leads
  const fechaStr = Utilities.formatDate(hoy, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy');
  const lines = ['🎯 *Seguimientos de HOY — ' + fechaStr + '*', ''];
  pendientes.forEach(function(p) {
    lines.push('• ' + p.nombre + ' - Toque #' + p.toque.num + ': ' + p.toque.nombre);
  });
  lines.push('');
  lines.push('Total: ' + pendientes.length + ' seguimiento' + (pendientes.length !== 1 ? 's' : '') + ' pendiente' + (pendientes.length !== 1 ? 's' : ''));

  UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + SLACK_BOT_TOKEN },
    payload: JSON.stringify({ channel: SLACK_USER_ID, text: lines.join('\n'), mrkdwn: true }),
    muteHttpExceptions: true,
  });
}

function configurarTrigger5am() {
  ScriptApp.getProjectTriggers()
    .filter(function(t) { return t.getHandlerFunction() === 'checkLeadsDelDia'; })
    .forEach(function(t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('checkLeadsDelDia')
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .create();
  SpreadsheetApp.getUi().alert('✅ Trigger configurado a las 5am.');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎯 Seguimiento Leads')
    .addItem('Configurar trigger 5am', 'configurarTrigger5am')
    .addItem('Ejecutar check ahora', 'checkLeadsDelDia')
    .addToUi();
}

// ─── UTILS ─────────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return new Date();
  if (str instanceof Date) return str;
  const parts = str.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(str);
}

function formatDateArg(date) {
  return Utilities.formatDate(date, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy');
}
