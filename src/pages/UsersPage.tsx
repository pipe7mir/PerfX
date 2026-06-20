import { useState, useEffect } from 'react';
import { UserCenteredForm } from '../components/users/UserCenteredForm';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { ShieldCheck, Users, Settings, Activity, Edit3, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const { user: authUser } = useAuth();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('equipo');

  // Obtener la versión más actualizada del usuario actual desde la base de datos
  const currentUser = users.find(u => u.email === authUser?.email) || authUser;

  const formatName = (email: string | undefined) => {
    if (!email) return 'Administrador';
    const namePart = email.split('@')[0];
    return namePart.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  const visibleUsers = currentUser?.role === 'admin' 
    ? users 
    : users.filter(u => u.email === currentUser?.email || u.id === currentUser?.id);

  const loadUsers = async () => {
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (userData: Partial<any>) => {
    try {
      if (editingUser?.id) {
        await api.users.update(editingUser.id, userData);
        toast.success('Perfil actualizado con éxito');
      } else {
        await api.users.insert({ ...userData, is_active: true });
        toast.success('Analista registrado con éxito');
      }
      loadUsers(); // Refrescar lista
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error guardando usuario');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (id === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta');
      return;
    }
    
    const isConfirmed = await confirm({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar permanentemente el perfil de ${email}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await api.users.delete(id);
        toast.success('Usuario eliminado permanentemente');
        loadUsers();
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Error al eliminar usuario');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 relative animate-in fade-in duration-500">
      {/* Cabecera de Perfil (Cover) */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8 border border-slate-100">
        {/* Portada Decorativa con Gradiente Mesh */}
        <div className="h-40 md:h-56 relative overflow-hidden bg-slate-900">
          {currentUser?.cover_url ? (
            <img src={currentUser.cover_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/40 via-indigo-900/40 to-slate-900"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>
              <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-500 rounded-full mix-blend-screen filter blur-[60px] opacity-20"></div>
            </>
          )}
        </div>
        
        <div className="px-6 md:px-10 pb-8 relative">
          {/* Avatar superpuesto */}
          <div className="flex flex-col md:flex-row justify-between md:items-end -mt-16 md:-mt-20 mb-6 gap-6">
            <div className="flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-slate-50 overflow-hidden shadow-xl flex items-center justify-center text-5xl font-bold text-slate-300 relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser?.avatar_url} alt="Mi Perfil" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.email?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <div className="pb-2 hidden md:block">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {formatName(currentUser?.email)}
                </h1>
                <p className="text-sm text-slate-500 font-medium">{currentUser?.email}</p>
                <p className="text-[13px] font-bold text-blue-600 mt-1 uppercase tracking-widest flex items-center gap-2">
                  {currentUser?.role === 'admin' && <ShieldCheck className="w-4 h-4" />}
                  {currentUser?.role || 'System Admin'}
                </p>
              </div>
            </div>
            
            {currentUser?.role === 'analista' ? (
              <button 
                onClick={() => {
                  setEditingUser(currentUser);
                  setShowForm(true);
                }} 
                className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 shadow-sm border border-slate-200 text-[14px] font-semibold px-6 py-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 w-full md:w-auto"
              >
                <Settings className="w-4 h-4" />
                <span>Editar Mi Perfil</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setShowForm(true);
                }} 
                className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)] text-[14px] font-semibold px-6 py-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 w-full md:w-auto"
              >
                <Users className="w-4 h-4" />
                <span>Registrar Miembro</span>
              </button>
            )}
          </div>

          {/* Info del Usuario Logueado (Mobile) */}
          <div className="md:hidden text-center mt-4">
            <h1 className="text-2xl font-bold text-slate-800 truncate">
              {formatName(currentUser?.email)}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{currentUser?.email}</p>
            <p className="text-[12px] font-bold text-blue-600 mt-1.5 uppercase tracking-widest flex items-center justify-center gap-1.5">
              {currentUser?.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
              {currentUser?.role || 'System Admin'}
            </p>
          </div>
        </div>

        {/* Pestañas (Tabs) */}
        <div className="border-t border-slate-100 px-6 md:px-10 flex gap-8">
          <button 
            className={`py-5 text-[14px] font-semibold transition-all relative flex items-center gap-2.5 ${activeTab === 'equipo' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('equipo')}
          >
            <Users className="w-4 h-4" /> Equipo ({visibleUsers.length})
            {activeTab === 'equipo' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
          </button>
          <button 
            className={`py-5 text-[14px] font-semibold transition-all relative flex items-center gap-2.5 ${activeTab === 'actividad' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('actividad')}
          >
            <Activity className="w-4 h-4" /> Actividad Reciente
            {activeTab === 'actividad' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
          </button>
          <button 
            className={`py-5 text-[14px] font-semibold transition-all relative items-center gap-2.5 hidden md:flex ${activeTab === 'configuracion' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('configuracion')}
          >
            <Settings className="w-4 h-4" /> Ajustes
            {activeTab === 'configuracion' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas (Equipo) */}
      {activeTab === 'equipo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleUsers.map((u, i) => (
            <div 
              key={u.id} 
              className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative group animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Show edit button if admin/supervisor, or if it's the current user's own card */}
              <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor' || currentUser?.id === u.id) && (
                  <button 
                    onClick={() => handleEdit(u)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 shadow-sm"
                    title="Editar Perfil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {currentUser?.role === 'admin' && currentUser?.id !== u.id && (
                  <button 
                    onClick={() => handleDeleteUser(u.id, u.email)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 shadow-sm"
                    title="Eliminar Perfil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full border-[4px] border-slate-50 mb-5 overflow-hidden bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 shadow-sm relative group-hover:border-blue-50 transition-colors">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    u.email.charAt(0).toUpperCase()
                  )}
                </div>
                
                <h3 className="text-[15px] font-bold text-slate-800 truncate w-full mb-0.5">
                  {formatName(u.email)}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium truncate w-full mb-1.5">
                  {u.email}
                </p>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6 border border-slate-200/50">
                  {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                  {u.role}
                </span>

                <div className="w-full flex items-center justify-between mt-auto pt-5 border-t border-slate-100">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Estado</span>
                    {u.is_active ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1.5 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Activo
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1.5 border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inactivo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Registro</span>
                    <span className="text-slate-600 text-[12px] font-semibold">{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vistas mock para otras pestañas */}
      {activeTab === 'actividad' && (
        <div className="bg-white rounded-3xl p-16 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Sin Actividad Reciente</h3>
          <p className="text-slate-500 text-[14px]">El historial de operaciones analíticas del equipo aparecerá aquí.</p>
        </div>
      )}

      <UserCenteredForm 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false);
          setEditingUser(null);
        }} 
        onSubmit={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  );
}
