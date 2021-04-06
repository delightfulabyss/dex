# Dex
> A decentralized exchange for Ether and ERC-20 tokens

## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)
* [Status](#status)
* [Contact](#contact)

## General info
This project is a working decentralized exchange for Ether and ERC20 tokens and was built as part of coursework in the [Ivan on Tech Blockchain Academy](https://academy.ivanontech.com/).

## Technologies
* Truffle - v5.1.58 (core: 5.1.58)
* Solidity - 0.7.6 (solc-js)
* Node - v10.16.3
* Web3.js v1.2.9

## Setup
In order to demo this project, please do the following:
* `$ git clone`  this repository to your local machine 
Install [Truffle](https://www.trufflesuite.com/truffle) and [Ganache](https://www.trufflesuite.com/ganache) on your local machine
* Open Ganache and connect a workspace to the truffle-config.js file in the project directory
* In the project root directory, run `$ truffle migrate` to deploy the dex and sample tokens contract to your Ganache local node
* Once the contracts have successfully deployed, you can use Truffle's console to interact with the deployed contract

## Code Examples
Example of contract interaction via Truffle console:
* `let dex = await Dex.deployed()`
* `let link = await Link.deployed()`
* `link.approve(dex.address, 500)`
* `await dex.deposit(500, web3.utils.utf8toHex('LINK'))`
* `await dex.depositEth({value: 10000, from: accounts[1]})`
* `await dex.createLimitOrder(0, web3.utils.utf8ToHex('LINK"), 10, 300, {from: accounts[1]})`
* `await dex.createMarketOrder(1, web3.utils.utf8ToHex('LINK"), 10)`

## Features
List of features ready:
* Add support for an ERC-20 token to the exchange contract
* Deposit and withdraw Ether and tokens to and from the exchange contract
* Place limit buy and sell orders
* Place market buy and sell orders
* Query the blockchain for an asset's buy or sell orderbook

To-do list:
*Replace on-chain orderbook functionality with liquidity pool and automated market maker functionality

## Status
Project is: _in progress_

## Contact
Created by [@matthewwatman](https://www.twitter.com/matthewwatman) - feel free to contact me!