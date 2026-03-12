// backend/controllers.js
const anchor = require('@coral-xyz/anchor');
const {  Transaction } = require('@solana/web3.js');
// Import provider and connection as well
const { program, provider, connection } = require('./solana');
const BN = require("bn.js");

// --- UNIVERSITY CONTROLLERS ---
const { PublicKey, SystemProgram } = require("@solana/web3.js");
const { Keypair } = require("@solana/web3.js");

const registerUniversity = async (req, res) => {
    try {
        const { universityName } = req.body;
        const authority = provider.wallet.publicKey;

        console.log("=== DEBUG INFO ===");
        console.log("Authority:", authority.toBase58());
        console.log("Program ID:", program.programId.toBase58());
        
        const [universityPda, bump] = PublicKey.findProgramAddressSync(
            [Buffer.from("university"), authority.toBuffer()],
            program.programId
        );

        console.log("University PDA:", universityPda.toBase58());
        console.log("Bump:", bump);
        console.log("System Program:", SystemProgram.programId.toBase58());
        console.log("==================");

        // Check if the problematic account matches any of ours
        const problematicAccount = "2ncPEpJ8j7cu9Rhv3BHzX9a5Xem7v5jRARYuowTbzAoF";
        console.log("Problematic account matches:");
        console.log("  - Authority?", authority.toBase58() === problematicAccount);
        console.log("  - University PDA?", universityPda.toBase58() === problematicAccount);
        console.log("  - System Program?", SystemProgram.programId.toBase58() === problematicAccount);

        const tx = await program.methods
            .registerUniversity(universityName)
            .accounts({
                university: universityPda,
                authority: authority,
                system_program: SystemProgram.programId,
            })
            .rpc();

        res.status(200).json({
            message: `University '${universityName}' registered successfully!`,
            signature: tx,
            universityAccount: universityPda.toBase58(),
        });
    } catch (error) {
        console.error("Error registering university:", error);
        res.status(500).json({ 
            message: "Failed to register university.",
            error: error.message,
            logs: error.logs 
        });
    }
};


const getUniversity = async (req, res) => {
    try {
        const universityPubKey = new PublicKey(req.params.universityKey);
        const universityData = await program.account.university.fetch(universityPubKey);
        res.status(200).json(universityData);
    } catch (error) {
        res.status(404).json({ message: "University not found." });
    }
};

const deleteUniversity = async (req, res) => {
    try {
        const { universityKey } = req.body;
        const tx = await program.methods
            .deleteUniversity()
            .accounts({
                university: new PublicKey(universityKey),
                authority: provider.wallet.publicKey,
            })
            .rpc();
        res.status(200).json({ message: "University deleted successfully!", signature: tx });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete university." });
    }
};

// --- STUDENT CONTROLLERS ---
const initializeStudent = async (req, res) => {
    try {
        const { studentName, studentWalletKey } = req.body;
        const newStudentAccount = Keypair.generate();
        const tx = await program.methods
            .initializeStudent(studentName)
            .accounts({
                studentAccount: newStudentAccount.publicKey,
                wallet: new PublicKey(studentWalletKey),
                systemProgram: SystemProgram.programId,
            })
            .signers([newStudentAccount])
            .rpc();
        res.status(200).json({ message: "Student initialized!", signature: tx, studentAccountKey: newStudentAccount.publicKey.toBase58() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to initialize student." });
    }
};

// --- CREDENTIAL CONTROLLERS ---
const issueCredential = async (req, res) => {
    try {
        const { universityKey, studentAccountKey, degree, graduationYear } = req.body;
        const newCredentialAccount = Keypair.generate();
        const tx = await program.methods
            .issueCredential(degree, parseInt(graduationYear))
            .accounts({
                credentialAccount: newCredentialAccount.publicKey,
                university: new PublicKey(universityKey),
                studentAccount: new PublicKey(studentAccountKey),
                authority: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([newCredentialAccount])
            .rpc();
        res.status(200).json({ message: "Credential issued!", signature: tx, credentialAccountKey: newCredentialAccount.publicKey.toBase58() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to issue credential." });
    }
};

const revokeCredential = async (req, res) => {
    try {
        const { credentialKey, universityKey } = req.body;
        const tx = await program.methods
            .revokeCredential()
            .accounts({
                credentialAccount: new PublicKey(credentialKey),
                university: new PublicKey(universityKey),
                authority: provider.wallet.publicKey,
            })
            .rpc();
        res.status(200).json({ message: "Credential revoked!", signature: tx });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to revoke credential." });
    }
};

const updateCredential = async (req, res) => {
    try {
        const { credentialKey, universityKey, degree, graduationYear } = req.body;
        const tx = await program.methods
            .updateCredential(degree, graduationYear ? parseInt(graduationYear) : null)
            .accounts({
                credentialAccount: new PublicKey(credentialKey),
                university: new PublicKey(universityKey),
                authority: provider.wallet.publicKey,
            })
            .rpc();
        res.status(200).json({ message: "Credential updated!", signature: tx });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update credential." });
    }
};

const prepareTogglePrivacy = async (req, res) => {
    try {
        const { studentAccountKey, studentWalletKey } = req.body;
        const instruction = await program.methods
            .togglePrivacy()
            .accounts({
                studentAccount: new PublicKey(studentAccountKey),
                wallet: new PublicKey(studentWalletKey),
            })
            .instruction();
        const transaction = new Transaction();
        transaction.add(instruction);
        transaction.feePayer = provider.wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        const serializedTx = transaction.serialize({ requireAllSignatures: false });
        res.status(200).json({ transaction: serializedTx.toString('base64') });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to prepare transaction." });
    }
};

module.exports = {
    registerUniversity,
    getUniversity,
    deleteUniversity,
    initializeStudent,
    issueCredential,
    revokeCredential,
    updateCredential,
    prepareTogglePrivacy,
};