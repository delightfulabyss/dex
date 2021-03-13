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
        if(_side == Side.BUY){
            for (uint256 index = orders.length - 1; index > 0; index--) {
                if (orders[index].price <= orders[index - 1].price){
                    break;
                } else if(orders[index].price > orders[index - 1].price){
                    //swap last element and penultimate element
                    Order memory orderToMove = orders[index];
                    orders[index] = orders[index - 1];
                    orders[index - 1] = orderToMove;
                }
            }
        }
        else if(_side == Side.SELL){
            for (uint256 index = orders.length - 1; index > 0; index--) {
                if (orders[index].price >= orders[index - 1].price){
                    break;
                } else if(orders[index].price < orders[index - 1].price){
                    //swap last element and penultimate element
                    Order memory orderToMove = orders[index];
                    orders[index] = orders[index - 1];
                    orders[index - 1] = orderToMove;
                }
            }
        }
        nextOrderId++;
    }
}