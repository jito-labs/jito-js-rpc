# jito-js-rpc

[![Discord](https://img.shields.io/discord/938287290806042626?label=Discord&logo=discord&style=flat&color=7289DA)](https://discord.gg/jTSmEzaR)
![JavaScript](https://img.shields.io/badge/JavaScript-Language-yellow?logo=javascript)
[![npm](https://img.shields.io/npm/v/jito-js-rpc?label=npm&logo=npm)](https://www.npmjs.com/package/jito-js-rpc)

The Jito JSON-RPC JavaScript SDK provides an interface for interacting with Jito's enhanced Solana infrastructure. This SDK supports methods for managing bundles and transactions, offering improved performance and additional features while interacting with the Block Engine.

## Features

### Bundles
- `getInflightBundleStatuses`: Retrieve the status of in-flight bundles.
- `getBundleStatuses`: Fetch the statuses of submitted bundles.
- `getTipAccounts`: Get accounts eligible for tips.
- `sendBundle`: Submit bundles to the Jito Block Engine.

### Transactions
- `sendTransaction`: Submit transactions with enhanced priority and speed.

## Installation

### Prerequisites

This project requires Node.js and npm (Node Package Manager) for development. If you haven't installed Node.js yet, you can download it from [nodejs.org](https://nodejs.org/).

### Adding jito-js-rpc to Your Project

You can install the package using npm:

```bash
npm install
```

Or if you prefer using yarn:

```bash
yarn add jito-js-rpc
```

## Usage Examples

### Basic Transaction Example

To run the basic transaction example:

1. Ensure your environment is set up in `examples/basic-transaction.js`:

   ```javascript
   // Load the sender's keypair
   const sender = loadKeypair("/path/to/wallet.json");

   // Set up receiver pubkey
   const receiver = new PublicKey("YOUR_RECEIVER_PUBKEY");
   ```

2. Run the example:
   ```bash
   node examples/basic_txn.js
   ```

### Basic Bundle Example

To run the basic bundle example:

1. Set up your environment in `examples/basic-bundle.js`:

   ```javascript
   // Load the sender's keypair
   const sender = loadKeypair("/path/to/wallet.json");

   // Set up receiver pubkey
   const receiver = new PublicKey("YOUR_RECEIVER_PUBKEY");
   ```

2. Run the example:
   ```bash
   node examples/basic_bundle.js
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please join our [Discord community](https://discord.gg/jTSmEzaR).
