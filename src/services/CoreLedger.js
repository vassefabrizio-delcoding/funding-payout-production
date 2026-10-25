const crypto = require('crypto');

class CoreLedger {
    constructor() {
        this.balances = { SYSTEM_RESERVE_EUR: 10000000.00, SYSTEM_RESERVE_USD: 10000000.00 };
        this.auditLog = [];
    }
    async getFiatBalance(account, currency) {
        return this.balances[`${account}_${currency}`] || 0.00;
    }
    async processFiatMintAndCredit(userId, amount, currency, reference) {
        const targetKey = `${userId}_${currency}`;
        if (amount <= 0) throw new Error("Importo non valido.");
        const auditRecord = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: 'CREDIT_MINT',
            userId,
            amount: parseFloat(amount),
            currency,
            reference,
            checksum: ''
        };
        auditRecord.checksum = crypto.createHash('sha256').update(JSON.stringify(auditRecord)).digest('hex');
        if (!this.balances[targetKey]) this.balances[targetKey] = 0.00;
        this.balances[targetKey] += parseFloat(amount);
        this.balances[`SYSTEM_RESERVE_${currency}`] -= parseFloat(amount);
        this.auditLog.push(auditRecord);
        return { balance: this.balances[targetKey], auditId: auditRecord.id, checksum: auditRecord.checksum };
    }
    async processFiatDebit(userId, amount, currency, reference) {
        const targetKey = `${userId}_${currency}`;
        if (!this.balances[targetKey] || this.balances[targetKey] < amount) throw new Error("Fondi insufficienti.");
        this.balances[targetKey] -= parseFloat(amount);
        const auditRecord = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: 'DEBIT_PAYOUT', userId, amount: parseFloat(amount), currency, reference };
        this.auditLog.push(auditRecord);
        return { balance: this.balances[targetKey], auditId: auditRecord.id };
    }
    getCompleteAuditLogs() { return this.auditLog; }
}
module.exports = new CoreLedger();