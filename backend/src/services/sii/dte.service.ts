import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import forge from 'node-forge';
import fs from 'fs';
import { config } from '../../config';
import { SIIAuthService } from './auth.service';
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
   * Genera el XML del DTE según formato SII
   */
  generateDTEXML(dteData: DTEData): string {
    const { tipoDocumento, folio, fechaEmision, receptor, detalles, referencias } = dteData;

    // Calcular totales
    let montoNeto = 0;
    const detallesXML = detalles.map((detalle) => {
      const montoLinea = detalle.cantidad * detalle.precioUnitario;
      const descuento = detalle.descuentoMonto || 0;
      const montoNetoLinea = montoLinea - descuento;
      montoNeto += montoNetoLinea;

      return {
        NroLinDet: detalle.numeroLinea,
        NmbItem: detalle.nombreItem,
        DscItem: detalle.descripcion || '',
        QtyItem: detalle.cantidad,
        UnmdItem: detalle.unidadMedida || 'UN',
        PrcItem: detalle.precioUnitario.toFixed(2),
        ...(detalle.descuentoMonto && { DescuentoMonto: detalle.descuentoMonto.toFixed(2) }),
        MontoItem: montoNetoLinea.toFixed(0),
      };
    });

    const iva = Math.round(montoNeto * 0.19);
    const montoTotal = Math.round(montoNeto) + iva;

    // Construir el documento XML según formato SII
    const dteXML = {
      DTE: {
        '@_version': '1.0',
        Documento: {
          '@_ID': `DTE-${tipoDocumento}-${folio}`,
          Encabezado: {
            IdDoc: {
              TipoDTE: tipoDocumento,
              Folio: folio,
              FchEmis: fechaEmision,
              FmaPago: 1, // 1=Contado, 2=Crédito
              FchVenc: fechaEmision,
            },
            Emisor: {
              RUTEmisor: config.sii.rut,
              RznSoc: config.sii.companyName,
              GiroEmis: config.sii.companyActivity,
              Acteco: '620200', // Código de actividad económica (ejemplo)
              DirOrigen: config.sii.companyAddress,
              CmnaOrigen: 'Santiago',
              CiudadOrigen: 'Santiago',
            },
            Receptor: {
              RUTRecep: receptor.rut,
              RznSocRecep: receptor.razonSocial,
              GiroRecep: receptor.giro || 'Sin información',
              DirRecep: receptor.direccion || 'Sin información',
              CmnaRecep: receptor.comuna || 'Santiago',
              CiudadRecep: receptor.ciudad || 'Santiago',
            },
            Totales: {
              MntNeto: Math.round(montoNeto),
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
              RazonRef: ref.razonReferencia || '',
            })),
          }),
        },
      },
    };

    const xmlString = this.xmlBuilder.build(dteXML);
    const xmlWithDeclaration = `<?xml version="1.0" encoding="ISO-8859-1"?>\n${xmlString}`;

    return xmlWithDeclaration;
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
   */
  async sendDTE(dteXml: string, rutEmisor: string, rutEnvia: string): Promise<{ trackId: string; estado: string }> {
    try {
      console.log('📤 Enviando DTE al SII...');

      // Obtener token de autenticación
      const token = await this.authService.getToken();

      // Crear el sobre XML para el envío
      const envioXml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<EnvioDTE xmlns="http://www.sii.cl/SiiDte" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sii.cl/SiiDte EnvioDTE_v10.xsd" version="1.0">
  <SetDTE ID="SetDTE">
    <Caratula version="1.0">
      <RutEmisor>${rutEmisor}</RutEmisor>
      <RutEnvia>${rutEnvia}</RutEnvia>
      <RutReceptor>60803000-K</RutReceptor>
      <FchResol>2014-08-22</FchResol>
      <NroResol>80</NroResol>
      <TmstFirmaEnv>${new Date().toISOString()}</TmstFirmaEnv>
      <SubTotDTE>
        <TpoDTE>33</TpoDTE>
        <NroDTE>1</NroDTE>
      </SubTotDTE>
    </Caratula>
    ${dteXml}
  </SetDTE>
</EnvioDTE>`;

      // Enviar al SII
      const env = config.sii.environment as 'certificacion' | 'produccion';
      const uploadUrl = config.sii.urls[env].upload;

      const response = await axios.post(
        uploadUrl,
        envioXml,
        {
          headers: {
            'Content-Type': 'application/xml',
            'Cookie': `TOKEN=${token}`,
          },
        }
      );

      // Parsear respuesta
      const parsed = this.xmlParser.parse(response.data);
      const trackId = parsed.RECEPCIONDTE?.TRACKID || '';
      const estado = parsed.RECEPCIONDTE?.ESTADO || 'desconocido';

      console.log('✅ DTE enviado al SII. Track ID:', trackId);

      return { trackId, estado };
    } catch (error: any) {
      console.error('❌ Error al enviar DTE:', error.message);
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
