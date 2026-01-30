// ============================================
// ROUTER - Punto de entrada que redirige según rol
// ============================================

// Configuración de URLs de cada aplicación
// CAMBIA ESTAS URLs por las de tus repositorios reales
const appUrls = {
  admin: 'https://admin.tudominio.com',      // URL del repo admin
  ventas: 'https://ventas.tudominio.com',   // URL del repo ventas
  cliente: 'https://clientes.tudominio.com' // URL del repo clientes
};

// Manejo del formulario de usuario
const userForm = document.getElementById('userForm');
const userEmailInput = document.getElementById('userEmail');
const userRoleSelect = document.getElementById('userRole');

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
        // Redirigir automáticamente si ya está logueado
        window.location.href = targetUrl;
      }
    } catch (e) {
      // Si hay error parseando, mostrar login
      console.error('Error al leer usuario guardado:', e);
    }
  }
});
