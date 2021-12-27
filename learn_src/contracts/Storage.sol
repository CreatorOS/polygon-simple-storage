// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract Storage {
    uint256 public number;

    constructor(uint256 num) payable {
        require(msg.value == 0.001 ether);
        number = num;
    }
}
