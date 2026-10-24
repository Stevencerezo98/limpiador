import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Mail,
  UploadCloud,
  FileSpreadsheet,
  Download,
  BarChart3,
  Sliders,
  Check,
  X,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { SystemUser, UserRole, UserPermissions, DEFAULT_ROLE_PERMISSIONS, UserSession } from '../server/db/schema.ts';

interface UsersManagerSectionProps {
  session: UserSession;
}

export const UsersManagerSection: React.FC<UsersManagerSectionProps> = ({ session }) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [savingUser, setSavingUser] = useState(false);

  // Estados del Formulario
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('digitalizador');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formPermissions, setFormPermissions] = useState<UserPermissions>(DEFAULT_ROLE_PERMISSIONS.digitalizador);
  const [showPassword, setShowPassword] = useState(false);

  // Cargar lista de usuarios desde GET /api/admin/users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      if (!res.ok) {
        throw new Error('No se pudo cargar el listado de usuarios (HTTP ' + res.status + ')');
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setErrorMessage(data.message || 'Error al obtener usuarios.');
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [session.token]);

  // Abrir modal de creación
  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('digitalizador');
    setFormStatus('active');
    setFormPermissions({ ...DEFAULT_ROLE_PERMISSIONS.digitalizador });
    setShowPassword(false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const openEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPassword(''); // Vacío a menos que desee cambiarla
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPermissions({
      ...(DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.custom),
      ...(user.permissions || {}),
    });
    setShowPassword(false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Cambio de rol predeterminado: aplica los permisos por defecto de ese rol
  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    if (newRole !== 'custom' && DEFAULT_ROLE_PERMISSIONS[newRole]) {
      setFormPermissions({ ...DEFAULT_ROLE_PERMISSIONS[newRole] });
    }
  };

  // Conmutar un permiso individual
  const togglePermission = (key: keyof UserPermissions) => {
    setFormPermissions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Si modifica manualmente, el rol se convierte en personalizado
      setFormRole('custom');
      return next;
    });
  };

  // Guardar usuario (Crear o Actualizar)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim()) {
      setErrorMessage('El nombre completo y el nombre de usuario son obligatorios.');
      return;
    }
    if (!editingUser && !formPassword.trim()) {
      setErrorMessage('Debe asignar una contraseña para el nuevo usuario.');
      return;
    }

    try {
      setSavingUser(true);
      setErrorMessage('');

      const payload = {
        name: formName.trim(),
        username: formUsername.trim().toLowerCase(),
        password: formPassword.trim() || undefined,
        role: formRole,
        status: formStatus,
        permissions: formPermissions,
      };

      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al guardar el usuario.');
      }

      setSuccessMessage(data.message || 'Usuario guardado exitosamente.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setSavingUser(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (user: SystemUser) => {
    if (user.username === 'admin') {
      alert('El Administrador principal no puede ser eliminado.');
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar permanentemente al usuario "${user.name}" (@${user.username})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al eliminar usuario.');
      }
      setSuccessMessage(`Usuario @${user.username} eliminado correctamente.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchUsers();
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  // Contar cuántos permisos tiene activos un usuario
  const countActivePermissions = (perms?: UserPermissions) => {
    if (!perms) return 0;
    return Object.values(perms).filter(Boolean).length;
  };

  // Colores para cada rol
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: '👑 Administrador',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'marketing':
        return {
          label: '✉️ Marketing & Envíos',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'digitalizador':
        return {
          label: '📥 Digitalizador',
          bg: 'bg-sky-100 text-sky-800 border-sky-200',
        };
      case 'visor':
        return {
          label: '👁️ Visor (Solo Lectura)',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'custom':
      default:
        return {
          label: '⚙️ Personalizado',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header con el Botón Azul Prominente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/10 text-[#00a2c7] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Gestión de Usuarios & Control de Accesos (RBAC)
            </h2>
            <p className="text-xs text-slate-500">
              Crea colaboradores, define sus contraseñas y personaliza exactamente qué pueden ver y hacer.
            </p>
          </div>
        </div>

        {/* BOTÓN AZUL PROMINENTE PARA AGREGAR NUEVO USUARIO */}
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ea8] text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Agregar Nuevo Usuario</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Lista de Usuarios Registrados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Usuarios del Sistema ({users.length})
          </h3>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00a2c7]" />
            Cargando lista de usuarios...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 mb-3">No hay usuarios registrados aún.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-[#00a2c7] text-white text-xs font-bold"
            >
              Crear primer usuario
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Usuario / Nombre</th>
                  <th className="px-4 py-3">Rol Asignado</th>
                  <th className="px-4 py-3 text-center">Permisos Activos</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  const activePermsCount = countActivePermissions(u.permissions);
                  const isRootAdmin = u.username === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      {/* Nombre y username */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#00a2c7]/15 text-[#00a2c7] font-extrabold flex items-center justify-center uppercase text-xs border border-[#00a2c7]/20 shrink-0">
                            {u.name ? u.name.charAt(0) : u.username.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${roleBadge.bg}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Permisos */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          {activePermsCount} de 13 permisos
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#00a2c7] hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                            title="Editar rol, permisos y contraseña"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#00a2c7]" />
                            <span>Editar</span>
                          </button>

                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PARA CREAR / EDITAR USUARIO Y MATRIZ DE PERMISOS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl p-6 my-8 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Encabezado del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00a2c7]/10 text-[#00a2c7] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingUser ? `Editar Usuario: ${editingUser.name}` : 'Crear Nuevo Usuario'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configura credenciales y define qué podrá ver y hacer en la plataforma.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-5 text-xs">
              {/* Datos Generales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: María González"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de Usuario (Login) *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUser && editingUser.username === 'admin')}
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Ej: mgonzalez"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#00a2c7] disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Contraseña y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña de Acceso *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado de la Cuenta</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#00a2c7]"
                  >
                    <option value="active">✓ Activo (Puede iniciar sesión)</option>
                    <option value="inactive">✕ Inactivo (Acceso suspendido)</option>
                  </select>
                </div>
              </div>

              {/* Selección de Rol con Presets */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Seleccionar Rol & Plantilla de Permisos:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['admin', 'marketing', 'digitalizador', 'visor', 'custom'] as UserRole[]).map((r) => {
                    const badge = getRoleBadge(r);
                    const isSelected = formRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#00a2c7]/10 border-[#00a2c7] text-[#00a2c7] font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs">{badge.label.split(' ')[0]}</span>
                        <span className="text-[10px] uppercase font-bold leading-tight">
                          {r === 'admin'
                            ? 'Admin'
                            : r === 'marketing'
                            ? 'Marketing'
                            : r === 'digitalizador'
                            ? 'Digitalizador'
                            : r === 'visor'
                            ? 'Visor'
                            : 'Personalizado'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MATRIZ DE PERMISOS: LO QUE PUEDE VER Y HACER */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#00a2c7]" />
                    <span>Lo que este usuario PUEDE ver y hacer ({countActivePermissions(formPermissions)} de 13 activos)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Marca o desmarca casillas libremente</span>
                </div>

                <div className="space-y-4">
                  {/* Grupo 1: Carga y Depuración */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Depuración & Listas
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canUploadFiles}
                          onChange={() => togglePermission('canUploadFiles')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Subir Archivos Masivos</span>
                          <span className="text-[10px] text-slate-500">Cargar .csv, .xlsx, .txt para depurar</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canValidateSingle}
                          onChange={() => togglePermission('canValidateSingle')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Validación Individual</span>
                          <span className="text-[10px] text-slate-500">Verificar 1 correo en tiempo real</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={formPermissions.canManageCategories}
                          onChange={() => togglePermission('canManageCategories')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Administrar Listas / Categorías</span>
                          <span className="text-[10px] text-slate-500">Crear nuevas categorías, renombrarlas o vaciarlas</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Grupo 2: Exportación y Edición */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Exportación & Edición
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canExportData}
                          onChange={() => togglePermission('canExportData')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Exportar Listas Limpias</span>
                          <span className="text-[10px] text-slate-500">Descargar a Excel, CSV y TXT</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canEditEmails}
                          onChange={() => togglePermission('canEditEmails')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Editar Correos en Tabla</span>
                          <span className="text-[10px] text-slate-500">Corregir tipografías manualmente</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Grupo 3: Limpieza y Purga */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Limpieza & Purga
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canPurgeInvalid}
                          onChange={() => togglePermission('canPurgeInvalid')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Purgar Inválidos en 1 Clic</span>
                          <span className="text-[10px] text-slate-500">Eliminar rebotes duros de inmediato</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canDeleteEmails}
                          onChange={() => togglePermission('canDeleteEmails')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Borrado Masivo de Correos</span>
                          <span className="text-[10px] text-slate-500">Eliminar contactos seleccionados</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Grupo 4: Marketing y Envíos */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Email Marketing & Envíos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canManageCampaigns}
                          onChange={() => togglePermission('canManageCampaigns')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Crear y Enviar Campañas</span>
                          <span className="text-[10px] text-slate-500">Envíos masivos a listas válidas</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canConfigureSmtp}
                          onChange={() => togglePermission('canConfigureSmtp')}
                          className="w-4 h-4 rounded text-[#00a2c7] focus:ring-[#00a2c7]"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Configurar Servidor SMTP</span>
                          <span className="text-[10px] text-slate-500">Ajustes de Gmail, SendGrid, etc.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Grupo 5: Administración y Seguridad */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Administración del Sistema
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-50/60 border border-purple-200 hover:bg-purple-50 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canManageUsers}
                          onChange={() => togglePermission('canManageUsers')}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600"
                        />
                        <div>
                          <span className="font-bold text-purple-950 block text-[11px]">Gestionar Usuarios</span>
                          <span className="text-[10px] text-purple-700/80">Crear y cambiar roles</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-50/60 border border-purple-200 hover:bg-purple-50 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canManageSystemPlans}
                          onChange={() => togglePermission('canManageSystemPlans')}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600"
                        />
                        <div>
                          <span className="font-bold text-purple-950 block text-[11px]">Planes y Créditos</span>
                          <span className="text-[10px] text-purple-700/80">Ajustar planes y bolsa</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-50/60 border border-purple-200 hover:bg-purple-50 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formPermissions.canBackupRestore}
                          onChange={() => togglePermission('canBackupRestore')}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600"
                        />
                        <div>
                          <span className="font-bold text-purple-950 block text-[11px]">Respaldar Servidor</span>
                          <span className="text-[10px] text-purple-700/80">Descargar / restaurar db</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción en el Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ea8] disabled:opacity-50 text-white font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingUser ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
