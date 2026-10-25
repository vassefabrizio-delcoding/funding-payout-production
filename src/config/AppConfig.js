const crypto = require('crypto');
const { ethers } = require('ethers');

class AppConfig {
    constructor() {
        this.networks = {
            solana: { rpc: 'https://alchemy.com', chainId: 101 },
            ethereum: { rpc: 'https://alchemy.com', chainId: 1 },
            polygon: { rpc: 'https://alchemy.com', chainId: 137 },
            arbitrum: { rpc: 'https://alchemy.com', chainId: 42161 },
            base: { rpc: 'https://alchemy.com', chainId: 8453 },
            bsc: { rpc: 'https://alchemy.com', chainId: 56 },
            bitcoin: { rpc: 'https://alchemy.com', chainId: 0 }
        };

        this.tokens = {
            USDT: {
                ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                bsc: '0x55d398326f99059fF775485246999027B3197955',
                arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
            },
            USDC: {
                ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0CE3606eB48',
                polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
                base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
            },
            EURC: {
                ethereum: '0x1aBaEA1f7C830F0ae589e17972384c145Ef5849B',
                base: '0x60a3E35Cc307639696665e317CC497C19DFFCdFe'
            },
            DAI: {
                ethereum: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                polygon: '0x8f3Cf6ad23Cd3EAd96143c01f681506496ec93c2',
                bsc: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'
            },
            BUSD: {
                bsc: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
                ethereum: '0x4Fabb145d74652a948d72533023f6E7A623C7C53'
            }
        };

        this.erc20Abi = [
            { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
            { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "type": "function" },
            { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }
        ];

        this.adminSecureKey = '0x' + crypto.createHash('sha256').update('Vault-Institutional-Key-Production-Secure-2026').digest('hex');
    }

    getNetworkConfig(network) {
        if (!this.networks[network]) throw new Error(`Rete ${network} non supportata.`);
        return this.networks[network];
    }

    getTokenAddress(symbol, network) {
        if (!this.tokens[symbol] || !this.tokens[symbol][network]) return null;
        return ethers.utils.getAddress(this.tokens[symbol][network]);
    }
}
module.exports = new AppConfig();
