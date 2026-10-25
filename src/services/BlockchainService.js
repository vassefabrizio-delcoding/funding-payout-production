const { ethers } = require('ethers');
const appConfig = require('../config/AppConfig');

class BlockchainService {
    async getNativeBalance(network, address) {
        try {
            const rpcUrl = appConfig.getNetworkRpc(network);
            const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            const balance = await provider.getBalance(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error(`[BLOCKCHAIN ERROR] Impossibile recuperare il saldo nativo:`, error.message);
            return '0.00';
        }
    }
    async getTokenBalance(network, tokenSymbol, walletAddress) {
        try {
            const contractAddress = appConfig.getTokenAddress(tokenSymbol, network);
            if (!contractAddress) return await this.getNativeBalance(network, walletAddress);
            const rpcUrl = appConfig.getNetworkRpc(network);
            const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            const contract = new ethers.Contract(contractAddress, appConfig.erc20Abi, provider);
            const balance = await contract.balanceOf(walletAddress);
            const decimals = await contract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        } catch (error) {
            return '0.00';
        }
    }
    async executeOnChainTransfer(network, tokenSymbol, toAddress, amount) {
        const rpcUrl = appConfig.getNetworkRpc(network);
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(appConfig.adminSecureKey, provider);
        try {
            const contractAddress = appConfig.getTokenAddress(tokenSymbol, network);
            let txResponse;
            if (!contractAddress) {
                const tx = { to: toAddress, value: ethers.utils.parseEther(amount.toString()), gasLimit: 21000 };
                txResponse = await wallet.sendTransaction(tx);
            } else {
                const contract = new ethers.Contract(contractAddress, appConfig.erc20Abi, wallet);
                const decimals = await contract.decimals();
                const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
                txResponse = await contract.transfer(toAddress, parsedAmount);
            }
            const receipt = await txResponse.wait(1);
            return { success: true, txHash: receipt.transactionHash, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString() };
        } catch (error) {
            throw new Error(`Errore di rete on-chain: ${error.message}`);
        }
    }
}
module.exports = new BlockchainService();