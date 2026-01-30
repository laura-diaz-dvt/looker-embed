// ============================================
// CLIENTES APP - Solo para usuarios con rol 'cliente'
// ============================================

const iframe = document.getElementById('looker')
const toggleButton = document.getElementById('toggleSidebar')
const sidebar = document.getElementById('sidebar')
const mainContent = document.getElementById('mainContent')

toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('hidden')
})

// URL del router (cambiar por tu URL real)
const ROUTER_URL = 'https://router.tudominio.com';

// Verificar que el usuario tenga rol cliente
function checkUserRole() {
  const savedUser = localStorage.getItem('portalUser');
  
  if (!savedUser) {
    window.location.href = ROUTER_URL;
    return null;
  }

  try {
    const user = JSON.parse(savedUser);
    
    if (user.role !== 'cliente') {
      window.location.href = ROUTER_URL;
      return null;
    }
    
    return user;
  } catch (e) {
    window.location.href = ROUTER_URL;
    return null;
  }
}

// Usuario actual (validado)
let currentUser = checkUserRole();

// Filtros comunes a capturar
const filterValues = {
    Status: null,
    Price: null
}

// Nombres que Looker puede enviar para cada filtro
const filterKeys = {
    Status: ["Status"],
    Price: ["Sale Price"]
}

// Diccionario de filtros por dashboard
const dashboards = {
    356: { 
      filters: { Status: "Status",  Price: "Sale Price" }
    }
}

// Configuración específica de clientes
const roleConfig = {
  homeDashboard: 356,
  allowedDashboards: [356] // Solo puede ver clientes
};

function loadDashboard(dashboardId) {
    const dashboard = dashboards[dashboardId];
    if (!dashboard) return console.error("Dashboard no definido:", dashboardId);
  
    let baseUrl =
      `https://nubalia.cloud.looker.com/embed/dashboards/${dashboardId}` +
      `?embed_domain=https://laura-diaz-dvt.github.io&sdk=3&allow_login_screen=true`;
  
    // recorrer los filtros definidos para ESTE dashboard
    for (const [filterKey, lookerName] of Object.entries(dashboard.filters)) {
      const value = filterValues[filterKey];
      if (!value) continue;
  
      baseUrl += `&${encodeURIComponent(lookerName)}=${encodeURIComponent(value)}`;
    }
  
    iframe.src = baseUrl;
}

// Botón de dashboard (solo clientes)
document.getElementById('btn356').addEventListener('click', () => loadDashboard(356))

// Cargar dashboard inicial
if (currentUser && roleConfig.homeDashboard) {
  loadDashboard(roleConfig.homeDashboard);
}

// Logout - redirigir al router
const btnLogout = document.getElementById('btnLogout')
btnLogout.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('portalUser');
    iframe.src = "about:blank";
    window.location.href = ROUTER_URL;
    console.log("Sesión cerrada correctamente");
})

// Capturar eventos del dashboard
window.addEventListener("message", (event) => {
    if (event.source !== iframe.contentWindow || event.origin !== "https://nubalia.cloud.looker.com") return;
  
    let data;
    try {
      data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch(e) {
      console.error("Error parseando el mensaje:", e);
      return;
    }
  
    if (data.type === "dashboard:run:complete") {
      const filtros = data.dashboard?.dashboard_filters || {};
  
      for (const [key, aliases] of Object.entries(filterKeys)) {
        const value = aliases.map(alias => filtros[alias]).find(v => v !== undefined && v !== null && v !== "");
        if (value !== undefined) filterValues[key] = value;
      }
  
      console.log("Filtros actuales (heredados correctamente):", filterValues);
    }
})
