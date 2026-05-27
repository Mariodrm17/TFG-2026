import { login } from '../api.js';
import { setSession } from '../app.js';
import { showSnackbar, escHtml } from '../ui.js';

export async function render(container) {
  document.getElementById('navbar').style.display = 'none';

  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-brand">
        <div class="login-brand-inner">
          <div class="brand-logo-big">ISS</div>
          <h1 class="brand-main-title">WMS Almacén<br>Santander</h1>
          <p class="brand-sub">Sistema de Gestión de Almacén<br>para la cuenta de James Hardie</p>
          <div class="brand-client">
            <strong>🏭 Intermodal Sea Solutions</strong>
            Puerto de Santander · ~68.000 palés/año · 38 sectores<br>
            Reemplaza el sistema legado MS Access
          </div>
        </div>
      </div>

      <div class="login-form-area">
        <div class="login-box">
          <h2 class="login-heading">Iniciar sesión</h2>
          <p class="login-sub">Accede con tus credenciales de almacén</p>

          <div id="login-error" style="display:none" class="alert alert-error"></div>

          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="email">Correo electrónico</label>
              <input class="form-control" type="email" id="email" name="email"
                     placeholder="usuario@almacen.com" required autocomplete="email">
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Contraseña</label>
              <input class="form-control" type="password" id="password" name="password"
                     placeholder="••••••••••" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-login"
                    style="margin-top:1.25rem">
              Entrar al sistema
            </button>
          </form>

          <div class="brand-client" style="margin-top:1.75rem; background:var(--bg); border:1px solid var(--border); border-left:4px solid var(--primary); color:var(--text-muted)">
            <strong style="color:var(--primary)">Credenciales de demo</strong>
            admin@almacen.com / operario@almacen.com<br>
            gerente@almacen.com / viewer@almacen.com<br>
            <span style="font-size:.75rem">Contraseña: <code>Admin2026!</code></span>
          </div>
        </div>
      </div>
    </div>`;

  // Remove default #app padding for login page (full-screen layout)
  container.style.padding = '0';
  container.style.maxWidth = 'none';

  const form    = document.getElementById('login-form');
  const errDiv  = document.getElementById('login-error');
  const btnLogin = document.getElementById('btn-login');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errDiv.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.textContent = 'Autenticando...';

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const data = await login(email, password);
      setSession(data.token, data.usuario);
      // Restore app padding before navigating
      container.style.padding = '';
      container.style.maxWidth = '';
      window.location.hash = '#/layout';
    } catch (err) {
      errDiv.textContent = err.message || 'Credenciales incorrectas';
      errDiv.style.display = 'flex';
      btnLogin.disabled = false;
      btnLogin.textContent = 'Entrar al sistema';
      showSnackbar(err.message, 'error');
    }
  });
}
