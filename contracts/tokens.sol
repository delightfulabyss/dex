// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0 < 0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Link is ERC20 {
    constructor () ERC20("Chainlink", "Link") {
        _mint(msg.sender, 5000);
    }
}