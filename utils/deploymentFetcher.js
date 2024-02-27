const prefixedContractName = (contractName) => {
  return `SummitSwapEcosystem#${contractName}`;
};

const getDeployedAddresses = async (networkId) => {
  path = `../ignition/deployments/chain-${networkId}/deployed_addresses.json`;
  try {
    return require(path);
  } catch {
    throw new Error(`Can't find deployment addresses for networkID: "${networkId}"`);
  }
};

const getDeployedContractAddress = async (networkId, contractName) => {
  const deployedAddresses = await getDeployedAddresses(networkId);
  const address = deployedAddresses[prefixedContractName(contractName)];
  if (address == null) {
    throw new Error(`Can't find "${contractName}" deployment address for networkID: "${networkId}"`);
  }
  return address;
};

const getDeployedArtifact = async (networkId, contractName) => {
  path = `../ignition/deployments/chain-${networkId}/artifacts/${prefixedContractName(contractName)}.json`;
  try {
    return require(path);
  } catch {
    throw new Error(`Can't find "${contractName}" deployment for networkID: "${networkId}"`);
  }
};

module.exports.getDeployedContract = async (networkId, contractName) => {
  const artifact = await getDeployedArtifact(networkId, contractName);

  const contractAddress = await getDeployedContractAddress(networkId, contractName);

  return ethers.getContractAt(artifact.contractName, contractAddress);
};
