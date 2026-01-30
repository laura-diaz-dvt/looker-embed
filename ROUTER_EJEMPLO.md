# Cambios necesarios para separar en 3 repositorios

## Arquitectura propuesta

```
repo-router/          → Punto de entrada que redirige según rol
repo-admin/           → Aplicación solo para admin
repo-ventas/          → Aplicación solo para ventas  
repo-clientes/        → Aplicación solo para clientes
```

## 1. REPOSITORIO ROUTER (punto de entrada)

Este sería el repositorio que maneja el login y redirige según el rol.

### router-app.js (cambios principales)

```javascript
// Configuración de URLs de cada aplicación
const appUrls = {
  admin: 'https://admin.tudominio.com',      // o la URL de tu repo admin
  ventas: 'https://ventas.tudominio.com',   // o la URL de tu repo ventas
  cliente: 'https://clientes.tudominio.com' // o la URL de tu repo clientes
};

// Manejo del formulario de usuario
if (userForm) {
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = userEmailInput.value.trim();
    const role = userRoleSelect.value;

    if (!email || !role) return;

    // Guardar usuario en localStorage
    const userData = { email, role };
    localStorage.setItem('portalUser', JSON.stringify(userData));

    // REDIRIGIR a la aplicación correspondiente según el rol
    const targetUrl = appUrls[role];
    if (targetUrl) {
      window.location.href = targetUrl;
    } else {
      alert('Rol no válido');
    }
  });
}

// Si ya hay un usuario logueado, redirigir automáticamente
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('portalUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      const targetUrl = appUrls[user.role];
      if (targetUrl) {
        window.location.href = targetUrl;
      }
    } catch (e) {
      // Si hay error, mostrar login
    }
  }
});
```

### router-index.html (simplificado)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Portal - Login</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="loginContainer" class="user-bar">
    <form id="userForm" class="user-form">
      <label for="userEmail">Usuario (email):</label>
      <input type="email" id="userEmail" required placeholder="usuario@empresa.com">

      <label for="userRole">Rol:</label>
      <select id="userRole" required>
        <option value="admin">Admin</option>
        <option value="ventas">Ventas</option>
        <option value="cliente">Cliente</option>
      </select>

      <button type="submit">Entrar</button>
    </form>
  </div>

  <script src="router-app.js"></script>
</body>
</html>
```

---

## 2. REPOSITORIO ADMIN (aplicación admin)

### admin-app.js (cambios principales)

```javascript
// Verificar que el usuario tenga rol admin
function checkUserRole() {
  const savedUser = localStorage.getItem('portalUser');
  
  if (!savedUser) {
    // No hay usuario, redirigir al router/login
    window.location.href = 'https://router.tudominio.com'; // URL del router
    return null;
  }

  try {
    const user = JSON.parse(savedUser);
    
    if (user.role !== 'admin') {
      // El usuario no es admin, redirigir al router/login
      window.location.href = 'https://router.tudominio.com';
      return null;
    }
    
    return user;
  } catch (e) {
    window.location.href = 'https://router.tudominio.com';
    return null;
  }
}

// Usuario actual
let currentUser = checkUserRole();

// Configuración específica de admin
const roleConfig = {
  homeDashboard: 356,
  allowedDashboards: [356, 357] // Admin puede ver ambos
};

// Resto del código igual que antes...
function loadDashboard(dashboardId) {
  // ... código existente
}

// Al hacer logout, redirigir al router
btnLogout.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('portalUser');
  iframe.src = "about:blank";
  window.location.href = 'https://router.tudominio.com';
});
```

### admin-index.html (igual que antes, pero sin el login)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Portal Admin</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="portalContainer">
    <button class="toggle-btn" id="toggleSidebar">☰</button>
    
    <div class="sidebar" id="sidebar">
      <img src="img/devo_logo.png" alt="Logo Devoteam" class="logo">
      <button id="btn356" class="menu-button">Clientes</button>
      <button id="btn357" class="menu-button">Ventas</button>
      <button id="btnLogout" class="logout-button">Cerrar Sesión</button>
    </div>

    <div class="main-content" id="mainContent">
      <iframe id="looker" src="..."></iframe>
    </div>
  </div>

  <script src="admin-app.js"></script>
</body>
</html>
```

---

## 3. REPOSITORIO VENTAS (aplicación ventas)

### ventas-app.js

```javascript
// Verificar que el usuario tenga rol ventas
function checkUserRole() {
  const savedUser = localStorage.getItem('portalUser');
  
  if (!savedUser) {
    window.location.href = 'https://router.tudominio.com';
    return null;
  }

  try {
    const user = JSON.parse(savedUser);
    
    if (user.role !== 'ventas') {
      window.location.href = 'https://router.tudominio.com';
      return null;
    }
    
    return user;
  } catch (e) {
    window.location.href = 'https://router.tudominio.com';
    return null;
  }
}

let currentUser = checkUserRole();

// Configuración específica de ventas
const roleConfig = {
  homeDashboard: 357,
  allowedDashboards: [357] // Solo puede ver ventas
};

// Resto igual...
```

### ventas-index.html

```html
<!-- Similar a admin pero solo con el botón de Ventas -->
<div class="sidebar" id="sidebar">
  <img src="img/devo_logo.png" alt="Logo Devoteam" class="logo">
  <button id="btn357" class="menu-button">Ventas</button>
  <button id="btnLogout" class="logout-button">Cerrar Sesión</button>
</div>
```

---

## 4. REPOSITORIO CLIENTES (aplicación clientes)

### clientes-app.js

```javascript
// Verificar que el usuario tenga rol cliente
function checkUserRole() {
  const savedUser = localStorage.getItem('portalUser');
  
  if (!savedUser) {
    window.location.href = 'https://router.tudominio.com';
    return null;
  }

  try {
    const user = JSON.parse(savedUser);
    
    if (user.role !== 'cliente') {
      window.location.href = 'https://router.tudominio.com';
      return null;
    }
    
    return user;
  } catch (e) {
    window.location.href = 'https://router.tudominio.com';
    return null;
  }
}

let currentUser = checkUserRole();

// Configuración específica de clientes
const roleConfig = {
  homeDashboard: 356,
  allowedDashboards: [356] // Solo puede ver clientes
};

// Resto igual...
```

---

## Resumen de cambios

### En el ROUTER:
- ✅ Eliminar toda la lógica del portal (sidebar, iframe, etc.)
- ✅ Después del login, redirigir con `window.location.href` a la URL correspondiente
- ✅ Verificar si hay usuario guardado y redirigir automáticamente

### En cada aplicación (admin/ventas/clientes):
- ✅ Agregar función `checkUserRole()` que valide el rol
- ✅ Si el rol no coincide, redirigir al router
- ✅ Simplificar `roleConfig` para solo incluir los dashboards permitidos
- ✅ Eliminar la pantalla de login (ya no es necesaria)
- ✅ Al hacer logout, redirigir al router

### URLs a configurar:
- Router: `https://router.tudominio.com` (o la URL de tu repo router)
- Admin: `https://admin.tudominio.com` (o la URL de tu repo admin)
- Ventas: `https://ventas.tudominio.com` (o la URL de tu repo ventas)
- Clientes: `https://clientes.tudominio.com` (o la URL de tu repo clientes)
