#!/usr/bin/env node

const crypto = require('crypto');

console.log('\n🔐 GENERADOR DE SECRETOS SEGUROS PARA PRODUCCIÓN\n');
console.log('=' .repeat(60));

// Generar JWT_SECRET (64 bytes)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📌 JWT_SECRET (copiar a .env en VPS):');
console.log(`JWT_SECRET=${jwtSecret}`);

// Generar NEXTAUTH_SECRET (32 bytes)
const nextAuthSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📌 NEXTAUTH_SECRET (copiar a .env en VPS):');
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANTE:');
console.log('1. NUNCA uses estos secrets en desarrollo');
console.log('2. NUNCA los subas a Git');
console.log('3. Guárdalos en un lugar seguro (password manager)');
console.log('4. Configúralos SOLO en el servidor VPS en el archivo .env');
console.log('\n');
