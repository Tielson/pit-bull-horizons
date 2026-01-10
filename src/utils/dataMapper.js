/**
 * Utilitário para mapear dados entre formato do Supabase (snake_case) 
 * e formato do componente (camelCase)
 */

/**
 * Obter a data atual no fuso horário de Brasília (America/Sao_Paulo)
 */
export const getBrasiliaDate = () => {
  const now = new Date();
  const brasiliaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return brasiliaDate;
};

/**
 * Obter a data atual no fuso horário de Brasília (America/Sao_Paulo)
 * Retorna no formato YYYY-MM-DD
 */
export const getTodayBrasiliaISO = () => {
  const brasiliaDate = getBrasiliaDate();
  const year = brasiliaDate.getFullYear();
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Helper para garantir que temos um objeto Date válido a partir de uma string
 */
const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;
  
  // Se já for um objeto Date
  if (dateStr instanceof Date) return dateStr;

  // Se já for uma ISO string (contém T)
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  // Se for YYYY-MM-DD (formato comum de input date)
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T12:00:00Z');
  }

  // Se for DD/MM/YYYY (formato brasileiro comum)
  if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(`${y}-${m}-${d}T12:00:00Z`);
  }

  // Tentar parse direto
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Converter cliente do formato Supabase para formato do componente
 */
export const mapClientFromSupabase = (supabaseClient) => {
  if (!supabaseClient) return null;
  
  return {
    id: supabaseClient.id,
    name: supabaseClient.name || '',
    phone: supabaseClient.phone || '',
    plan: supabaseClient.plan,
    screens: supabaseClient.screens || 1,
    servers: supabaseClient.servers || 1,
    createdAt: supabaseClient.created_at || new Date().toISOString(),
    expiryDate: supabaseClient.expiry_date || '',
    expiryTime: supabaseClient.expiry_time || '',
    credentials: Array.isArray(supabaseClient.credentials) ? supabaseClient.credentials : [],
    extraInfo: supabaseClient.extra_info || '',
    status: supabaseClient.status || 'active',
  };
};

/**
 * Converter cliente do formato do componente para formato Supabase
 */
export const mapClientToSupabase = (componentClient) => {
  if (!componentClient) return null;
  
  const mapped = {
    name: componentClient.name || '',
    phone: componentClient.phone || '',
    plan: componentClient.plan || null,
    screens: componentClient.screens || 1,
    servers: componentClient.servers || 1,
    expiry_date: componentClient.expiryDate || null,
    expiry_time: componentClient.expiryTime || null,
    credentials: Array.isArray(componentClient.credentials) ? componentClient.credentials : [],
    extra_info: componentClient.extraInfo || null,
    status: componentClient.status || 'active',
  };

  const entryDate = parseDateSafe(componentClient.createdAt);
  if (entryDate) {
    mapped.created_at = entryDate.toISOString();
  }

  return mapped;
};

/**
 * Converter múltiplos clientes do Supabase
 */
export const mapClientsFromSupabase = (supabaseClients) => {
  if (!Array.isArray(supabaseClients)) return [];
  return supabaseClients.map(mapClientFromSupabase).filter(Boolean);
};

/**
 * Converter revendedor do formato Supabase para formato do componente
 */
export const mapResellerFromSupabase = (supabaseReseller) => {
  if (!supabaseReseller) return null;
  
  return {
    id: supabaseReseller.id,
    name: supabaseReseller.name || '',
    phone: supabaseReseller.phone || '',
    credits: supabaseReseller.credits || 0,
    status: supabaseReseller.status || 'active',
    plan: supabaseReseller.plan,
    createdAt: supabaseReseller.created_at || new Date().toISOString(),
    expiryDate: supabaseReseller.expiry_date || '',
    expiryTime: supabaseReseller.expiry_time || '',
    extraInfo: supabaseReseller.extra_info || '',
  };
};

/**
 * Converter revendedor do formato do componente para formato Supabase
 */
export const mapResellerToSupabase = (componentReseller) => {
  if (!componentReseller) return null;
  
  const mapped = {
    name: componentReseller.name || '',
    phone: componentReseller.phone || '',
    credits: componentReseller.credits || 0,
    status: componentReseller.status || 'active',
    plan: componentReseller.plan || null,
    expiry_date: componentReseller.expiryDate || null,
    expiry_time: componentReseller.expiryTime || null,
    extra_info: componentReseller.extraInfo || null,
  };

  const entryDate = parseDateSafe(componentReseller.createdAt);
  if (entryDate) {
    mapped.created_at = entryDate.toISOString();
  }

  return mapped;
};

/**
 * Converter múltiplos revendedores do Supabase
 */
export const mapResellersFromSupabase = (supabaseResellers) => {
  if (!Array.isArray(supabaseResellers)) return [];
  return supabaseResellers.map(mapResellerFromSupabase).filter(Boolean);
};

/**
 * Converter plano do formato Supabase para formato do componente
 */
