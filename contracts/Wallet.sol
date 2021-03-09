// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0 < 0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable   {
    
    using SafeMath for uint256;

    //In order for the dex to call the token contract to do transfer calls (support for the token)
    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }
    mapping(bytes32 => Token) public tokenMapping;
    bytes32[] public tokenList;
    
    //Double mapping of addresses => ticker (in bytes) => balances
    //Uses bytes32 because we can't compare strings directly in Solidity
    mapping (address => mapping(bytes32 => uint256)) public balances;
    
    //Takes information about a token and adds it to storage
    function addTokenSupport(bytes32 ticker, address tokenAddress) external onlyOwner {
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
    }
    
    modifier tokenExists(bytes32 ticker) {
        require(tokenMapping[ticker].tokenAddress != address(0), "Token is not supported at this time");
        _;
    }

    function deposit(uint amount, bytes32 ticker) external tokenExists {
        require(IERC20(tokenMapping[ticker].tokenAddress).getBalanceOf(msg.sender)>= amount, "Insufficient balance for deposit");
        balances[msg.sender][ticker] = balances[msg.sender][ticker].add(amount);
        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint amount, bytes32 ticker) external tokenExists {
        require(balances[msg.sender][ticker]>= amount, "Insufficient balance for withdrawal");
        balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(amount);
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
    }

}