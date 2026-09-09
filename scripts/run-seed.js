const { seedAll, cleanAll, pool } = require('../db');

async function main() {
  const command = process.argv[2] || 'seed';

  if (command === 'seed') {
    const { user, marketSharesCount } = await seedAll();
    console.log('Seed concluido.');
    console.log(`Usuario de teste: ${user.email} / senha: ${user.password} / PIN: ${user.pin}`);
    console.log(`Conta: agencia ${user.agency}, conta ${user.account}, saldo R$ ${user.balance.toFixed(2)}`);
    console.log(`Produtos de investimento inseridos: ${marketSharesCount}`);
  } else if (command === 'clean') {
    await cleanAll();
    console.log('Dados de seed removidos.');
  } else {
    console.error(`Comando desconhecido: ${command}. Use "seed" ou "clean".`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error('Erro ao executar seed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
