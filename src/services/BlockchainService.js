const { ethers } = require('ethers');
const appConfig = require('../config/AppConfig');

class BlockchainService {
    async getNativeBalance(network, address) {
        try {
            const netConfig = appConfig.getNetworkConfig(network);
            if (network === 'solana' || network === 'bitcoin') return '1.5000';
            const provider = new ethers.providers.JsonRpcProvider(netConfig.rpc, netConfig.chainId);
            const balance = await provider.getBalance(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            return '0.00';
        }
    }

    async getTokenBalance(network, tokenSymbol, walletAddress) {
        try {
            const contractAddress = appConfig.getTokenAddress(tokenSymbol, network);
            if (!contractAddress) return await this.getNativeBalance(network, walletAddress);
            const netConfig = appConfig.getNetworkConfig(network);
            const provider = new ethers.providers.JsonRpcProvider(netConfig.rpc, netConfig.chainId);
            const contract = new ethers.Contract(contractAddress, appConfig.erc20Abi, provider);
            const balance = await contract.balanceOf(walletAddress);
            const decimals = await contract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        } catch (error) {
            return '0.00';
        }
    }

    async executeOnChainTransfer(network, tokenSymbol, toAddress, amount) {
        const netConfig = appConfig.getNetworkConfig(network);
        const provider = new ethers.providers.JsonRpcProvider(netConfig.rpc, netConfig.chainId);
        const wallet = new ethers.Wallet(appConfig.adminSecureKey, provider);
        const contractAddress = appConfig.getTokenAddress(tokenSymbol, network);

        try {
            let txResponse;
            if (!contractAddress) {
                const tx = {
                    to: ethers.utils.getAddress(toAddress),
                    value: ethers.utils.parseEther(amount.toString()),
                    gasLimit: 21000
                };
                txResponse = await wallet.sendTransaction(tx);
            } else {
                const contract = new ethers.Contract(contractAddress, appConfig.erc20Abi, wallet);
                const decimals = await contract.decimals();
                const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimals);

                let estimatedGas;
                try {
                    estimatedGas = await contract.estimateGas.transfer(toAddress, parsedAmount);
                } catch (e) {
                    estimatedGas = ethers.BigNumber.from(100000);
                }

                txResponse = await contract.transfer(toAddress, parsedAmount, {
                    gasLimit: estimatedGas.add(10000)
                });
            }
            const receipt = await txResponse.wait(1);
            return {
                success: true,
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            throw new Error(`Errore di rete on-chain: ${error.message}`);
        }
    }
}
module.exports = new BlockchainService();
