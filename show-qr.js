#!/usr/bin/env node

const qrcode = require('qrcode-terminal');

console.log('\n');
console.log('='.repeat(60));
console.log('  🚀 DayFlow Complete App - QR Codes');
console.log('='.repeat(60));
console.log('\n');

// Mobile App QR
console.log('📱 MOBILE APP - Scan with Expo Go:');
console.log('-'.repeat(60));
const mobileUrl = 'exp://192.168.0.194:8081';
qrcode.generate(mobileUrl, { small: false }, function (qrcode) {
  console.log(qrcode);
});
console.log(`URL: ${mobileUrl}`);
console.log('-'.repeat(60));
console.log('\n');

// Backend API QR
console.log('🔐 BACKEND API - Scan with phone camera:');
console.log('-'.repeat(60));
const backendUrl = 'http://192.168.0.194:3000';
qrcode.generate(backendUrl, { small: false }, function (qrcode) {
  console.log(qrcode);
});
console.log(`URL: ${backendUrl}`);
console.log('-'.repeat(60));
console.log('\n');

console.log('✅ Both services are running!');
console.log('\n');
console.log('📋 Quick Steps:');
console.log('  1. Install "Expo Go" app on your phone');
console.log('  2. Open Expo Go');
console.log('  3. Scan the MOBILE APP QR code above');
console.log('  4. Wait for app to load (30-60 seconds)');
console.log('  5. Go to Settings → Test Backend Connection');
console.log('\n');
console.log('💡 Or enter manually in Expo Go:');
console.log(`  ${mobileUrl}`);
console.log('\n');
console.log('='.repeat(60));
console.log('\n');
