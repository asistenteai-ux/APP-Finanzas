import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empresaApi, EmpresaConfigData } from '../services/api';
import { validarRUT, formatearRUT, agregarGuionRUT } from '../utils/rut';
import { Building2, Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ConfiguracionEmpresa() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<EmpresaConfigData>>({
    rut: '',
    razon_social: '',
    nombre_fantasia: '',
    giro: '',
    direccion: '',
    comuna: '',
    ciudad: '',
    region: '',
    telefono: '',
    email: '',
    sitio_web: '',
    actividad_economica: '',
    representante_legal: '',
    representante_rut: '',
    codigo_sii: '',
    resolucion_sii: '',
    ambiente_sii: 'certificacion',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar configuración existente
  const { data: configResponse, isLoading } = useQuery({
    queryKey: ['empresa-config'],
    queryFn: () => empresaApi.getConfig(),
  });

  useEffect(() => {
    if (configResponse?.data?.data) {
      setFormData(configResponse.data.data);
      if (configResponse.data.data.logo_path) {
        setLogoPreview(`/api${configResponse.data.data.logo_path}`);
      }
    }
  }, [configResponse]);

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: (data: FormData) => empresaApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-config'] });
      setSuccessMessage('Configuración guardada exitosamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (error: any) => {
      setErrors({ general: error.response?.data?.error || 'Error al guardar' });
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validar que solo se ingresen números en campos numéricos
    if (name === 'telefono' && value && !/^\d*$/.test(value)) {
      return; // No permitir caracteres que no sean dígitos
    }

    // Formatear RUT automáticamente
    if (name === 'rut' || name === 'representante_rut') {
      const rutSinFormato = value.replace(/\./g, '').replace(/-/g, '');
      const rutFormateado = rutSinFormato.length > 1 ? agregarGuionRUT(rutSinFormato) : rutSinFormato;
      setFormData((prev) => ({ ...prev, [name]: rutFormateado }));

      // Validar RUT si tiene suficientes caracteres
      if (rutFormateado.length >= 3) {
        if (!validarRUT(rutFormateado)) {
          setErrors((prev) => ({ ...prev, [name]: 'RUT inválido' }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|svg)/)) {
        setErrors({ logo: 'Solo se permiten imágenes (JPG, PNG, GIF, SVG)' });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ logo: 'El logo no puede pesar más de 5MB' });
        return;
      }

      setLogoFile(file);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.logo;
        return newErrors;
      });

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    // Validar campos requeridos
    const requiredFields = ['rut', 'razon_social', 'giro', 'direccion', 'comuna', 'ciudad', 'region'];
    const newErrors: { [key: string]: string } = {};

    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'Este campo es obligatorio';
      }
    });

    // Validar RUTs
    if (formData.rut && !validarRUT(formData.rut)) {
      newErrors.rut = 'RUT inválido';
    }

    if (formData.representante_rut && !validarRUT(formData.representante_rut)) {
      newErrors.representante_rut = 'RUT inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Crear FormData
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        data.append(key, value.toString());
      }
    });

    if (logoFile) {
      data.append('logo', logoFile);
    }

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Empresa</h1>
            <p className="text-gray-600">Configura los datos de tu empresa para facturas y documentos tributarios</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo de Empresa</h2>
            <div className="flex items-center gap-6">
              {logoPreview && (
                <div className="w-32 h-32 border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                <label className="block">
                  <span className="sr-only">Seleccionar logo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Legal:</strong> El logo aparecerá en tus documentos tributarios. Según el SII, es permitido incluir logo de empresa.
                </p>
                <p className="text-sm text-gray-500">Formatos: JPG, PNG, GIF, SVG. Máximo 5MB.</p>
                {errors.logo && <p className="text-sm text-red-600 mt-1">{errors.logo}</p>}
              </div>
            </div>
          </div>

          {/* Datos principales */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos Principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut || ''}
                  onChange={handleChange}
                  placeholder="12345678-9"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.rut ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={12}
                />
                {errors.rut && <p className="text-sm text-red-600 mt-1">{errors.rut}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.razon_social ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.razon_social && <p className="text-sm text-red-600 mt-1">{errors.razon_social}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Fantasía</label>
                <input
                  type="text"
                  name="nombre_fantasia"
                  value={formData.nombre_fantasia || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="giro"
                  value={formData.giro || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.giro ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.giro && <p className="text-sm text-red-600 mt-1">{errors.giro}</p>}
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.direccion ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.direccion && <p className="text-sm text-red-600 mt-1">{errors.direccion}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comuna <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="comuna"
                  value={formData.comuna || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.comuna ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.comuna && <p className="text-sm text-red-600 mt-1">{errors.comuna}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.ciudad ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ciudad && <p className="text-sm text-red-600 mt-1">{errors.ciudad}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Región <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region || ''}
                  onChange={handleChange}
                  placeholder="Ej: Región Metropolitana"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.region ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.region && <p className="text-sm text-red-600 mt-1">{errors.region}</p>}
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono || ''}
                  onChange={handleChange}
                  placeholder="56912345678 (solo números)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                <input
                  type="url"
                  name="sitio_web"
                  value={formData.sitio_web || ''}
                  onChange={handleChange}
                  placeholder="https://www.ejemplo.cl"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actividad Económica</label>
                <input
                  type="text"
                  name="actividad_economica"
                  value={formData.actividad_economica || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Representante Legal */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Representante Legal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  name="representante_legal"
                  value={formData.representante_legal || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RUT Representante</label>
                <input
                  type="text"
                  name="representante_rut"
                  value={formData.representante_rut || ''}
                  onChange={handleChange}
                  placeholder="12345678-9"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.representante_rut ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={12}
                />
                {errors.representante_rut && <p className="text-sm text-red-600 mt-1">{errors.representante_rut}</p>}
              </div>
            </div>
          </div>

          {/* Configuración SII */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración SII</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código SII</label>
                <input
                  type="text"
                  name="codigo_sii"
                  value={formData.codigo_sii || ''}
                  onChange={handleChange}
                  placeholder="Código asignado por el SII"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolución SII</label>
                <input
                  type="text"
                  name="resolucion_sii"
                  value={formData.resolucion_sii || ''}
                  onChange={handleChange}
                  placeholder="Número de resolución"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ambiente SII</label>
                <select
                  name="ambiente_sii"
                  value={formData.ambiente_sii || 'certificacion'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="certificacion">Certificación (Pruebas)</option>
                  <option value="produccion">Producción (Real)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Usar "Certificación" para pruebas, "Producción" para documentos reales
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
            >
              <Save size={20} />
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
