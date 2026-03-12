// backend/routes.js
const express = require('express');
const {
    registerUniversity,
    getUniversity,
    deleteUniversity,
    initializeStudent,
    issueCredential,
    revokeCredential,
    updateCredential,
    prepareTogglePrivacy,
} = require('./controllers');
const router = express.Router();

// --- UNIVERSITY ROUTES ---
router.post('/university', registerUniversity);
router.get('/university/:universityKey', getUniversity); // <-- CORRECTED: Added :universityKey parameter
router.delete('/university', deleteUniversity);

// --- STUDENT ROUTES ---
router.post('/student', initializeStudent);
router.post('/privacy/prepareToggle', prepareTogglePrivacy);

// --- CREDENTIAL ROUTES ---
router.post('/credential', issueCredential);
router.put('/credential/revoke', revokeCredential);
router.put('/credential/update', updateCredential);

module.exports = router;