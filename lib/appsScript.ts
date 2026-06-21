const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

async function callScript(action: string, data?: object) {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_APPS_SCRIPT_URL no está configurada. Sigue el README para desplegar el Apps Script.');
  }

  const isPost = data !== undefined;
  const url = `${BASE_URL}?action=${action}`;

  const options: RequestInit = isPost
    ? {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
        redirect: 'follow',
      }
    : { method: 'GET', redirect: 'follow' };

  const res = await fetch(url, options);
  const text = await res.text();

  let json: { ok: boolean; data?: unknown; error?: string };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Respuesta inválida del Apps Script: ${text.slice(0, 200)}`);
  }

  if (!json.ok) throw new Error(json.error || 'Apps Script error');
  return json.data;
}

async function callScriptGet(action: string, params?: Record<string, string>) {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_APPS_SCRIPT_URL no está configurada.');
  }
  let url = `${BASE_URL}?action=${action}`;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      url += `&${k}=${encodeURIComponent(v)}`;
    });
  }
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const text = await res.text();
  let json: { ok: boolean; data?: unknown; error?: string };
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Respuesta inválida: ${text.slice(0, 200)}`);
  }
  if (!json.ok) throw new Error(json.error || 'Error');
  return json.data;
}

export const appsScript = {
  setup: () => callScript('setup', {}),
  getLeads: () => callScriptGet('getLeads'),
  addLead: (data: object) => callScript('addLead', data),
  updateLead: (data: object) => callScript('updateLead', data),
  deleteLead: (id: string) => callScript('deleteLead', { id }),
  addNota: (data: object) => callScript('addNota', data),
  getNotas: (leadId: string) => callScriptGet('getNotas', { leadId }),
  getConfig: () => callScriptGet('getConfig'),
  getReporte: () => callScript('getReporte', {}),
  sendSlackReporte: (stats: object) => callScript('sendSlackReporte', { stats }),
};
