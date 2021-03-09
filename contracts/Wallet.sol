pragma solidity >= 0.6.0 < 0.8.0;

contract Wallet {
    
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
}