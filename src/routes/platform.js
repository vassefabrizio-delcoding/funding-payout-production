const express = require('express');
const router = express.Router();
const coreLedger = require('../services/CoreLedger');
const blockchainService = require('../services/BlockchainService');
const limits = require('../services/Limits');

router.get('/balance', async (req, res) => {
    try {
        const eur = await coreLedger.getFiatBalance('INSTITUTIONAL_USER_01', 'EUR');
        const usd = await coreLedger.getFiatBalance('INSTITUTIONAL_USER_01', 'USD');
        const eth = await blockchainService.getNativeBalance('ethereum', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
        const usdt = await blockchainService.getTokenBalance('polygon', 'USDT', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
        const usdc = await blockchainService.getTokenBalance('base', 'USDC', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
        return res.json({ fiat: { EUR: eur, USD: usd }, crypto: { ETH_Ethereum: eth, USDT_Polygon: usdt, USDC_Base: usdc } });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});
router.post('/fiat/mint', async (req, res) => {
    try {
        const r = await coreLedger.processFiatMintAndCredit('INSTITUTIONAL_USER_01', req.body.amount, req.body.currency, req.body.reference);
        return res.json({ success: true, ...r });
    } catch(e) { return res.status(400).json({ error: e.message }); }
});
router.post('/payout/execute', async (req, res) => {
    try {
        limits.checkTransaction('INSTITUTIONAL_USER_01', req.body.amount);
        const tx = await blockchainService.executeOnChainTransfer(req.body.network, req.body.tokenSymbol, req.body.toAddress, req.body.amount);
        await coreLedger.processFiatDebit('INSTITUTIONAL_USER_01', req.body.amount, 'EUR', `PAYOUT_${tx.txHash}`);
        limits.confirmTransactionUsage('INSTITUTIONAL_USER_01', req.body.amount);
        return res.json({ success: true, ...tx });
    } catch(e) { return res.status(400).json({ error: e.message }); }
});
router.get('/admin/limits', (req, res) => res.json(limits.getLimits()));
router.post('/admin/limits/update', (req, res) => res.json({ success: true, limits: limits.updateLimits(req.body.maxSingleTransaction, req.body.dailyCumulativeLimit) }));
router.get('/admin/audit', (req, res) => res.json(coreLedger.getCompleteAuditLogs()));
module.exports = router;