const { Connection, PublicKey, Transaction, SystemProgram, ComputeBudgetProgram, Keypair, TransactionInstruction } = require('@solana/web3.js');
const { JitoJsonRpcClient } = require('../src/index');
const fs = require('fs');

async function basicBundle() {
  // Initialize connection to Solana mainnet
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  // Read wallet from local path
  const walletPath = '/path/to/wallet.json';
  const walletKeypairData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(walletKeypairData));

   // Example with no UUID(default)
   const jitoClient = new JitoJsonRpcClient('https://mainnet.block-engine.jito.wtf/api/v1', "");

  // Setup client Jito Block Engine endpoint with UUID
  //const jitoClient = new JitoJsonRpcClient('https://mainnet.block-engine.jito.wtf/api/v1', "UUID-API-KEY");

  // Set up transaction parameters
  const receiver = new PublicKey('RECIEVER_KEY');
  const randomTipAccount = await jitoClient.getRandomTipAccount();
  const jitoTipAccount = new PublicKey(randomTipAccount);
  const jitoTipAmount = 1000; // lamports
  const transferAmount = 1000; // lamports

  // Memo program ID
  const memoProgramId = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

  // Create transaction
  const transaction = new Transaction();

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

  // Add memo instruction
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: memoProgramId,
    data: Buffer.from('Hello, Jito!'),
  });
  transaction.add(memoInstruction);

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletKeypair.publicKey;

  // Sign the transaction
  transaction.sign(walletKeypair);

  // Serialize and base64 encode the entire signed transaction
  const serializedTransaction = transaction.serialize({verifySignatures: false});
  const base64EncodedTransaction = Buffer.from(serializedTransaction).toString('base64');

  try {
    // Send the bundle using sendBundle method
    const result = await jitoClient.sendBundle([[base64EncodedTransaction]]);
    console.log('Bundle send result:', result);

    const bundleId = result.result;
    console.log('Bundle ID:', bundleId);

    // Wait for confirmation with a longer timeout
    const inflightStatus = await jitoClient.confirmInflightBundle(bundleId, 120000); // 120 seconds timeout
    console.log('Inflight bundle status:', JSON.stringify(inflightStatus, null, 2));

    if (inflightStatus.confirmation_status === "confirmed") {
      console.log(`Bundle successfully confirmed on-chain at slot ${inflightStatus.slot}`);

      // Additional check for bundle finalization
      try {
        console.log('Attempting to get bundle status...');
        const finalStatus = await jitoClient.getBundleStatuses([[bundleId]]); // Note the double array
        console.log('Final bundle status response:', JSON.stringify(finalStatus, null, 2));

        if (finalStatus.result && finalStatus.result.value && finalStatus.result.value.length > 0) {
          const status = finalStatus.result.value[0];
          console.log('Confirmation status:', status.confirmation_status);

          const explorerUrl = `https://explorer.jito.wtf/bundle/${bundleId}`;
          console.log('Bundle Explorer URL:', explorerUrl);

          console.log('Final bundle details:', status);

          // Updated section to handle and display multiple transactions
          if (status.transactions && status.transactions.length > 0) {
            console.log(`Transaction URLs (${status.transactions.length} transaction${status.transactions.length > 1 ? 's' : ''} in this bundle):`);
            status.transactions.forEach((txId, index) => {
              const txUrl = `https://solscan.io/tx/${txId}`;
              console.log(`Transaction ${index + 1}: ${txUrl}`);
            });
            if (status.transactions.length === 5) {
              console.log('Note: This bundle has reached the maximum of 5 transactions.');
            }
          } else {
            console.log('No transactions found in the bundle status.');
          }
        } else {
          console.log('Unexpected final bundle status response structure');
        }
      } catch (statusError) {
        console.error('Error fetching final bundle status:', statusError.message);
        if (statusError.response && statusError.response.data) {
          console.error('Server response:', statusError.response.data);
        }
      }
    } else if (inflightStatus.err) {
      console.log('Bundle processing failed:', inflightStatus.err);
    } else {
      console.log('Unexpected inflight bundle status:', inflightStatus);
    }

  } catch (error) {
    console.error('Error sending or confirming bundle:', error);
    if (error.response && error.response.data) {
      console.error('Server response:', error.response.data);
    }
  }
}

basicBundle().catch(console.error);