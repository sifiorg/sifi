task('grantTransferRole', 'Grant TRANSFER_ROLE')
  .addParam('spender', 'Spender address')
  .addParam('target', 'Address to grant TRANSFER_ROLE')
  .setAction(async taskArgs => {
    const [deployer] = await ethers.getSigners();

    const spender = await ethers.getContractAt('Spender', taskArgs.spender);

    console.log(`Granting TRANSFER_ROLE to ${taskArgs.target} of ${taskArgs.spender}...`);

    await spender.grantRole(ethers.keccak256(ethers.toUtf8Bytes('TRANSFER_ROLE')), taskArgs.target);

    console.log(`Granted TRANSFER_ROLE to ${taskArgs.target} of ${taskArgs.spender}`);
  });
