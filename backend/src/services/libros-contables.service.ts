import { getDatabase } from '../database/schema';
import { XMLBuilder } from 'fast-xml-parser';
import { config } from '../config';
import { format } from 'date-fns';
import forge from 'node-forge';
import fs from 'fs';

/**
 * Servicio para generación de Libros Contables Electrónicos
 * Cumplimiento con normativa SII Chile
 */
export class LibrosContablesService {
  private xmlBuilder: XMLBuilder;

  constructor() {
    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
    });
  }

  /**
   * Genera el Libro de Compras y Ventas (Registro IVA)
   * Obligatorio para declaración mensual F29
   */
  async generarLibroComprasVentas(periodo: string): Promise<string> {
    const db = getDatabase();
    const [year, month] = periodo.split('-');

    // Obtener todas las ventas del período (DTEs emitidos)
    const ventas = db
      .prepare(
        `SELECT * FROM documentos
         WHERE strftime('%Y-%m', fecha_emision) = ?
         AND tipo_documento IN (33, 34, 39, 41, 61)
         ORDER BY fecha_emision, folio`
      )
      .all(periodo) as any[];

    // Obtener todas las compras del período
    const compras = db
      .prepare(
        `SELECT * FROM compras
         WHERE strftime('%Y-%m', fecha_documento) = ?
         ORDER BY fecha_documento, folio`
      )
      .all(periodo) as any[];

    // Calcular totales de ventas
    const totalesVentas = {
      cantidadDocumentos: ventas.length,
      montoNeto: ventas.reduce((sum, v) => sum + v.monto_neto, 0),
      montoIVA: ventas.reduce((sum, v) => sum + v.monto_iva, 0),
      montoTotal: ventas.reduce((sum, v) => sum + v.monto_total, 0),
    };

    // Calcular totales de compras
    const totalesCompras = {
      cantidadDocumentos: compras.length,
      montoNeto: compras.reduce((sum, c) => sum + c.monto_neto, 0),
      montoIVA: compras.filter((c) => c.es_credito_fiscal).reduce((sum, c) => sum + c.monto_iva, 0),
      montoTotal: compras.reduce((sum, c) => sum + c.monto_total, 0),
    };

    // Construir XML según formato SII
    const libroXML = {
      LibroCompraVenta: {
        '@_xmlns': 'http://www.sii.cl/SiiDte',
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xsi:schemaLocation': 'http://www.sii.cl/SiiDte LibroCV_v10.xsd',
        '@_version': '1.0',
        EnvioLibro: {
          '@_ID': `LibroCV-${periodo}`,
          Caratula: {
            RutEmisorLibro: config.sii.rut,
            RutEnvia: config.sii.rut,
            PeriodoTributario: `${year}-${month}`,
            FchResol: '2014-08-22',
            NroResol: 80,
            TipoOperacion: 'COMPRA',
            TipoLibro: 'MENSUAL',
            TipoEnvio: 'TOTAL',
            FolioNotificacion: 1,
          },
          ResumenPeriodo: {
            TotalesPeriodo: [
              {
                '@_TpoDoc': 33,
                TotDoc: ventas.filter((v) => v.tipo_documento === 33).length,
                TotMntExe: 0,
                TotMntNeto: Math.round(
                  ventas.filter((v) => v.tipo_documento === 33).reduce((s, v) => s + v.monto_neto, 0)
                ),
                TotMntIVA: Math.round(
                  ventas.filter((v) => v.tipo_documento === 33).reduce((s, v) => s + v.monto_iva, 0)
                ),
                TotMntTotal: Math.round(
                  ventas.filter((v) => v.tipo_documento === 33).reduce((s, v) => s + v.monto_total, 0)
                ),
              },
              {
                '@_TpoDoc': 39,
                TotDoc: ventas.filter((v) => v.tipo_documento === 39).length,
                TotMntExe: 0,
                TotMntNeto: Math.round(
                  ventas.filter((v) => v.tipo_documento === 39).reduce((s, v) => s + v.monto_neto, 0)
                ),
                TotMntIVA: Math.round(
                  ventas.filter((v) => v.tipo_documento === 39).reduce((s, v) => s + v.monto_iva, 0)
                ),
                TotMntTotal: Math.round(
                  ventas.filter((v) => v.tipo_documento === 39).reduce((s, v) => s + v.monto_total, 0)
                ),
              },
            ],
          },
          // Detalle de ventas
          ...(ventas.length > 0 && {
            Detalle: ventas.map((v) => ({
              '@_TpoDoc': v.tipo_documento,
              NroDoc: v.folio,
              FchDoc: v.fecha_emision,
              RUTDoc: v.rut_receptor,
              RznSoc: v.razon_social_receptor,
              MntNeto: Math.round(v.monto_neto),
              MntIVA: Math.round(v.monto_iva),
              MntTotal: Math.round(v.monto_total),
            })),
          }),
        },
      },
    };

    const xmlString = this.xmlBuilder.build(libroXML);
    const xmlWithDeclaration = `<?xml version="1.0" encoding="ISO-8859-1"?>\n${xmlString}`;

    // Firmar el XML
    const xmlFirmado = this.firmarXML(xmlWithDeclaration);

    return xmlFirmado;
  }

  /**
   * Genera IECV - Información Electrónica de Compras y Ventas
   * Formato obligatorio para envío mensual al SII
   */
  async generarIECV(periodo: string): Promise<string> {
    const db = getDatabase();
    const [year, month] = periodo.split('-');

    // Obtener compras del período
    const compras = db
      .prepare(
        `SELECT * FROM compras
         WHERE strftime('%Y-%m', fecha_documento) = ?
         ORDER BY fecha_documento, folio`
      )
      .all(periodo) as any[];

    // Obtener ventas del período
    const ventas = db
      .prepare(
        `SELECT * FROM documentos
         WHERE strftime('%Y-%m', fecha_emision) = ?
         ORDER BY fecha_emision, folio`
      )
      .all(periodo) as any[];

    const iecvXML = {
      LibroCompraVenta: {
        '@_xmlns': 'http://www.sii.cl/SiiDte',
        '@_version': '1.0',
        EnvioLibro: {
          '@_ID': `IECV-${periodo}`,
          Caratula: {
            RutEmisorLibro: config.sii.rut,
            RutEnvia: config.sii.rut,
            PeriodoTributario: `${year}-${month}`,
            FchResol: '2014-08-22',
            NroResol: 80,
            TipoLibro: 'MENSUAL',
            TipoEnvio: 'TOTAL',
          },
          // Resumen de compras
          ResumenPeriodo: {
            TotalesPeriodo: {
              TpoDoc: [33, 34, 39, 46, 52, 56, 61].map((tipo) => ({
                '@_TpoDoc': tipo,
                TotDoc: compras.filter((c) => c.tipo_documento === tipo).length,
                TotMntNeto: Math.round(
                  compras.filter((c) => c.tipo_documento === tipo).reduce((s, c) => s + c.monto_neto, 0)
                ),
                TotMntIVA: Math.round(
                  compras.filter((c) => c.tipo_documento === tipo).reduce((s, c) => s + c.monto_iva, 0)
                ),
                TotMntTotal: Math.round(
                  compras.filter((c) => c.tipo_documento === tipo).reduce((s, c) => s + c.monto_total, 0)
                ),
              })),
            },
          },
          // Detalle de documentos
          Detalle: [
            ...compras.map((c) => ({
              TpoDoc: c.tipo_documento,
              Folio: c.folio,
              FchDoc: c.fecha_documento,
              RUTDoc: c.rut_proveedor,
              RznSoc: c.razon_social_proveedor,
              MntNeto: Math.round(c.monto_neto),
              TasaImp: 19,
              IVA: Math.round(c.monto_iva),
              MntTotal: Math.round(c.monto_total),
              TpoDocRef: 'C', // C=Compra
            })),
            ...ventas.map((v) => ({
              TpoDoc: v.tipo_documento,
              Folio: v.folio,
              FchDoc: v.fecha_emision,
              RUTDoc: v.rut_receptor,
              RznSoc: v.razon_social_receptor,
              MntNeto: Math.round(v.monto_neto),
              TasaImp: 19,
              IVA: Math.round(v.monto_iva),
              MntTotal: Math.round(v.monto_total),
              TpoDocRef: 'V', // V=Venta
            })),
          ],
        },
      },
    };

    const xmlString = this.xmlBuilder.build(iecvXML);
    const xmlWithDeclaration = `<?xml version="1.0" encoding="ISO-8859-1"?>\n${xmlString}`;

    return this.firmarXML(xmlWithDeclaration);
  }

  /**
   * Genera Libro Diario
   * Obligatorio para empresas que llevan contabilidad completa
   */
  async generarLibroDiario(periodo: string): Promise<string> {
    // Este requiere integración con el sistema contable
    // Por ahora generamos estructura básica
    const [year, month] = periodo.split('-');

    const libroDiarioXML = {
      LibroDiario: {
        '@_xmlns': 'http://www.sii.cl/SiiLce',
        '@_version': '1.0',
        EnvioLibro: {
          '@_ID': `LibroDiario-${periodo}`,
          Caratula: {
            RutEmisorLibro: config.sii.rut,
            RutEnvia: config.sii.rut,
            PeriodoTributario: `${year}-${month}`,
            FchResol: '2014-08-22',
            NroResol: 80,
            TipoLibro: 'DIARIO',
            TipoEnvio: 'TOTAL',
          },
          // Aquí irían los asientos contables
          // Esto requiere un módulo de contabilidad completo
        },
      },
    };

    const xmlString = this.xmlBuilder.build(libroDiarioXML);
    return `<?xml version="1.0" encoding="ISO-8859-1"?>\n${xmlString}`;
  }

  /**
   * Firma digitalmente un XML
   */
  private firmarXML(xmlContent: string): string {
    try {
      const certPath = config.certificate.path;
      const certPassword = config.certificate.password;

      if (!certPath || !fs.existsSync(certPath)) {
        console.warn('⚠️ Certificado no encontrado, devolviendo XML sin firmar');
        return xmlContent;
      }

      const p12Buffer = fs.readFileSync(certPath);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);

      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag]?.[0];

      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

      if (!certBag || !keyBag) {
        throw new Error('No se pudo extraer certificado o clave privada');
      }

      const certificate = certBag.cert!;
      const privateKey = keyBag.key!;

      // Calcular hash
      const md = forge.md.sha1.create();
      md.update(xmlContent, 'utf8');
      const signature = privateKey.sign(md);
      const signatureB64 = forge.util.encode64(signature);

      // Agregar firma al XML
      const signedXml = xmlContent.replace(
        '</EnvioLibro>',
        `  <TmstFirma>${new Date().toISOString()}</TmstFirma>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="">
        <Transforms>
          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
        </Transforms>
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>${forge.util.encode64(md.digest().bytes())}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${signatureB64}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>${forge.util.encode64(
          forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes()
        )}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</EnvioLibro>`
      );

      return signedXml;
    } catch (error: any) {
      console.error('Error al firmar XML:', error.message);
      return xmlContent;
    }
  }

  /**
   * Obtiene resumen para la declaración F29
   */
  async obtenerResumenF29(periodo: string): Promise<any> {
    const db = getDatabase();

    // Ventas (Débito Fiscal)
    const ventas = db
      .prepare(
        `SELECT
          SUM(monto_neto) as total_neto_ventas,
          SUM(monto_iva) as debito_fiscal,
          SUM(monto_total) as total_ventas,
          COUNT(*) as cantidad_ventas
         FROM documentos
         WHERE strftime('%Y-%m', fecha_emision) = ?
         AND tipo_documento IN (33, 39)`
      )
      .get(periodo) as any;

    // Compras (Crédito Fiscal)
    const compras = db
      .prepare(
        `SELECT
          SUM(monto_neto) as total_neto_compras,
          SUM(CASE WHEN es_credito_fiscal = 1 THEN monto_iva ELSE 0 END) as credito_fiscal,
          SUM(monto_total) as total_compras,
          COUNT(*) as cantidad_compras
         FROM compras
         WHERE strftime('%Y-%m', fecha_documento) = ?`
      )
      .get(periodo) as any;

    const debitoFiscal = ventas?.debito_fiscal || 0;
    const creditoFiscal = compras?.credito_fiscal || 0;
    const ivaAPagar = Math.max(0, debitoFiscal - creditoFiscal);
    const ivaAFavor = Math.max(0, creditoFiscal - debitoFiscal);

    return {
      periodo,
      ventas: {
        cantidad: ventas?.cantidad_ventas || 0,
        neto: ventas?.total_neto_ventas || 0,
        iva: debitoFiscal,
        total: ventas?.total_ventas || 0,
      },
      compras: {
        cantidad: compras?.cantidad_compras || 0,
        neto: compras?.total_neto_compras || 0,
        iva: creditoFiscal,
        total: compras?.total_compras || 0,
      },
      resumen: {
        debito_fiscal: Math.round(debitoFiscal),
        credito_fiscal: Math.round(creditoFiscal),
        iva_a_pagar: Math.round(ivaAPagar),
        iva_a_favor: Math.round(ivaAFavor),
      },
    };
  }
}
