const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:5000';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${GATEWAY_URL}/api/v1/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error en upload: ${errorData.error || 'Error desconocido'}`);
  }

  const data = await response.json();
  return data.secure_url;
};
