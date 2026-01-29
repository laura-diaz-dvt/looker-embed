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