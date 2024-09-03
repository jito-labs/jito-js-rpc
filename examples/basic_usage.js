const { JitoJsonRpcClient } = require('../src/index');

async function main() {
  const client = new JitoJsonRpcClient('https://mainnet.block-engine.jito.wtf/api/v1');

  try {
    const tipAccounts = await client.getTipAccounts();
    console.log('Tip accounts:');
    console.log(JitoJsonRpcClient.prettify(tipAccounts));
  } catch (error) {
    console.error('Error:', error);
  }
}

main();