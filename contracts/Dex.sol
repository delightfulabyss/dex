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
        uint filled;
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
            Order(nextOrderId, msg.sender, _side, _ticker, _amount, _price, 0)
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

    function createMarketOrder(Side _side, bytes32 _ticker, uint _amount) public {
            if (_side == Side.SELL){
                //Verify that seller has enough tokens to cover order
                require(balances[msg.sender][_ticker] >= _amount, "Insufficient balance for trade");
            }
        //Get opposite orderbook
        Order[] storage orders = orderBook[_ticker][_side == Side.BUY ? 1 : 0];

        uint totalFilled = 0;

        //loop through orderbook
        for (uint256 i = 0; i < orders.length && totalFilled < _amount; i++) {
            uint leftToFill = _amount.sub(totalFilled); //amount - totalFilled
            //Identify how much we can fill from order[i]
            uint availableToFill = orders[i].amount.sub(orders[i].filled); //order.amount - order.filled
            uint filled = 0;
            if(availableToFill > leftToFill) {
                filled = leftToFill; //Fills the entire market order
            } else{ //availableToFill <= leftToFill
                filled = availableToFill; //Fills as much as is available in order[i]
            }
            //Update totalFilled
            totalFilled = totalFilled.add(filled);

            //Modify the order with the amount filled
            orders[i].filled = orders[i].filled.add(filled);

            //Define cost to buyer
            uint cost = filled.mul(orders[i].price);

            //Execute the trade for each order and shift balances between buyer and seller
            if (_side == Side.BUY){
                //Verify that buyer has enough ETH to cover the purchase (amount * price)
                require(balances[msg.sender][bytes32('ETH')] >= cost, "Insufficient balance for trade");

                //msg.sender is the buyer
                //Add tokens and subtract ETH from buyer balances
                balances[msg.sender][_ticker] = balances[msg.sender][_ticker].add(filled);
                balances[msg.sender][bytes32('ETH')] = balances[msg.sender][bytes32('ETH')].sub(cost);

                //Add ETH and subtract token from seller balances
                balances[orders[i].trader][_ticker] = balances[orders[i].trader][_ticker].sub(filled);
                balances[orders[i].trader][bytes32('ETH')] = balances[orders[i].trader][bytes32('ETH')].add(cost);
            } else if (_side == Side.SELL){
                //msg.sender is the seller
                //Transfer ETH from buyer to seller
                balances[msg.sender][_ticker] = balances[msg.sender][_ticker].sub(filled);
                balances[msg.sender][bytes32('ETH')] = balances[msg.sender][bytes32('ETH')].add(cost);       
                //Transfer tokens from seller to buyer
                balances[orders[i].trader][_ticker] = balances[orders[i].trader][_ticker].add(filled);
                balances[orders[i].trader][bytes32('ETH')] = balances[orders[i].trader][bytes32('ETH')].sub(cost);
            }

        }
        //Loop through the orderbook and remove 100% filled orders (delete elements from an array that is sorted)
        while (orders.length > 0 && orders[0].filled == orders[0].amount) {
            //Remove the top element in the order array by overwriting every element with the next element in the orders list
            //Unbounded and therefore costly
            for (uint256 i = 0; i < orders.length - 1; i++) {
                orders[i] = orders[i + 1];
            }
            //Remove the duplicate at the end of the list
            orders.pop();
        }
    }
}