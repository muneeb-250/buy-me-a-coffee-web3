const hre = require('hardhat');

const main = async () => {
    const coffee = await hre.ethers.getContractFactory('BuyMeACoffee');
    const Coffee = await coffee.deploy();
    console.log(`Contract deployed at ${Coffee.address}`);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });