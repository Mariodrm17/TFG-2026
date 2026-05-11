const bcrypt  = require('bcryptjs');
const { pool } = require('../config/database');

// GET /api/usuarios - UC-11: Listar usuarios (admin)
async function listarUsuarios(req, res) {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json({ usuarios });
  } catch (err) {
    console.error('Error en listarUsuarios:', err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

// POST /api/usuarios - UC-11: Crear operario (admin)
async function crearUsuario(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Nombre, email, contraseña y rol son obligatorios' });
  }

  if (!['visualizador', 'operario', 'gerente', 'administrador'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Usa visualizador, operario, gerente o administrador' });
  }

  try {
    const [[existente]] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rol]
    );

    res.status(201).json({ mensaje: 'Usuario creado correctamente', id: result.insertId });
  } catch (err) {
    console.error('Error en crearUsuario:', err);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
}

// PUT /api/usuarios/:id - UC-11: Modificar usuario (admin - SF-A)
async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { nombre, rol, activo, password } = req.body;

  // Impedir que el admin se desactive a sí mismo
  if (activo === 0 && parseInt(id) === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
  }

  try {
    const campos = [];
    const valores = [];

    if (nombre !== undefined) { campos.push('nombre = ?'); valores.push(nombre); }
    if (rol    !== undefined) { campos.push('rol = ?');    valores.push(rol); }
    if (activo !== undefined) { campos.push('activo = ?'); valores.push(activo ? 1 : 0); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      campos.push('password = ?');
      valores.push(hash);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos a actualizar' });
    }

    valores.push(id);
    await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error('Error en actualizarUsuario:', err);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario };
