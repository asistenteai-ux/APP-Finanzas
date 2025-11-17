import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  sii: {
    environment: process.env.SII_ENVIRONMENT || 'certificacion',
    rut: process.env.SII_RUT || '',
    companyName: process.env.SII_COMPANY_NAME || '',
    companyAddress: process.env.SII_COMPANY_ADDRESS || '',
    companyActivity: process.env.SII_COMPANY_ACTIVITY || '',

    // URLs de servicios web
    urls: {
      certificacion: {
        seed: 'https://maullin.sii.cl/DTEWS/CrSeed.jws?WSDL',
        token: 'https://maullin.sii.cl/DTEWS/GetTokenFromSeed.jws?WSDL',
        upload: 'https://maullin.sii.cl/cgi_dte/UPL/DTEUpload',
        queryDte: 'https://maullin.sii.cl/DTEWS/QueryEstDte.jws?WSDL',
        queryUpload: 'https://maullin.sii.cl/DTEWS/QueryEstUp.jws?WSDL',
      },
      produccion: {
        seed: 'https://palena.sii.cl/DTEWS/CrSeed.jws?WSDL',
        token: 'https://palena.sii.cl/DTEWS/GetTokenFromSeed.jws?WSDL',
        upload: 'https://palena.sii.cl/cgi_dte/UPL/DTEUpload',
        queryDte: 'https://palena.sii.cl/DTEWS/QueryEstDte.jws?WSDL',
        queryUpload: 'https://palena.sii.cl/DTEWS/QueryEstUp.jws?WSDL',
      },
    },
  },

  certificate: {
    path: process.env.CERT_PATH || '',
    password: process.env.CERT_PASSWORD || '',
  },
};

// Validar configuración crítica
export function validateConfig() {
  const errors: string[] = [];

  if (!config.sii.rut) {
    errors.push('SII_RUT no está configurado');
  }

  if (!config.sii.companyName) {
    errors.push('SII_COMPANY_NAME no está configurado');
  }

  if (errors.length > 0) {
    console.warn('⚠️  Advertencias de configuración:');
    errors.forEach(error => console.warn(`   - ${error}`));
  }

  return errors.length === 0;
}
