#!/usr/bin/env node

/**
 * ==============================================================================
 * GENERADOR OFICIAL DE LICENCIAS CRIPTOGRÁFICAS – CLEANMAIL & BULK MAIL
 * ==============================================================================
 * Este script es de uso EXCLUSIVO del Desarrollador / Vendedor.
 * Genera claves de licencia firmadas mediante HMAC-SHA256 que ningún cliente
 * puede falsificar ni modificar.
 *
 * USO POR LÍNEA DE COMANDOS:
 *   node scripts/generate-license.cjs --client "Agencia Digital ABC" --email "cliente@gmail.com" --domain "cleanmail.unio.my" --days 365 --plan enterprise
 *
 * PARÁMETROS:
 *   --client   : Nombre o Razón Social del cliente (Obligatorio)
 *   --email    : Correo de contacto del cliente (Obligatorio)
 *   --domain   : Dominio autorizado (ej: "cleanmail.unio.my", o "*" para cualquier dominio)
 *   --days     : Días de validez (ej: 30, 365, o 0 para licencia VITALICIA / LIFETIME)
 *   --plan     : Tipo de plan ("starter", "pro", "enterprise", "lifetime")
 *   --credits  : Límite de créditos (-1 para ilimitados)
 *   --users    : Límite de usuarios (-1 para ilimitados)
 * ==============================================================================
 */

const crypto = require('crypto');

// Clave Secreta Maestra (Debe coincidir con la del servidor)
const MASTER_SECRET =
  process.env.CLEANMAIL_LICENSE_SECRET ||
  'CLEANMAIL_PRO_HMAC256_MASTER_SECRET_KEY_2026_STEVE_DEVELOPMENT';

// Parsear argumentos de la línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    client: '',
    email: '',
    domain: '*',
    days: 365,
    plan: 'enterprise',
    credits: -1,
    users: -1,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--client' && args[i + 1]) result.client = args[++i];
    else if (arg === '--email' && args[i + 1]) result.email = args[++i];
    else if (arg === '--domain' && args[i + 1]) result.domain = args[++i];
    else if (arg === '--days' && args[i + 1]) result.days = parseInt(args[++i], 10);
    else if (arg === '--plan' && args[i + 1]) result.plan = args[++i].toLowerCase();
    else if (arg === '--credits' && args[i + 1]) result.credits = parseInt(args[++i], 10);
    else if (arg === '--users' && args[i + 1]) result.users = parseInt(args[++i], 10);
  }

  return result;
}

function main() {
  const opts = parseArgs();

  // Si no se pasaron argumentos, usar valores de ejemplo guiados
  if (!opts.client) {
    console.log('\n=============================================================');
    console.log('       GENERADOR DE LICENCIAS DE SOFTWARE CLEANMAIL');
    console.log('=============================================================\n');
    console.log('💡 TIP: Puedes especificar parámetros directamente:\n');
    console.log('  node scripts/generate-license.cjs \\');
    console.log('    --client "Agencia XYZ" \\');
    console.log('    --email "admin@agenciaxyz.com" \\');
    console.log('    --domain "cleanmail.unio.my" \\');
    console.log('    --days 365 \\');
    console.log('    --plan enterprise\n');
    console.log('⚙️  Generando licencia de demostración/ejemplo:\n');
    opts.client = 'Cliente Corporativo Demo';
    opts.email = 'contacto@cliente.com';
    opts.domain = 'cleanmail.unio.my';
    opts.days = 365;
    opts.plan = 'enterprise';
  }

  const issuedAt = new Date().toISOString();
  let expiresAt = 'never';

  if (opts.days > 0) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + opts.days);
    expiresAt = expDate.toISOString();
  }

  const payload = {
    licenseId: 'LIC-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    clientName: opts.client.trim(),
    clientEmail: opts.email.trim(),
    domain: opts.domain.trim().toLowerCase(),
    plan: opts.plan,
    issuedAt,
    expiresAt,
    maxCredits: opts.credits,
    maxUsers: opts.users,
    features: ['validation', 'campaigns', 'api', 'rbac', 'landing_cms', 'dns_mx'],
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', MASTER_SECRET)
    .update(payloadBase64)
    .digest('hex');

  const rawLicenseKey = `CLM-1.${payloadBase64}.${signature}`;

  console.log('-------------------------------------------------------------');
  console.log('✅ ¡LICENCIA GENERADA EXITOSAMENTE!');
  console.log('-------------------------------------------------------------');
  console.log(`👤 Cliente          : ${payload.clientName}`);
  console.log(`📧 Correo           : ${payload.clientEmail}`);
  console.log(`🌐 Dominio Autorizado: ${payload.domain === '*' ? 'Cualquier Dominio (*)' : payload.domain}`);
  console.log(`💎 Plan             : ${payload.plan.toUpperCase()}`);
  console.log(`⏳ Validez          : ${opts.days === 0 ? 'Vitalicia / Ilimitada (Lifetime)' : `${opts.days} días`}`);
  console.log(`📅 Expira el        : ${expiresAt === 'never' ? 'Nunca (Vitalicia)' : new Date(expiresAt).toLocaleDateString()}`);
  console.log(`🔒 ID Licencia      : ${payload.licenseId}`);
  console.log('-------------------------------------------------------------');
  console.log('📋 COPIA LA SIGUIENTE CLAVE PARA ENTREGAR AL CLIENTE:\n');
  console.log(rawLicenseKey);
  console.log('\n-------------------------------------------------------------');
  console.log('ℹ️  El cliente debe pegar esta clave en su Panel Admin > Licencia del Software');
  console.log('-------------------------------------------------------------\n');
}

main();
