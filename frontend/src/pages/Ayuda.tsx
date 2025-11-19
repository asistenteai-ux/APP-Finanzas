import { BookOpen, FileText, Receipt, FileX, DollarSign, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

const Ayuda = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <BookOpen className="text-purple-600" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Centro de Ayuda</h2>
            <p className="text-gray-600 mt-1">Aprende a usar el sistema y conceptos básicos de contabilidad</p>
          </div>
        </div>
      </div>

      {/* Guías Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ¿Qué documento emitir? */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-600" />
            ¿Qué documento debo emitir?
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <FileText size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Factura Electrónica</h4>
                  <p className="text-sm text-gray-700 mb-2">Usa cuando vendes a:</p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Empresas con RUT</li>
                    <li>Personas que necesitan crédito fiscal</li>
                    <li>Clientes que solicitan factura</li>
                  </ul>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Permite crédito fiscal al cliente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Receipt size={24} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Boleta Electrónica</h4>
                  <p className="text-sm text-gray-700 mb-2">Usa cuando vendes a:</p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Consumidores finales</li>
                    <li>Público general sin RUT de empresa</li>
                    <li>Ventas al por menor</li>
                  </ul>
                  <div className="mt-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-orange-600" />
                    <span className="text-xs text-orange-700 font-medium">NO permite crédito fiscal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-start gap-3">
                <FileX size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Nota de Crédito</h4>
                  <p className="text-sm text-gray-700 mb-2">Usa cuando necesitas:</p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Anular una factura o boleta</li>
                    <li>Hacer devolución de productos</li>
                    <li>Aplicar descuento posterior</li>
                    <li>Corregir error en el monto</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Términos contables */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Conceptos Básicos
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">IVA (Impuesto al Valor Agregado)</h4>
              <p className="text-sm text-gray-600">
                Es un impuesto del 19% que se aplica a la mayoría de los productos y servicios en Chile.
                Se cobra en cada venta y se paga mensualmente al SII.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">Débito Fiscal</h4>
              <p className="text-sm text-gray-600">
                Es el IVA que cobraste en tus ventas. Por ejemplo, si vendiste $100.000,
                el débito fiscal es $19.000 (el IVA que cobraste a tus clientes).
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">Crédito Fiscal</h4>
              <p className="text-sm text-gray-600">
                Es el IVA que pagaste en tus compras con factura. Este IVA lo puedes descontar
                del IVA que cobraste en tus ventas. Solo aplica a facturas de compra, no a boletas.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">Formulario 29 (F29)</h4>
              <p className="text-sm text-gray-600">
                Es la declaración mensual de impuestos que se presenta al SII. Incluye el IVA
                y otros impuestos. Se calcula: Débito Fiscal - Crédito Fiscal = IVA a Pagar.
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">Monto Neto</h4>
              <p className="text-sm text-gray-600">
                Es el precio del producto o servicio SIN IVA. El monto total se calcula sumando
                el neto más el IVA (19%).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Paso a paso */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          Guía Paso a Paso: Emitir tu Primera Factura
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Configura tu Empresa</h4>
              <p className="text-sm text-gray-600">
                Ve a "Configuración Empresa" en el menú y completa todos los datos: RUT, razón social,
                dirección, etc. También sube tu certificado digital del SII.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Ve a Documentos Emitidos</h4>
              <p className="text-sm text-gray-600">
                Haz clic en "Documentos Emitidos" en el menú lateral y luego en "Nueva Factura".
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Ingresa Datos del Cliente</h4>
              <p className="text-sm text-gray-600">
                Completa el RUT y razón social del cliente. El sistema validará que el RUT sea correcto
                automáticamente.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Agrega Productos/Servicios</h4>
              <p className="text-sm text-gray-600">
                Describe qué estás vendiendo, la cantidad y el precio unitario. El sistema calculará
                automáticamente los totales con IVA.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              5
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Revisa y Guarda</h4>
              <p className="text-sm text-gray-600">
                Verifica que todos los datos estén correctos. El sistema generará el XML y lo enviará
                al SII automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preguntas frecuentes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HelpCircle size={20} className="text-purple-600" />
          Preguntas Frecuentes
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">¿Puedo emitir boleta a una empresa?</h4>
            <p className="text-sm text-gray-600">
              No es recomendable. Las empresas necesitan facturas para poder usar el IVA como crédito fiscal.
              Si emites boleta a una empresa, no podrán recuperar el IVA de esa compra.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">¿Cómo anulo un documento que ya envié?</h4>
            <p className="text-sm text-gray-600">
              Debes crear una Nota de Crédito que anule el documento original. No puedes simplemente
              eliminar un documento ya enviado al SII. La Nota de Crédito queda como registro oficial
              de la anulación.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">¿Qué pasa si me equivoco en un monto?</h4>
            <p className="text-sm text-gray-600">
              Si el documento ya fue enviado, debes crear una Nota de Crédito para anularlo y luego
              emitir un nuevo documento con el monto correcto. Si aún no lo has enviado, puedes
              eliminarlo desde la lista de borradores.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">¿Cuándo debo pagar el IVA al SII?</h4>
            <p className="text-sm text-gray-600">
              El IVA se paga mensualmente mediante el Formulario 29, hasta el día 12 del mes siguiente
              (o día 20 si declaras y pagas electrónicamente). El sistema te mostrará cuánto debes pagar
              en el Dashboard.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">¿Qué es el certificado digital?</h4>
            <p className="text-sm text-gray-600">
              Es un archivo que te entrega el SII para firmar electrónicamente tus documentos tributarios.
              Lo necesitas para que tus facturas y boletas sean válidas. Se obtiene en el sitio web del SII
              en la sección de facturación electrónica.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">¿Todas mis compras generan crédito fiscal?</h4>
            <p className="text-sm text-gray-600">
              No. Solo las compras con factura que estén relacionadas con tu actividad comercial generan
              crédito fiscal. Las boletas de compra no generan crédito fiscal. Tampoco las compras que
              sean solo para uso personal.
            </p>
          </div>
        </div>
      </div>

      {/* Contacto y recursos */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <AlertCircle size={20} className="text-blue-600" />
          Recursos Adicionales
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Sitio web del SII:</strong> <a href="https://www.sii.cl" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.sii.cl</a>
          </p>
          <p>
            <strong>Facturación Electrónica SII:</strong> <a href="https://www.sii.cl/servicios_online/1039-1185.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portal de Facturación</a>
          </p>
          <p>
            <strong>Obtener Certificado Digital:</strong> Ingresa al SII con tu clave tributaria → Factura Electrónica → Certificados Digitales
          </p>
          <p className="text-xs text-gray-500 mt-4">
            💡 Tip: Si tienes dudas sobre tu situación tributaria específica, consulta con un contador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ayuda;
