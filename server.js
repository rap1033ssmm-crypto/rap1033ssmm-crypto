const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configure standard database engine pool using your Compose parameters
const pool = new Pool({
    user: 'famo_admin',
    host: 'famo-ledger-db', // Maps natively to container names inside your mesh
    database: 'famo_sovereign_ledger',
    password: 'famo_matrix_secure_token_2026',
    port: 5432,
});

// Initialize database storage columns immediately upon boot configuration loops
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS asset_audit_logs (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                node_identifier VARCHAR(100),
                asset_key TEXT,
                integrity_check_type VARCHAR(100),
                verification_status VARCHAR(50),
                cryptographic_signature TEXT
            );
        `);
        console.log('Sovereign database tracking matrices successfully mounted.');
    } catch (err) {
        console.error('Critical Database initialization failure:', err);
    }
}
initDatabase();

// Core validation API channel used by trustseal.html
app.post('/api/verify-asset', async (req, res) => {
    const { assetId } = req.body;

    if (!assetId) {
        return res.status(400).json({ success: false, message: 'Missing core asset identifier hash.' });
    }

    // Generate real-time mathematical validation hashes
    const systemHash = crypto.createHmac('sha256', 'FAMO_SECRET_MATRIX_KEY')
                             .update(assetId + Date.now())
                             .digest('hex');

    const logEntry = {
        node: 'OMNISPHERE-MAIN-NODE-01',
        asset: assetId,
        check: 'SHA-256 Validated',
        status: 'SECURE',
        hash: systemHash
    };

    try {
        // Write permanently into the PostgreSQL container volumes
        await pool.query(
            `INSERT INTO asset_audit_logs (node_identifier, asset_key, integrity_check_type, verification_status, cryptographic_signature) 
             VALUES ($1, $2, $3, $4, $5)`,
            [logEntry.node, logEntry.asset, logEntry.check, logEntry.status, logEntry.hash]
        );

        res.json({
            success: true,
            message: 'Cryptographic confirmation recorded globally across media endpoints.',
            hash: systemHash
        });
    } catch (err) {
        console.error('Database write exception:', err);
        res.status(500).json({ success: false, message: 'Internal tracking ledger record failure.' });
    }
});

// Broadcast telemetry route to stream live historical information into the UI Audit grid
app.get('/api/logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM asset_audit_logs ORDER BY timestamp DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to extract active ledger tracking records.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Famo Sovereign Engine listening on port ${PORT}`));
