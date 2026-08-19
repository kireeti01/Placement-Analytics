const bcrypt = require('bcryptjs');

async function test() {
  const hash = '$2a$10$Jq6iJn8/4rNeMEBnHGLLnuJitAcViihQfadWlwsVIbCtbVE3F2Idu';
  
  // Test a few passwords that were recently generated
  const passwords = [
    'College@1086!',
    'College@1664!',
    'College@1325!',
    'College@9999!'
  ];
  
  console.log('Hash in DB:', hash);
  for (const pw of passwords) {
    const match = await bcrypt.compare(pw, hash);
    console.log(`Password: ${pw} -> Match: ${match}`);
  }
}

test();
