// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// use for remix
//import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol';

import '../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {
    
    address private _creator;
    
    constructor(string memory name, string memory symbol, uint amount) ERC20(name, symbol) {
        _mint(msg.sender, amount * 10 ** uint(decimals()));
        _creator = msg.sender;
    }
    
    //Return address of the creator of this contract
    function getCreator() public view returns(address) {
        return _creator;
    }
    
    //Create more 'amount' tokens and send it to 'recipient'
    function mint(address recipient, uint amount) public {
        require(msg.sender == _creator);
        _mint(recipient, amount * 10 ** uint(decimals()));
    }
    
    //Destroy 'amount' tokens
    function burn(uint amount) public {
        require(msg.sender == _creator);
        _burn(msg.sender, amount);
    }
}
