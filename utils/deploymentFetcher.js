const prefixedContractName = (contractName, isV2) => {
  const version = isV2 ? "__SSV2" : "";
  return `${contractName}${version}#${contractName}${version}`;
};

const getDeployedAddresses = async (networkId) => {
  path = `../ignition/deployments/chain-${networkId}/deployed_addresses.json`;
  try {
    return require(path);
  } catch {
    throw new Error(`Can't find deployment addresses for networkID: "${networkId}"`);
  }
};

const getDeployedContractAddress = async (networkId, contractName, isV2) => {
  const deployedAddresses = await getDeployedAddresses(networkId);
  const prefixedContract = prefixedContractName(contractName, isV2);
  console.log({
    deployedAddresses,
    contractName,
    prefixedContract,
  });
  const address = deployedAddresses[prefixedContract];
  if (address == null) {
    throw new Error(`Can't find "${contractName}" deployment address for networkID: "${networkId}"`);
  }
  return address;
};

module.exports.getDeployedContractAddress = getDeployedContractAddress;

const getDeployedArtifact = async (networkId, contractName, isV2) => {
  path = `../ignition/deployments/chain-${networkId}/artifacts/${prefixedContractName(contractName, isV2)}.json`;
  try {
    return require(path);
  } catch {
    throw new Error(`Can't find "${contractName}" deployment for networkID: "${networkId}"`);
  }
};

module.exports.getDeployedContract = async (networkId, contractName, isV2) => {
  const artifact = await getDeployedArtifact(networkId, contractName, isV2);

  const contractAddress = await getDeployedContractAddress(networkId, contractName, isV2);

  return ethers.getContractAt(artifact.contractName, contractAddress);
};
