import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import forge from 'node-forge';
import fs from 'fs';
import { config } from '../../config';

/**
 * Servicio de autenticación con el SII
 * Implementa el proceso de obtención de semilla y generación de token
 */
export class SIIAuthService {
  private xmlParser: XMLParser;
  private xmlBuilder: XMLBuilder;
  private baseUrls: any;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
    });

    // Seleccionar URLs según ambiente
    const env = config.sii.environment as 'certificacion' | 'produccion';
    this.baseUrls = config.sii.urls[env];
  }

  /**
   * Obtiene una semilla del SII
   * La semilla es un valor aleatorio que se usa para generar el token
   */
  async getSeed(): Promise<string> {
    try {
      const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <getSeed xmlns="http://DefaultNamespace"/>
  </soapenv:Body>
</soapenv:Envelope>`;

      const response = await axios.post(this.baseUrls.seed, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'getSeed',
        },
        timeout: 30000, // 30 segundos timeout
      });

      const parsed = this.xmlParser.parse(response.data);

      // El SII puede responder en diferentes formatos, intentar múltiples rutas
      let seed = parsed['soap:Envelope']?.['soap:Body']?.['SII:RESPUESTA']?.['SII:RESP_BODY']?.['SEMILLA']
                 || parsed['soapenv:Envelope']?.['soapenv:Body']?.['SII:RESPUESTA']?.['SII:RESP_BODY']?.['SEMILLA']
                 || parsed['SII:RESPUESTA']?.['SII:RESP_BODY']?.['SEMILLA'];

      if (!seed) {
        console.error('Respuesta del SII:', JSON.stringify(parsed, null, 2));
        throw new Error('No se pudo obtener la semilla del SII - formato de respuesta inesperado');
      }

      console.log('✅ Semilla obtenida del SII:', seed.substring(0, 20) + '...');
      return seed;
    } catch (error: any) {
      console.error('❌ Error al obtener semilla del SII:', {
        message: error.message,
        response: error.response?.data,
        url: this.baseUrls.seed,
      });

      if (error.response) {
        throw new Error(`Error del SII al obtener semilla: ${error.response.status} - ${error.response.statusText}`);
      }

      throw new Error(`Error de conexión con SII: ${error.message}`);
    }
  }

  /**
   * Firma la semilla con el certificado digital
   */
  private signSeed(seed: string): string {
    try {
      // Leer el certificado digital
      const certPath = config.certificate.path;
      const certPassword = config.certificate.password;

      if (!certPath || !fs.existsSync(certPath)) {
        throw new Error('Certificado digital no encontrado. Configure CERT_PATH en .env');
      }

      const p12Buffer = fs.readFileSync(certPath);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);

      // Obtener la clave privada y el certificado
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag]?.[0];

      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

      if (!certBag || !keyBag) {
        throw new Error('No se pudo extraer el certificado o la clave privada');
      }

      const certificate = certBag.cert!;
      const privateKey = keyBag.key!;

      // Crear el XML de la semilla firmada
      const seedXml = `<getToken><item><Semilla>${seed}</Semilla></item></getToken>`;

      // Firmar con la clave privada
      const md = forge.md.sha1.create();
      md.update(seedXml, 'utf8');
      const signature = privateKey.sign(md);
      const signatureB64 = forge.util.encode64(signature);

      // Construir el XML completo con la firma
      const signedXml = `<?xml version="1.0" encoding="UTF-8"?>
<getToken>
  <item>
    <Semilla>${seed}</Semilla>
  </item>
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
        <X509Certificate>${forge.util.encode64(forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes())}</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</getToken>`;

      return signedXml;
    } catch (error: any) {
      console.error('❌ Error al firmar semilla:', error.message);
      throw new Error(`Error al firmar semilla: ${error.message}`);
    }
  }

  /**
   * Obtiene el token de autenticación del SII
   */
  async getToken(): Promise<string> {
    try {
      // Paso 1: Obtener semilla
      const seed = await this.getSeed();

      // Paso 2: Firmar semilla
      const signedSeed = this.signSeed(seed);

      // Paso 3: Enviar semilla firmada al SII
      const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <getToken xmlns="http://DefaultNamespace">
      <pszXml><![CDATA[${signedSeed}]]></pszXml>
    </getToken>
  </soapenv:Body>
</soapenv:Envelope>`;

      const response = await axios.post(this.baseUrls.token, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'getToken',
        },
        timeout: 30000,
      });

      const parsed = this.xmlParser.parse(response.data);

      // El SII puede responder en diferentes formatos
      let token = parsed['soap:Envelope']?.['soap:Body']?.['SII:RESPUESTA']?.['SII:RESP_BODY']?.['TOKEN']
                  || parsed['soapenv:Envelope']?.['soapenv:Body']?.['SII:RESPUESTA']?.['SII:RESP_BODY']?.['TOKEN']
                  || parsed['SII:RESPUESTA']?.['SII:RESP_BODY']?.['TOKEN'];

      if (!token) {
        console.error('Respuesta del SII:', JSON.stringify(parsed, null, 2));
        throw new Error('No se pudo obtener el token del SII - formato de respuesta inesperado');
      }

      console.log('✅ Token obtenido del SII:', token.substring(0, 30) + '...');
      return token;
    } catch (error: any) {
      console.error('❌ Error al obtener token del SII:', {
        message: error.message,
        response: error.response?.data,
        url: this.baseUrls.token,
      });

      if (error.response) {
        throw new Error(`Error del SII al obtener token: ${error.response.status} - ${error.response.statusText}`);
      }

      throw new Error(`Error de conexión con SII: ${error.message}`);
    }
  }

  /**
   * Valida si el certificado digital es válido
   */
  validateCertificate(): boolean {
    try {
      const certPath = config.certificate.path;
      if (!certPath || !fs.existsSync(certPath)) {
        return false;
      }

      const p12Buffer = fs.readFileSync(certPath);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      forge.pkcs12.pkcs12FromAsn1(p12Asn1, config.certificate.password);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información del certificado digital
   */
  getCertificateInfo(): any {
    try {
      const certPath = config.certificate.path;
      if (!certPath || !fs.existsSync(certPath)) {
        throw new Error('Certificado no encontrado');
      }

      const p12Buffer = fs.readFileSync(certPath);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, config.certificate.password);

      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag]?.[0];

      if (!certBag?.cert) {
        throw new Error('No se pudo leer el certificado');
      }

      const cert = certBag.cert;

      return {
        subject: cert.subject.attributes.map((attr: any) => ({
          name: attr.name,
          value: attr.value,
        })),
        issuer: cert.issuer.attributes.map((attr: any) => ({
          name: attr.name,
          value: attr.value,
        })),
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
        serialNumber: cert.serialNumber,
      };
    } catch (error: any) {
      throw new Error(`Error al leer certificado: ${error.message}`);
    }
  }
}
