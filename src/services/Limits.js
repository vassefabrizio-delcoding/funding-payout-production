class Limits {
    constructor() {
        this.config = { maxSingleTransaction: 50000.00, dailyCumulativeLimit: 150000.00 };
        this.dailyUsage = {};
    }
    getLimits() { return this.config; }
    updateLimits(maxSingle, dailyCumulative) {
        this.config.maxSingleTransaction = parseFloat(maxSingle);
        this.config.dailyCumulativeLimit = parseFloat(dailyCumulative);
        return this.config;
    }
    checkTransaction(userId, amount) {
        const parsedAmount = parseFloat(amount);
        if (parsedAmount > this.config.maxSingleTransaction) throw new Error(`Soglia transazione superata.`);
        const usageKey = `${userId}_${new Date().toISOString().split('T')[0]}`;
        if (!this.dailyUsage[usageKey]) this.dailyUsage[usageKey] = 0.00;
        if (this.dailyUsage[usageKey] + parsedAmount > this.config.dailyCumulativeLimit) throw new Error(`Soglia giornaliera superata.`);
        return true;
    }
    confirmTransactionUsage(userId, amount) {
        const usageKey = `${userId}_${new Date().toISOString().split('T')[0]}`;
        this.dailyUsage[usageKey] += parseFloat(amount);
    }
}
module.exports = new Limits();