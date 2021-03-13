// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0 < 0.8.0;
pragma experimental ABIEncoderV2;
import "./Wallet.sol";

contract Dex is Wallet {
    
    using SafeMath for uint256;

    enum Side {
        BUY,
        SELL
    }

    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    uint public nextOrderId;

    //Ticker => Side => Orderbook
    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 _ticker, Side _side) view public returns(Order[] memory){
        return orderBook[_ticker][uint(_side)];
    }

    function createLimitOrder(Side _side, bytes32 _ticker, uint _amount, uint _price) public {
    //Perform checks as required in tests 
        if(_side == Side.BUY){
            require(balances[msg.sender]['ETH'] >= _amount.mul(_price), "ETH balances insufficient");
        }
        if(_side == Side.SELL){
            require(balances[msg.sender][_ticker] >= _amount, "Token balances insufficient" );
        }
        
        Order[] storage orders = orderBook[_ticker][uint(_side)];
        orders.push(
            Order(nextOrderId, msg.sender, _side, _ticker, _amount, _price)
        );
        //Bubble sort algorithm 
        uint i = orders.length > 0 ? orders.length - 1 : 0;

        if(_side == Side.BUY){
            while(i > 0){
                if(orders[i - 1].price > orders[i].price) {
                    break;   
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }
        else if (_side == Side.SELL){
            while(i > 0){
                if(orders[i - 1].price < orders[i].price) {
                    break;   
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }
        nextOrderId++;
    }
}