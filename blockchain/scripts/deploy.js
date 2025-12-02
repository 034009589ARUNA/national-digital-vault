const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying DocVault contract...");

  const DocVault = await hre.ethers.getContractFactory("DocVault");
  const docVault = await DocVault.deploy();

  await docVault.waitForDeployment();

  const contractAddress = await docVault.getAddress();
  console.log("DocVault deployed to:", contractAddress);

  // Get the ABI
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/DocVault.sol/DocVault.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  // Create backend/contract directory if it doesn't exist
  const backendContractDir = path.join(__dirname, "../../backend/contract");
  if (!fs.existsSync(backendContractDir)) {
    fs.mkdirSync(backendContractDir, { recursive: true });
  }

  // Save ABI to backend
  const abiPath = path.join(backendContractDir, "DocVault.json");
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log("ABI saved to:", abiPath);

  // Save contract address to .env.example
  const envExamplePath = path.join(__dirname, "../../backend/.env.example");
  const envPath = path.join(__dirname, "../../backend/.env");
  
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, "utf8");
  }

  // Update or add CONTRACT_ADDRESS
  if (envContent.includes("CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("Contract address saved to backend/.env");

  console.log("\n✅ Deployment complete!");
  console.log("Contract Address:", contractAddress);
  console.log("\nNext steps:");
  console.log("1. Copy the contract address to your backend .env file");
  console.log("2. Start your backend server");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

