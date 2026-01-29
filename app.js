const iframe = document.getElementById('looker')
const toggleButton = document.getElementById('toggleSidebar')
const sidebar = document.getElementById('sidebar')
const mainContent = document.getElementById('mainContent')

toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('hidden')
})


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

// Diccionario de filtros por dashboard, con los nombres que Looker espera
const dashboards = {
    356: { 
    //   title: "Bienvenida/o al Portal Mobilize",
      filters: { Status: "Status",  Price: "Sale Price" }
    },
    357: { 
    //   title: "Ventas",
      filters: { Status: "Status", Price: "Sale Price" }
    }
  }


// Usuario actual (PoC, no conectado al SSO real)
let currentUser = null;

// Configuración de qué ve cada rol en el portal
const roleConfig = {
  admin: {
    homeDashboard: 356,
    allowedDashboards: [356, 357]
  },
  ventas: {
    homeDashboard: 357,
    allowedDashboards: [357]
  },
  cliente: {
    homeDashboard: 356,
    allowedDashboards: [356]
  }
};


function loadDashboard(dashboardId) {
    const dashboard = dashboards[dashboardId];
    if (!dashboard) return console.error("Dashboard no definido:", dashboardId);
  
    // title.textContent = dashboard.title;

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

// Botones de dashboards
document.getElementById('btn356').addEventListener('click', () => loadDashboard(356))
document.getElementById('btn357').addEventListener('click', () => loadDashboard(357))


function applyUserToUI() {
    const infoSpan = document.getElementById('userInfo');
    const btn356 = document.getElementById('btn356');
    const btn357 = document.getElementById('btn357');
    const portalContainer = document.getElementById('portalContainer');
    const loginContainer = document.getElementById('loginContainer');
  
    if (!currentUser) {
      portalContainer.classList.add('hidden');   // portal oculto
      if (loginContainer) loginContainer.classList.remove('hidden'); // mostrar login centrado
      return;
    }
  
    const cfg = roleConfig[currentUser.role];
    if (infoSpan) infoSpan.textContent = `${currentUser.email} (${currentUser.role})`;
    portalContainer.classList.remove('hidden');  // mostrar portal
    if (loginContainer) loginContainer.classList.add('hidden'); // ocultar pantalla de login
  
    if (cfg) {
      btn356.style.display = cfg.allowedDashboards.includes(356) ? '' : 'none';
      btn357.style.display = cfg.allowedDashboards.includes(357) ? '' : 'none';
    } else {
      btn356.style.display = '';
      btn357.style.display = '';
    }
}


function initUserFromStorage() {
  // Siempre empezamos sin usuario para forzar la pantalla de login
  currentUser = null;
  applyUserToUI();
}


// Manejo del formulario de usuario (PoC)
const userForm = document.getElementById('userForm');
const userEmailInput = document.getElementById('userEmail');
const userRoleSelect = document.getElementById('userRole');

if (userForm) {
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = userEmailInput.value.trim();
    const role = userRoleSelect.value;

    if (!email || !role) return;

    currentUser = { email, role };
    localStorage.setItem('portalUser', JSON.stringify(currentUser));

    applyUserToUI();

    const cfg = roleConfig[role];
    if (cfg) {
      loadDashboard(cfg.homeDashboard);
    }
  });
}

// Inicializar usuario al cargar la página
document.addEventListener('DOMContentLoaded', initUserFromStorage);

const btnLogout = document.getElementById('btnLogout')

btnLogout.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('portalUser');
    iframe.src = "about:blank";
    applyUserToUI();
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