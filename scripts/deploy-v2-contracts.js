// Enhanced deployment script for USDCPaymentSchedulerV2 with Chainlink Automation
// This script can be used with Hardhat or adapted for Remix IDE

const hre = require("hardhat")

// USDC addresses on different testnets
const USDC_ADDRESSES = {
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  mumbai: "0x0FA8781a83E468F3b7C25308B9421c0c1bE7a6B0",
  arbitrumSepolia: "0x75faf114eafb1BDbe6fc3363c7f609b9d5a8f3dA",
}

// Network configurations
const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad", // Sepolia Automation Registry
  },
  mumbai: {
    chainId: 80001,
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com/",
    blockExplorer: "https://mumbai.polygonscan.com",
    automationRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6", // Mumbai Automation Registry
  },
  arbitrumSepolia: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    automationRegistry: "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad", // Arbitrum Sepolia Automation Registry
  },
}

async function deployContract(networkName, usdcAddress) {
  console.log(`\n🚀 Deploying USDCPaymentSchedulerV2 on ${networkName}...`)
  console.log(`USDC Address: ${usdcAddress}`)

  try {
    // Get the contract factory
    const USDCPaymentSchedulerV2 = await hre.ethers.getContractFactory("USDCPaymentSchedulerV2")

    // Deploy the contract
    const contract = await USDCPaymentSchedulerV2.deploy(usdcAddress)
    await contract.deployed()

    console.log(`✅ Contract deployed to: ${contract.address}`)
    console.log(`📊 Transaction hash: ${contract.deployTransaction.hash}`)

    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...")
    await contract.deployTransaction.wait(3)

    // Verify contract on block explorer (if supported)
    if (hre.network.name !== "hardhat") {
      console.log("🔍 Verifying contract...")
      try {
        await hre.run("verify:verify", {
          address: contract.address,
          constructorArguments: [usdcAddress],
        })
        console.log("✅ Contract verified successfully")
      } catch (error) {
        console.log("⚠️ Verification failed:", error.message)
      }
    }

    return {
      network: networkName,
      chainId: NETWORKS[networkName].chainId,
      contractAddress: contract.address,
      usdcAddress: usdcAddress,
      blockExplorer: `${NETWORKS[networkName].blockExplorer}/address/${contract.address}`,
      deployedAt: new Date().toISOString(),
      automationRegistry: NETWORKS[networkName].automationRegistry,
    }
  } catch (error) {
    console.error(`❌ Deployment failed on ${networkName}:`, error.message)
    throw error
  }
}

async function main() {
  console.log("🏗️  Starting USDCPaymentSchedulerV2 Deployment")
  console.log("=".repeat(50))

  const deployments = []
  const networks = Object.keys(USDC_ADDRESSES)

  for (const network of networks) {
    try {
      const deployment = await deployContract(network, USDC_ADDRESSES[network])
      deployments.push(deployment)

      // Add delay between deployments
      if (network !== networks[networks.length - 1]) {
        console.log("⏳ Waiting 10 seconds before next deployment...")
        await new Promise((resolve) => setTimeout(resolve, 10000))
      }
    } catch (error) {
      console.error(`Failed to deploy on ${network}:`, error.message)
      // Continue with other networks
    }
  }

  // Generate deployment summary
  console.log("\n📋 DEPLOYMENT SUMMARY")
  console.log("=".repeat(50))

  deployments.forEach((deployment) => {
    console.log(`\n🌐 ${deployment.network.toUpperCase()}`)
    console.log(`   Contract: ${deployment.contractAddress}`)
    console.log(`   USDC: ${deployment.usdcAddress}`)
    console.log(`   Explorer: ${deployment.blockExplorer}`)
    console.log(`   Automation Registry: ${deployment.automationRegistry}`)
  })

  // Save deployment info to file
  const fs = require("fs")
  const deploymentData = {
    timestamp: new Date().toISOString(),
    version: "v2",
    deployments: deployments,
    chainlinkAutomation: {
      enabled: true,
      registryAddresses: Object.fromEntries(deployments.map((d) => [d.network, d.automationRegistry])),
    },
  }

  fs.writeFileSync("deployments/v2-deployment-addresses.json", JSON.stringify(deploymentData, null, 2))

  console.log("\n💾 Deployment data saved to deployments/v2-deployment-addresses.json")

  // Generate Chainlink Automation setup instructions
  generateAutomationInstructions(deployments)
}

function generateAutomationInstructions(deployments) {
  console.log("\n🔗 CHAINLINK AUTOMATION SETUP")
  console.log("=".repeat(50))

  deployments.forEach((deployment) => {
    console.log(`\n📍 ${deployment.network.toUpperCase()}`)
    console.log(`1. Go to: https://automation.chain.link/`)
    console.log(`2. Connect MetaMask to ${deployment.network}`)
    console.log(`3. Click "Register new Upkeep"`)
    console.log(`4. Select "Custom logic"`)
    console.log(`5. Contract Address: ${deployment.contractAddress}`)
    console.log(`6. Admin Address: YOUR_WALLET_ADDRESS`)
    console.log(`7. Check interval: 60 seconds`)
    console.log(`8. Gas limit: 500000`)
    console.log(`9. Starting balance: 5 LINK tokens`)
    console.log(`10. Get LINK from: https://faucets.chain.link/`)
  })
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment script failed:", error)
    process.exit(1)
  })
