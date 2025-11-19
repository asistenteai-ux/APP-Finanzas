import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import forge from 'node-forge';
import fs from 'fs';
import { config } from '../../config';
import { SIIAuthService } from './auth.service';
import { getDatabase } from '../../database/schema';
import axios from 'axios';

export interface DTEData {
  tipoDocumento: number; // 33=Factura, 39=Boleta, 52=Guía, 61=Nota Crédito
  folio: number;
  fechaEmision: string; // YYYY-MM-DD
  receptor: {
    rut: string;
    razonSocial: string;
    giro?: string;
    direccion?: string;
    comuna?: string;
    ciudad?: string;
  };
  detalles: Array<{
    numeroLinea: number;
    nombreItem: string;
    descripcion?: string;
    cantidad: number;
    unidadMedida?: string;
    precioUnitario: number;
    descuentoPorcentaje?: number;
    descuentoMonto?: number;
  }>;
  referencias?: Array<{
    tipoDocumento: number;
    folio: number;
    fechaDocumento: string;
    razonReferencia?: string;
  }>;
}

/**
 * Servicio para generación y envío de DTEs (Documentos Tributarios Electrónicos)
 */
export class DTEService {
  private xmlBuilder: XMLBuilder;
  private xmlParser: XMLParser;
  private authService: SIIAuthService;