export const mapPlanFromSupabase = (supabasePlan) => {
  if (!supabasePlan) return null;
  
  return {
    id: supabasePlan.id,
    name: supabasePlan.name,
    price: supabasePlan.price ? String(supabasePlan.price) : '',
    duration: supabasePlan.duration ? String(supabasePlan.duration) : '',
    description: supabasePlan.description || '',
    features: supabasePlan.features || '',
    maxDevices: supabasePlan.max_devices || '',
    quality: supabasePlan.quality || '',
    channels: supabasePlan.channels || '',
    support: supabasePlan.support ?? true,
    createdAt: supabasePlan.created_at ? new Date(supabasePlan.created_at).toISOString() : new Date().toISOString()
  };
};

/**
 * Converter plano do formato do componente para formato Supabase
 */
export const mapPlanToSupabase = (componentPlan) => {
  if (!componentPlan) return null;
  
  return {
    name: componentPlan.name,
    price: componentPlan.price ? parseFloat(componentPlan.price) : 0,
    duration: componentPlan.duration ? parseInt(componentPlan.duration) : 30,
    description: componentPlan.description || null,
    features: componentPlan.features || null,
    max_devices: componentPlan.maxDevices || null,
    quality: componentPlan.quality || null,
    channels: componentPlan.channels || null,
    support: componentPlan.support ?? true
  };
};

/**
 * Converter múltiplos planos do Supabase
 */
export const mapPlansFromSupabase = (supabasePlans) => {
  if (!Array.isArray(supabasePlans)) return [];
  return supabasePlans.map(mapPlanFromSupabase).filter(Boolean);
};

/**
 * Converter comprovante do formato Supabase para formato do componente
 */
export const mapReceiptFromSupabase = (supabaseReceipt) => {
  if (!supabaseReceipt) return null;
  
  return {
    id: supabaseReceipt.id,
    clientId: supabaseReceipt.client_id,
    clientName: supabaseReceipt.client_name,
    clientType: supabaseReceipt.client_type || 'client',
    plan: supabaseReceipt.plan,
    amount: supabaseReceipt.amount ? String(supabaseReceipt.amount) : '0',
    date: supabaseReceipt.payment_date ? new Date(supabaseReceipt.payment_date + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '',
    expiryDate: supabaseReceipt.expiry_date || '',
    paymentMethod: supabaseReceipt.payment_method || '',
    imageUrl: supabaseReceipt.receipt_data?.imageUrl || '',
    createdAt: supabaseReceipt.created_at ? new Date(supabaseReceipt.created_at).toISOString() : new Date().toISOString()
  };
};

/**
 * Converter comprovante do formato do componente para formato Supabase
 */
export const mapReceiptToSupabase = (componentReceipt) => {
  if (!componentReceipt) return null;
  
  // Converter DD/MM/AAAA para YYYY-MM-DD
  let formattedDate = getTodayBrasiliaISO();
  if (componentReceipt.date && componentReceipt.date.includes('/')) {
    const parts = componentReceipt.date.split('/');
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  
  return {
    client_id: componentReceipt.clientId,
    client_name: componentReceipt.clientName || '',
    client_type: componentReceipt.clientType || 'client',
    plan: componentReceipt.plan || null,
    amount: componentReceipt.amount ? parseFloat(String(componentReceipt.amount).replace(',', '.')) : 0,
    payment_date: formattedDate,
    expiry_date: componentReceipt.expiryDate || null,
    payment_method: componentReceipt.paymentMethod || null,
    receipt_data: { 
      imageUrl: componentReceipt.imageUrl 
    }
  };
};

/**
 * Converter múltiplos comprovantes do Supabase
 */
export const mapReceiptsFromSupabase = (supabaseReceipts) => {
  if (!Array.isArray(supabaseReceipts)) return [];
  return supabaseReceipts.map(mapReceiptFromSupabase).filter(Boolean);
};

/**
 * Converter PIX do formato Supabase para formato do componente
 */
export const mapPixFromSupabase = (supabasePix) => {
  if (!supabasePix) return null;
  
  return {
    id: supabasePix.id,
    label: supabasePix.label || 'Sem nome',
    name: supabasePix.name || '',
    key: supabasePix.pix_key || '',
    bank: supabasePix.bank || '',
    message: supabasePix.message || '',
    type: supabasePix.pix_type || 'random',
    createdAt: supabasePix.created_at || new Date().toISOString()
  };
};

/**
 * Converter PIX do formato do componente para formato Supabase
 */
export const mapPixToSupabase = (componentPix) => {
  if (!componentPix) return null;
  
  return {
    label: componentPix.label || 'PIX Salvo',
    name: componentPix.name || '',
    pix_key: componentPix.key || '',
    bank: componentPix.bank || '',
    message: componentPix.message || '',
    pix_type: componentPix.type || 'random'
  };
};

/**
 * Converter múltiplos PIXs do Supabase
 */
export const mapPixsFromSupabase = (supabasePixs) => {
  if (!Array.isArray(supabasePixs)) return [];
  return supabasePixs.map(mapPixFromSupabase).filter(Boolean);
};