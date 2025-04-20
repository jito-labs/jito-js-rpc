const { Connection, PublicKey, Transaction, SystemProgram, ComputeBudgetProgram, Keypair } = require('@solana/web3.js');
const { JitoJsonRpcClient } = require('../src/index');
const fs = require('fs');

async function basicTransaction() {
  // Initialize connection to Solana
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  // Read wallet from local path
  const walletPath = "/path/to/wallet.json" ;
 
  const walletKeypairData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(walletKeypairData));

  // Example with no UUID(default)
  const jitoClient = new JitoJsonRpcClient('https://mainnet.block-engine.jito.wtf/api/v1', "");

  // Setup client Jito Block Engine endpoint with UUID
  // const jitoClient = new JitoJsonRpcClient('https://mainnet.block-engine.jito.wtf/api/v1', "UUID-API-KEY");

  // Set up transaction parameters
  const receiver = new PublicKey("RECIEVER_KEY");
  
  // Convert the random tip account string to a PublicKey
  const randomTipAccount = await jitoClient.getRandomTipAccount();
  const jitoTipAccount = new PublicKey(randomTipAccount);
  const jitoTipAmount = 1000; // lamports
  const priorityFee = 1000; // lamports
  const transferAmount = 1000; // lamports

  // Create transaction
  const transaction = new Transaction();

  // Add priority fee instruction
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    })
  );

  // Add transfer instruction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: walletKeypair.publicKey,
      toPubkey: receiver,
      lamports: transferAmount,
    })
  );

  // Add Jito tip instruction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: walletKeypair.publicKey,
      toPubkey: jitoTipAccount,
      lamports: jitoTipAmount,
    })
  );

  // Sign the transaction
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.feePayer = walletKeypair.publicKey;
  transaction.sign(walletKeypair);

  // Serialize transaction and encode as base64 (instead of base58)
  const serializedTransaction = transaction.serialize();
  const base64Transaction = Buffer.from(serializedTransaction).toString('base64');
  
  try {
    // Send the transaction using sendTxn method
    const result = await jitoClient.sendTxn([base64Transaction], false);
    console.log('Transaction send result:', result);

    const signature = result.result;
    console.log('Transaction signature:', signature);

    // Wait for confirmation with a longer timeout
    const confirmation = await confirmTransaction(connection, signature, 120000); // 120 seconds timeout
    console.log('Transaction confirmation:', confirmation);

    // If the above doesn't confirm, you can manually check the status
    const status = await connection.getSignatureStatus(signature);
    console.log('Transaction status:', status);

    if (confirmation.value.confirmationStatus && status.value.confirmationStatus === 'finalized') {
      const solscanUrl = `https://solscan.io/tx/${signature}`;
      console.log(`Transaction finalized. View details on Solscan: ${solscanUrl}`);
    } else {
      console.log('Transaction was not finalized within the expected time.');
    }

  } catch (error) {
    console.error('Error sending or confirming transaction:', error);
    if (error.response && error.response.data) {
      console.error('Server response:', error.response.data);
    }
  }
}

async function confirmTransaction(connection, signature, timeoutMs = 60000) {
  const start = Date.now();
  let status = await connection.getSignatureStatus(signature);
  
  while (Date.now() - start < timeoutMs) {
    status = await connection.getSignatureStatus(signature);
    if (status.value && status.value.confirmationStatus === 'finalized') {
      return status;
    }
    // Wait for a short time before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Transaction ${signature} failed to confirm within ${timeoutMs}ms`);
}

basicTransaction().catch(console.error);