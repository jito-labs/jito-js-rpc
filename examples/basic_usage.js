const { JitoJsonRpcClient } = require('../dist/index');

async function main() {
  const client = new JitoJsonRpcClient('https://mainnet.block-engine.jito.wtf/api/v1');

  try {
    const tipAccounts = await client.getTipAccounts();
    console.log('Tip accounts:');
    console.log(JSON.stringify(tipAccounts, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

main();