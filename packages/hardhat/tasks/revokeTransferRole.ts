task('revokeTransferRole', 'Revoke TRANSFER_ROLE')
  .addParam('spender', 'Spender address')
  .addParam('target', 'Address to grant TRANSFER_ROLE')
  .setAction(async taskArgs => {
    const [deployer] = await ethers.getSigners();

    const spender = await ethers.getContractAt('Spender', taskArgs.spender);

    console.log(`Revoking TRANSFER_ROLE from ${taskArgs.target} of ${taskArgs.spender}...`);

    await spender.revokeRole(
      ethers.keccak256(ethers.toUtf8Bytes('TRANSFER_ROLE')),
      taskArgs.target
    );

    console.log(`Revoked TRANSFER_ROLE from ${taskArgs.target} of ${taskArgs.spender}`);
  });
