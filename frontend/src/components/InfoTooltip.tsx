import { Info, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface InfoTooltipProps {
  title?: string;
  content: string;
  type?: 'info' | 'help';
  size?: 'sm' | 'md' | 'lg';
}

export default function InfoTooltip({ title, content, type = 'info', size = 'md' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const Icon = type === 'info' ? Info : HelpCircle;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-blue-500 hover:text-blue-600 focus:outline-none transition-colors"
      >
        <Icon size={iconSizes[size]} />
      </button>

      {isVisible && (
        <div className="absolute z-50 left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fadeIn">
          {title && (
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icon size={16} className="text-blue-500" />
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
          <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
        </div>
      )}
    </div>
  );
}

// Componente específico para ayuda contable
interface AyudaContableProps {
  tipo: 'factura' | 'boleta' | 'nota-credito' | 'nota-debito' | 'credito-fiscal';
}

export function AyudaContable({ tipo }: AyudaContableProps) {
  const ayudas = {
    factura: {
      title: '¿Qué es una Factura?',
      content: 'Documento que se emite a empresas o personas con RUT. Permite al cliente usar el IVA como crédito fiscal. Se debe emitir cuando vendes a otra empresa. Incluye IVA (19%).',
    },
    boleta: {
      title: '¿Qué es una Boleta?',
      content: 'Documento que se emite a consumidores finales (personas sin RUT de empresa). No permite crédito fiscal. Se usa en ventas al público general. Incluye IVA (19%).',
    },
    'nota-credito': {
      title: '¿Cuándo usar Nota de Crédito?',
      content: 'Se usa para anular o corregir una factura o boleta ya emitida. Casos comunes: devolución de productos, descuento posterior, error en el monto, anulación total del documento.',
    },
    'nota-debito': {
      title: '¿Cuándo usar Nota de Débito?',
      content: 'Se usa para aumentar el monto de una factura ya emitida. Casos: cobrar intereses por mora, agregar servicios adicionales, corregir un monto que quedó menor.',
    },
    'credito-fiscal': {
      title: '¿Qué es el Crédito Fiscal?',
      content: 'Es el IVA que pagaste en tus compras y que puedes restar del IVA que cobraste en tus ventas. Solo aplica a facturas de compra, no a boletas. Se declara en el F29.',
    },
  };

  const ayuda = ayudas[tipo];

  return (
    <InfoTooltip
      title={ayuda.title}
      content={ayuda.content}
      type="help"
    />
  );
}
