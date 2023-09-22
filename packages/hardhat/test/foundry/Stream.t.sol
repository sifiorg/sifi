// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import {Stream} from 'contracts/libraries/Stream.sol';

contract StreamTest is Test {
  function test_vector1() public {
    bytes1 oneByte = 0x13;
    bytes2 twoBytes = 0x0102;
    bytes3 threeBytes = 0x010203;
    bytes4 fourBytes = 0x01020304;
    address anAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint256 aUint256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    bytes memory aVariableBytes = hex'deadbeef';
    address[] memory anAddressArray = new address[](2);
    anAddressArray[0] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    anAddressArray[1] = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    uint16[] memory aUint16Array = new uint16[](2);
    aUint16Array[0] = 0x0102;
    aUint16Array[1] = 0x0304;

    // Encode data
    bytes memory data = abi.encodePacked(
      oneByte,
      twoBytes,
      threeBytes,
      fourBytes,
      anAddress,
      aUint256,
      aVariableBytes.length,
      aVariableBytes,
      (uint8)(anAddressArray.length),
      anAddressArray[0],
      anAddressArray[1],
      (uint8)(aUint16Array.length),
      aUint16Array[0],
      aUint16Array[1]
    );

    emit log_bytes(data);

    uint256 stream = Stream.createStream(data);

    assertEq(Stream.isNotEmpty(stream), true);

    // Read and validate each data type from the stream
    assertEq(Stream.readUint8(stream), uint8(oneByte));
    assertEq(Stream.readUint16(stream), uint16(twoBytes));
    assertEq(Stream.readUint24(stream), uint24(threeBytes));
    assertEq(Stream.readUint32(stream), uint32(fourBytes));
    assertEq(Stream.readAddress(stream), anAddress);
    assertEq(Stream.readUint256(stream), aUint256);

    bytes memory readVariableBytes = Stream.readBytes(stream);
    assertEq(keccak256(readVariableBytes), keccak256(aVariableBytes));

    uint256 readAddressArrayLength = Stream.readUint8(stream);
    address[] memory readAddressArray = Stream.readAddresses(stream, readAddressArrayLength);
    assertEq(readAddressArray.length, anAddressArray.length);
    assertEq(readAddressArray[0], anAddressArray[0]);
    assertEq(readAddressArray[1], anAddressArray[1]);

    uint256 readUint16ArrayLength = Stream.readUint8(stream);
    uint16[] memory readUint16Array = Stream.readUint16s(stream, readUint16ArrayLength);
    assertEq(readUint16Array.length, aUint16Array.length, 'uint16Array length');
    assertEq(readUint16Array[0], aUint16Array[0], 'uint16Array[0]');
    assertEq(readUint16Array[1], aUint16Array[1], 'uint16Array[1]');
  }
}
