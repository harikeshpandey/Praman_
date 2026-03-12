// backend/solana.js
const anchor = require('@coral-xyz/anchor');
const { Program, AnchorProvider } = require('@coral-xyz/anchor');
const { Keypair, Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function initializeProgram() {
    const connection = new Connection(process.env.CLUSTER_URL, 'confirmed');
    
    const secretKeyArray = JSON.parse(process.env.SERVER_WALLET_SECRET_KEY);
    const serverKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
    const wallet = new anchor.Wallet(serverKeypair);

    const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: 'confirmed',
    });
    anchor.setProvider(provider);

    const idlPath = path.resolve(__dirname, 'university_registry.json');
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
    
    const programId = new PublicKey(process.env.PROGRAM_ID);
    
    // Try using provider.program() method instead
    const program = new Program(idl, provider);

    return { program, provider, connection };
}

module.exports = initializeProgram();