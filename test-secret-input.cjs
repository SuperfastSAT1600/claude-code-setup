#!/usr/bin/env node

/**
 * Test script to verify askSecret function works properly
 */

const readline = require('readline');
const { askSecret } = require('./lib/input.cjs');

async function testSecretInput() {
  console.log('Testing askSecret function...\n');
  console.log('Instructions:');
  console.log('1. Type some text (should show asterisks)');
  console.log('2. Try backspace (should work)');
  console.log('3. Press Enter when done');
  console.log('4. Your input will be echoed back\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const secret = await askSecret(rl, 'Enter test secret');
    console.log(`\nYou entered: "${secret}"`);
    console.log(`Length: ${secret.length} characters`);

    if (secret.length > 0) {
      console.log('\n✅ Secret input test PASSED - keyboard input is working!');
    } else {
      console.log('\n⚠️  No input received - test inconclusive');
    }
  } catch (error) {
    console.error('\n❌ Secret input test FAILED:', error.message);
  } finally {
    rl.close();
  }
}

testSecretInput().catch(console.error);