  constructor() {
    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      suppressEmptyNode: true,
    });
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    this.authService = new SIIAuthService();
  }

  /**
   * Obtiene los datos de la empresa desde la base de datos
   */
  private getEmpresaData(): any {
    const db = getDatabase();
    const empresa = db.prepare('SELECT * FROM configuracion_empresa WHERE id = 1').get();

    if (!empresa) {
      // Fallback a configuración por variables de entorno
      return {
        rut: config.sii.rut,
        razon_social: config.sii.companyName,
        giro: config.sii.companyActivity,
        direccion: config.sii.companyAddress,
        comuna: 'Santiago',
        ciudad: 'Santiago',
        codigo_sii: '',
        resolucion_sii: '',
        actividad_economica: '620200',
        ambiente_sii: config.sii.environment,
      };
    }

    return empresa;
  }

  /**
   * Genera el XML del DTE según formato SII oficial
   * Cumple con: Schema EnvioDTE_v10.xsd del SII
   */
  generateDTEXML(dteData: DTEData): string {
    const { tipoDocumento, folio, fechaEmision, receptor, detalles, referencias } = dteData;

    // Obtener datos de la empresa
    const empresa: any = this.getEmpresaData();

    // Validar que el RUT esté en formato correcto (sin puntos, con guión)
    const rutEmisor = this.formatRUT(empresa.rut);
    const rutReceptor = this.formatRUT(receptor.rut);

    // Calcular totales - IMPORTANTE: SII usa enteros sin decimales
    let montoNeto = 0;
    const detallesXML = detalles.map((detalle, index) => {
      const montoLinea = Math.round(detalle.cantidad * detalle.precioUnitario);
      const descuento = Math.round(detalle.descuentoMonto || 0);
      const montoNetoLinea = montoLinea - descuento;
      montoNeto += montoNetoLinea;

      return {
        NroLinDet: index + 1, // Numeración secuencial automática
        NmbItem: detalle.nombreItem.substring(0, 80), // Máx 80 caracteres
        ...(detalle.descripcion && { DscItem: detalle.descripcion.substring(0, 1000) }),
        QtyItem: detalle.cantidad,
        ...(detalle.unidadMedida && { UnmdItem: detalle.unidadMedida }),
        PrcItem: Math.round(detalle.precioUnitario), // Precio entero
        ...(descuento > 0 && { DescuentoMonto: descuento }),
        MontoItem: montoNetoLinea, // Monto total de la línea
      };
    });

    const iva = Math.round(montoNeto * 0.19);
    const montoTotal = montoNeto + iva;

    // Fecha y hora actual para timestamp
    const now = new Date();
    const tmstFirma = now.toISOString();

    // Construir documento según esquema oficial SII
    const dteXML = {
      DTE: {
        '@_xmlns': 'http://www.sii.cl/SiiDte',
        '@_version': '1.0',
        Documento: {
          '@_ID': `T${tipoDocumento}F${folio}`,
          Encabezado: {
            IdDoc: {
              TipoDTE: tipoDocumento,
              Folio: folio,
              FchEmis: fechaEmision,
              ...(tipoDocumento !== 39 && tipoDocumento !== 41 && { // No aplica a boletas
                FmaPago: 1, // 1=Contado, 2=Crédito, 3=Sin Costo
              }),
              ...(tipoDocumento === 33 && { // Solo para facturas
                FchVenc: fechaEmision,
              }),
            },
            Emisor: {
              RUTEmisor: rutEmisor,
              RznSoc: empresa.razon_social.substring(0, 100),
              GiroEmis: empresa.giro.substring(0, 80),
              Acteco: parseInt(empresa.actividad_economica) || 620200,
              DirOrigen: empresa.direccion.substring(0, 70),
              CmnaOrigen: empresa.comuna.substring(0, 20),
              CiudadOrigen: empresa.ciudad.substring(0, 20),
            },
            Receptor: {
              RUTRecep: rutReceptor,
              RznSocRecep: receptor.razonSocial.substring(0, 100),
              ...(receptor.giro && { GiroRecep: receptor.giro.substring(0, 40) }),
              ...(receptor.direccion && { DirRecep: receptor.direccion.substring(0, 70) }),
              ...(receptor.comuna && { CmnaRecep: receptor.comuna.substring(0, 20) }),
              ...(receptor.ciudad && { CiudadRecep: receptor.ciudad.substring(0, 20) }),
            },
            Totales: {
              MntNeto: montoNeto,
              TasaIVA: 19,
              IVA: iva,
              MntTotal: montoTotal,
            },
          },
          Detalle: detallesXML,
          ...(referencias && referencias.length > 0 && {
            Referencia: referencias.map((ref, idx) => ({
              NroLinRef: idx + 1,
              TpoDocRef: ref.tipoDocumento,
              FolioRef: ref.folio,
              FchRef: ref.fechaDocumento,
              ...(ref.razonReferencia && { RazonRef: ref.razonReferencia.substring(0, 90) }),
            })),
          }),
          TmstFirma: tmstFirma,
        },
      },
    };

    // Generar XML con namespace correcto
    const xmlString = this.xmlBuilder.build(dteXML);
    const xmlWithDeclaration = `<?xml version="1.0" encoding="ISO-8859-1"?>\n${xmlString}`;

    console.log('✅ XML del DTE generado correctamente');
    return xmlWithDeclaration;
  }

  /**
   * Formatea el RUT al formato SII: sin puntos, con guión
   * Ejemplo: 12345678-9
   */
  private formatRUT(rut: string): string {
    // Limpiar el RUT
    const cleaned = rut.replace(/\./g, '').replace(/-/g, '').trim();

    // Agregar guión antes del dígito verificador
    if (cleaned.length >= 2) {
      return cleaned.slice(0, -1) + '-' + cleaned.slice(-1);
    }

    return cleaned;
  }

  /**
   * Firma el DTE con el certificado digital
   */
  private signDTE(dteXml: string): string {
    try {
      const certPath = config.certificate.path;
      const certPassword = config.certificate.password;

      if (!certPath || !fs.existsSync(certPath)) {
        throw new Error('Certificado digital no encontrado');
      }

      const p12Buffer = fs.readFileSync(certPath);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);

      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag]?.[0];

      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

      if (!certBag || !keyBag) {
        throw new Error('No se pudo extraer el certificado o la clave privada');
      }

      const certificate = certBag.cert!;
      const privateKey = keyBag.key!;

      // Calcular el hash del documento
      const md = forge.md.sha1.create();
      md.update(dteXml, 'utf8');
      const signature = privateKey.sign(md);
      const signatureB64 = forge.util.encode64(signature);

      // Agregar la firma al XML
      const parser = this.xmlParser.parse(dteXml);
      const documentId = parser.DTE?.Documento?.['@_ID'] || 'DTE';

      const signedXml = dteXml.replace(
        '</DTE>',
        `  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="#${documentId}">
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
</DTE>`
      );

      return signedXml;
    } catch (error: any) {
      throw new Error(`Error al firmar DTE: ${error.message}`);
    }
  }

  /**
   * Crea un DTE completo (genera XML y firma)
   */
  async createDTE(dteData: DTEData): Promise<{ xml: string; montoTotal: number }> {
    try {
      console.log(`📄 Generando DTE tipo ${dteData.tipoDocumento}, folio ${dteData.folio}`);

      // Generar XML
      const dteXml = this.generateDTEXML(dteData);

      // Firmar XML
      const signedXml = this.signDTE(dteXml);

      // Calcular monto total
      const montoNeto = dteData.detalles.reduce((sum, det) => {
        const monto = det.cantidad * det.precioUnitario - (det.descuentoMonto || 0);
        return sum + monto;
      }, 0);
      const iva = Math.round(montoNeto * 0.19);
      const montoTotal = Math.round(montoNeto) + iva;

      console.log('✅ DTE generado y firmado correctamente');

      return {
        xml: signedXml,
        montoTotal,
      };
    } catch (error: any) {
      console.error('❌ Error al crear DTE:', error.message);
      throw error;
    }
  }

  /**
   * Envía el DTE al SII
   * Cumple con el esquema EnvioDTE_v10.xsd oficial
   */
  async sendDTE(dteXml: string, rutEmisor: string, rutEnvia: string): Promise<{ trackId: string; estado: string; glosaEstado?: string }> {
    try {
      console.log('📤 Enviando DTE al SII...');

      // Obtener token de autenticación
      const token = await this.authService.getToken();
      console.log('✅ Token obtenido para envío');

      // Obtener datos de empresa para resolución SII
      const empresa: any = this.getEmpresaData();

      // Extraer tipo de documento del XML
      const parsed = this.xmlParser.parse(dteXml);
      const tipoDTE = parsed.DTE?.Documento?.Encabezado?.IdDoc?.TipoDTE || 33;

      // Formatear RUTs
      const rutEmisorFormateado = this.formatRUT(rutEmisor);
      const rutEnviaFormateado = this.formatRUT(rutEnvia);

      // Fecha y hora actual en formato ISO
      const tmstFirmaEnv = new Date().toISOString();

      // Crear el sobre XML para el envío según esquema oficial
      const envioXml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<EnvioDTE xmlns="http://www.sii.cl/SiiDte" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sii.cl/SiiDte EnvioDTE_v10.xsd" version="1.0">
  <SetDTE ID="SetDoc">
    <Caratula version="1.0">
      <RutEmisor>${rutEmisorFormateado}</RutEmisor>
      <RutEnvia>${rutEnviaFormateado}</RutEnvia>
      <RutReceptor>60803000-K</RutReceptor>
      <FchResol>${empresa.resolucion_sii || '2014-08-22'}</FchResol>
      <NroResol>${empresa.codigo_sii || '80'}</NroResol>
      <TmstFirmaEnv>${tmstFirmaEnv}</TmstFirmaEnv>
      <SubTotDTE>
        <TpoDTE>${tipoDTE}</TpoDTE>
        <NroDTE>1</NroDTE>
      </SubTotDTE>
    </Caratula>
    ${dteXml}
  </SetDTE>
</EnvioDTE>`;

      // Enviar al SII
      const env = config.sii.environment as 'certificacion' | 'produccion';
      const uploadUrl = config.sii.urls[env].upload;

      console.log(`🌐 Enviando a: ${uploadUrl}`);
      console.log(`📋 Ambiente: ${env}`);

      const response = await axios.post(
        uploadUrl,
        envioXml,
        {
          headers: {
            'Content-Type': 'text/xml; charset=ISO-8859-1',
            'Cookie': `TOKEN=${token}`,
          },
          timeout: 60000, // 60 segundos
        }
      );

      // Parsear respuesta del SII
      const parsedResponse = this.xmlParser.parse(response.data);

      // El SII puede responder en diferentes formatos
      let trackId = parsedResponse.RECEPCIONDTE?.TRACKID
                    || parsedResponse.RECEPCION_ENVIO?.TRACKID
                    || parsedResponse['SII:RESPUESTA']?.['SII:RESP_BODY']?.TRACKID
                    || '';

      let estado = parsedResponse.RECEPCIONDTE?.ESTADO
                   || parsedResponse.RECEPCION_ENVIO?.ESTADO
                   || parsedResponse['SII:RESPUESTA']?.['SII:RESP_BODY']?.ESTADO
                   || 'desconocido';

      let glosaEstado = parsedResponse.RECEPCIONDTE?.GLOSA
                        || parsedResponse.RECEPCION_ENVIO?.GLOSA
                        || parsedResponse['SII:RESPUESTA']?.['SII:RESP_BODY']?.GLOSA;

      if (!trackId) {
        console.error('❌ Respuesta del SII sin Track ID:', JSON.stringify(parsedResponse, null, 2));
        throw new Error('El SII no devolvió un Track ID. Revise la configuración de empresa y certificado');
      }

      console.log('✅ DTE enviado al SII exitosamente');
      console.log(`📍 Track ID: ${trackId}`);
      console.log(`📊 Estado: ${estado}${glosaEstado ? ' - ' + glosaEstado : ''}`);

      return {
        trackId,
        estado,
        glosaEstado,
      };
    } catch (error: any) {
      console.error('❌ Error al enviar DTE al SII:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response) {
        const errorMsg = `Error HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMsg);
      }

      throw new Error(`Error al enviar DTE al SII: ${error.message}`);
    }
  }

  /**
   * Consulta el estado de un DTE en el SII
   */
  async queryDTEStatus(trackId: string): Promise<any> {
    try {
      const token = await this.authService.getToken();
      const env = config.sii.environment as 'certificacion' | 'produccion';
      const queryUrl = config.sii.urls[env].queryUpload;

      const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns1:getEstUp xmlns:ns1="http://DefaultNamespace">
      <ns1:RutConsultante>${config.sii.rut}</ns1:RutConsultante>
      <ns1:DvConsultante>${config.sii.rut.split('-')[1]}</ns1:DvConsultante>
      <ns1:TrackId>${trackId}</ns1:TrackId>
      <ns1:Token>${token}</ns1:Token>
    </ns1:getEstUp>
  </soapenv:Body>
</soapenv:Envelope>`;

      const response = await axios.post(queryUrl, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '',
        },
      });

      return this.xmlParser.parse(response.data);
    } catch (error: any) {
      throw new Error(`Error al consultar estado DTE: ${error.message}`);
    }
  }
}
