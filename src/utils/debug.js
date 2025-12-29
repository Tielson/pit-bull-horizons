// Utilitário de debug para capturar erros
export const debugError = (error, context = '') => {
  const errorInfo = {
    message: error?.message || 'Erro desconhecido',
    stack: error?.stack || '',
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.group('🔴 ERRO CAPTURADO');
  console.error('Contexto:', context);
  console.error('Mensagem:', errorInfo.message);
  console.error('Stack:', errorInfo.stack);
  console.error('Info completa:', errorInfo);
  console.groupEnd();

  // Salvar no localStorage para debug posterior
  try {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push(errorInfo);
    // Manter apenas os últimos 10 erros
    if (errors.length > 10) {
      errors.shift();
    }
    localStorage.setItem('app_errors', JSON.stringify(errors));
  } catch (e) {
    console.error('Erro ao salvar debug:', e);
  }

  return errorInfo;
};

// Verificar se há arrays undefined
export const validateArrays = (arrays) => {
  const issues = [];
  
  Object.entries(arrays).forEach(([name, value]) => {
    if (value === undefined) {
      issues.push(`${name} é undefined`);
    } else if (value === null) {
      issues.push(`${name} é null`);
    } else if (!Array.isArray(value)) {
      issues.push(`${name} não é um array (tipo: ${typeof value})`);
    }
  });

  if (issues.length > 0) {
    console.warn('⚠️ Problemas encontrados nos arrays:', issues);
    return false;
  }

  return true;
};

// Log de estado da aplicação
export const logAppState = (state) => {
  console.group('📊 Estado da Aplicação');
  console.log('Clients:', Array.isArray(state.clients) ? `${state.clients.length} itens` : 'NÃO É ARRAY');
  console.log('Resellers:', Array.isArray(state.resellers) ? `${state.resellers.length} itens` : 'NÃO É ARRAY');
  console.log('Plans:', Array.isArray(state.plans) ? `${state.plans.length} itens` : 'NÃO É ARRAY');
  console.log('Receipts:', Array.isArray(state.receipts) ? `${state.receipts.length} itens` : 'NÃO É ARRAY');
  console.log('Loading:', state.loading);
  console.log('Authenticated:', state.isAuthenticated);
  console.groupEnd();
};

