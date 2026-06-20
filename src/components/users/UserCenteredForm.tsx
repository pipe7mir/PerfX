import React, { useState, useEffect } from 'react';
import { UserPlus, X, User, Camera, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import type { UserRole, User as UserType } from '../../types';

interface UserCenteredFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<UserType>) => Promise<void>;
  initialData?: UserType | null;
}

export const UserCenteredForm: React.FC<UserCenteredFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('analista');
  const [_password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewCoverUrl, setPreviewCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setEmail(initialData?.email || '');
      setRole(initialData?.role || 'analista');
      setPassword(initialData?.password || '123456');
      setAvatarUrl(initialData?.avatar_url || '');
      setAvatarFile(null);
      setPreviewUrl(initialData?.avatar_url || '');
      setCoverUrl(initialData?.cover_url || '');
      setCoverFile(null);
      setPreviewCoverUrl(initialData?.cover_url || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setPreviewCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalAvatarUrl = avatarUrl || null;
      let finalCoverUrl = coverUrl || null;

      if (avatarFile || coverFile) {
        setUploadProgress(true);
      }

      if (avatarFile) {
        finalAvatarUrl = await api.storage.uploadAvatar(avatarFile);
      }
      
      if (coverFile) {
        finalCoverUrl = await api.storage.uploadCover(coverFile);
      }

      let currentEmail = email;
      if (!isEditing) {
        try {
          await onSubmit({ email: currentEmail, role, avatar_url: finalAvatarUrl || undefined, cover_url: finalCoverUrl || undefined });
          toast.success(`Miembro registrado exitosamente. Entréguele el usuario: ${currentEmail.split('@')[0]} y la clave temporal 123456`, { duration: 6000 });
          onClose();
          return;
        } catch (error: any) {
          if (error.message?.toLowerCase().includes('unique') || error.message?.toLowerCase().includes('duplicate') || error.code === '23505') {
            const currentYear = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 99) + 1;
            currentEmail = currentEmail.replace('@perfx.io', `${currentYear}${randomNum}@perfx.io`);
            await onSubmit({ email: currentEmail, role, avatar_url: finalAvatarUrl || undefined, cover_url: finalCoverUrl || undefined });
            toast.success(`¡Ojo! Hubo duplicado. Se asignó el usuario: ${currentEmail.split('@')[0]} (clave 123456)`, { duration: 8000 });
            onClose();
            return;
          } else {
            throw error;
          }
        }
      } else {
        await onSubmit({ email: currentEmail, role, avatar_url: finalAvatarUrl || undefined, cover_url: finalCoverUrl || undefined });
        toast.success('Perfil actualizado correctamente');
        onClose();
      }
    } catch (error) {
      console.error('Error guardando Usuario:', error);
      toast.error('Error: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100" role="dialog">

        {/* Botón de Cierre Flotante */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-full"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Encabezado Estilo Red Social (Banner + Avatar Integrado) */}
        <div className="relative h-32 border-b border-slate-100 flex items-center justify-center bg-slate-900 overflow-hidden">
          {/* Cover Photo */}
          {previewCoverUrl ? (
            <img src={previewCoverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/40 via-indigo-900/40 to-slate-900"></div>
          )}
          
          {/* Cover Edit Button */}
          <label className="absolute top-3 left-3 z-20 p-2 text-white/80 hover:text-white bg-slate-900/40 hover:bg-slate-900/60 rounded-full transition-all cursor-pointer shadow-sm backdrop-blur-md">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
          </label>

          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="relative group w-24 h-24 bg-white rounded-full p-1 shadow-md border border-slate-100 transition-transform duration-200 hover:scale-105">
              <div className="w-full h-full rounded-full bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-200/60">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="absolute inset-1 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer transition-opacity duration-200">
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Editar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 pt-12">
          <div className="text-center mb-6">
            <h2 className="text-slate-800 font-bold text-lg tracking-tight">
              {isEditing ? 'Modificar Perfil' : 'Nuevo Miembro'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isEditing ? 'Actualiza los datos y permisos de la cuenta' : 'Configura las credenciales de acceso inicial'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isEditing && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nombres y Apellidos
                </label>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Miranda"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      const parts = e.target.value.trim().split(/\s+/);
                      if (parts.length >= 2) {
                        const base = `${parts[0].toLowerCase()}.${parts[parts.length-1].toLowerCase()}`;
                        setEmail(`${base}@perfx.io`);
                      } else if (parts.length === 1 && parts[0]) {
                        setEmail(`${parts[0].toLowerCase()}@perfx.io`);
                      } else {
                        setEmail('');
                      }
                    }}
                    className="w-full bg-transparent text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Campo: Identificador Generado */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isEditing ? 'Identificador' : 'Identificador Generado'}
              </label>
              <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 opacity-80">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder={isEditing ? email : "Se generará automáticamente"}
                  value={email ? email.replace('@perfx.io', '') : ''}
                  readOnly
                  className="w-full bg-transparent text-[14px] font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Campo: Rol en el Sistema */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Rol en el Sistema
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 relative">
                <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-transparent text-[14px] text-slate-800 focus:outline-none appearance-none pr-4 font-medium cursor-pointer"
                >
                  <option value="guest">Invitado (GUEST)</option>
                  <option value="analista">Analista de Fraude</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador Central</option>
                </select>
                <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            {/* Botón de Guardado */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-[14px] font-semibold py-3 rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-pulse">
                    {uploadProgress ? 'Subiendo imagen...' : 'Guardando...'}
                  </span>
                ) : (
                  <>
                    {!isEditing && <UserPlus className="w-4 h-4" />}
                    <span>{isEditing ? 'Guardar Cambios' : 'Registrar Miembro'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};