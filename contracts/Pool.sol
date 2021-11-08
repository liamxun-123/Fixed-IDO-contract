//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8; 

import '../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol';

import '../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';

import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';

contract Whitelist is Ownable {

    mapping(address => bool) public whitelist;
    bool public hasWhitelisting = false;            // Pool Public or Private
    mapping(address => uint256) public individualMaximumAmount_private;  /* Maximum Amount Per Address */
    uint256 public individualMaximumAmount_public = 0;  /* Maximum Amount for all Address */

    event AddedToWhitelist(address[] indexed accounts);
    event RemovedFromWhitelist(address indexed account);

    constructor(bool _hasWhitelisting, uint256 _individualMaximumAmount_public) {
        hasWhitelisting = _hasWhitelisting;
        if (hasWhitelisting == false) {
            individualMaximumAmount_public = _individualMaximumAmount_public;
        }
    }

    /**
    Check function only work with sender who is a whitelisted address 
    */
    modifier onlyWhitelisted() {
        require(isWhitelisted(msg.sender), "Only for whitelisted address");
        _;
    }
    
    /**
    Check function only work with Private Pool
    */
    modifier onlyPrivate() {
        require(hasWhitelisting, "Only for Private Pool");
        _;
    }
    
    /**
    Check function only work with Public Pool
    */
    modifier onlyPublic() {
        require(!hasWhitelisting, "Only for Public Pool");
        _;
    }
    
    /**
    Adding addresses list and their individualMaximumAmount into whitelist
    */
    function add(address[] memory _addresses, uint256[] memory _ethAmounts) internal onlyPrivate onlyOwner {
        require(hasWhitelisting == true, "Only for Private pool");
        for(uint i = 0; i < _addresses.length; i++) {
            require(whitelist[_addresses[i]] == false, "Address already whitelisted");
            whitelist[_addresses[i]] = true;
            individualMaximumAmount_private[_addresses[i]] = _ethAmounts[i];
        }
        emit AddedToWhitelist(_addresses);
    }

    /**
    Removing an address from whitelist
    */
    //function remove(address _address) public onlyOwner {}

    /**
    Check if _address is whitelisted
    */
    function isWhitelisted(address _address) public view returns(bool) {
        return !hasWhitelisting || (hasWhitelisting && whitelist[_address]);
    }
    
    /**
    Get individualMaximumAmount of token that _address can buy
    */
    function getIndividualMaximumAmount(address _address) public view returns(uint256) {
        if(!isWhitelisted(_address)) {
            return 0;
        }
        if (hasWhitelisting) {
            return individualMaximumAmount_private[_address];
        }
        return individualMaximumAmount_public;
    }
}

contract Pool is Whitelist {
    using SafeMath for uint256;

    uint256 private nextPurchaseID = 1;

    mapping(uint256 => Purchase) public purchases; /* PurchaseId => Purchase */
    mapping(address => uint256[]) public myPurchases; /* userAdd => danh sách userPurchase */

    ERC20 public erc20;     /*Token address */
    bool public isSaleFunded = false;   /*If this contract has been sent enough token for sell */
    uint public decimals = 0;   /*Decimals of token */
    bool public unsoldTokensRedeemed = false;   /* If Owner has withdraw all tokenLeft */
    uint256 public tradeValue; /* Price in Wei/Token */
    uint256 public startDate; /* Start Date  */
    uint256 public endDate;  /* End Date  */
    uint256 public tokensAllocated = 0; /* Total Sold Token amount */
    uint256 public tokensForSale = 0; /* Total token for sale in this contract */
    address payable public FEE_ADDRESS = payable(0x6190Df18903E5cdb24D72736A34da8775241f1E1); /* Address of organization */
    uint256 public feePercentage = 1; /* Fee of contract */

    struct Purchase {
        uint256 amount;     /* Sold token amount */
        address purchaser;  /* Buyer's address */
        uint256 ethAmount;  /* Amount of Wei that purchaser use to buy token */
        uint256 timestamp;  /* Time of making purchase */
        bool wasFinalized;  /* Confirm the tokens were sent already */
    }

    event PurchaseEvent(uint256 amount, address indexed purchaser, uint256 timestamp);

    constructor(address _tokenAddress, uint256 _tradeValue, uint256 _tokensForSale, uint256 _startDate, 
        uint256 _endDate, uint256 _feeAmount, bool _hasWhitelisting, uint256 _individualMaximumAmount_public
    ) Whitelist(_hasWhitelisting, _individualMaximumAmount_public) {
        /* Confirmations */
        require(block.timestamp < _endDate, "End Date should be further than current date");
        require(block.timestamp < _startDate, "Start Date should be further than current date");
        require(_startDate < _endDate, "End Date higher than Start Date");
        require(_tokensForSale > 0, "Tokens for Sale should be > 0");
        require(_feeAmount >= feePercentage, "Fee Percentage has to be >= 1");
        require(_feeAmount <= 99, "Fee Percentage has to be < 100");
        require(_tradeValue > 0, "TradeValue has to be > 0");
        
        erc20 = ERC20(_tokenAddress);
        tradeValue = _tradeValue;
        tokensForSale = _tokensForSale;
        startDate = _startDate;
        endDate = _endDate;
        feePercentage = _feeAmount;
        hasWhitelisting = _hasWhitelisting;
        decimals = erc20.decimals();
    }

    /**
    Check function only work when Sale is finalized
    */
    modifier isSaleFinalized() {
        require(hasFinalized(), "Has to be finalized");
        _;
    }

    /**
    Check function only work when Sale is in open priod
    */
    modifier isSaleOpen() {
        require(isOpen(), "Has to be open");
        _;
    }

    /**
    Check function only work when Sale hasn't been started
    */
    modifier isSalePreStarted() {
        require(isPreStart(), "Has to be pre-started");
        _;
    }

    /**
    Check function only work when Contract is funded
    */
    modifier isFunded() {
        require(isSaleFunded, "Has to be funded");
        _;
    }

    /**
    Check if sender is purchaser of Purchase with purchase_id
    */
    function isBuyer(uint256 purchase_id) public view returns (bool) {
        Purchase memory purchase = purchases[purchase_id];
        return msg.sender == purchase.purchaser;
    }

    /**
    Total ETH can be raised (Price in Wei)
    */
    function totalRaiseCost() public view returns (uint256) {
        return cost(tokensForSale);
    }

    /**
    Amount of tokens that contract is holding
    */
    function availableTokens() public view returns (uint256) {
        return erc20.balanceOf(address(this));
    }

    /**
    Amount of tokens that have been sold yet
    */
    function tokensLeft() public view returns (uint256) {
        return tokensForSale.sub(tokensAllocated);
    }

    /**
    Check if Sale is finalized
    */
    function hasFinalized() public view returns (bool){
        return block.timestamp > endDate;
    }

    /**
    Check if Sale is started
    */
    function hasStarted() public view returns (bool){
        return block.timestamp > startDate;
    }
    
    /**
    Check if Sale hasn't been started yet
    */
    function isPreStart() public view returns (bool){
        return block.timestamp < startDate;
    }

    /**
    Check if Sale is in open period
    */
    function isOpen() public view returns (bool){
        return hasStarted() && !hasFinalized();
    }

    /**
    Get infomation of contract for user
    */
    function getInfo() public view returns(address, uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        uint256 totalRaise = totalRaiseCost();
        return (
            address(erc20),
            decimals,
            tradeValue, 
            startDate, 
            endDate, 
            tokensAllocated, 
            tokensForSale,
            totalRaise
        );
    }

    /**
    Price to buy _amount of token
    */
    function cost(uint256 _amount) public view returns (uint256){
        return _amount.mul(tradeValue).div(10**decimals);
    }

    /**
    Get individual maximum eth that buyer can use to buy token
    */
    function getIndividualMaximumCost(address _address) public view returns (uint256){
        return cost(getIndividualMaximumAmount(_address));
    }

    /**
    Get infomation of a purchase
    */
    function getPurchase(uint256 _purchase_id) external view returns (uint256, address, uint256, uint256, bool){
        Purchase memory purchase = purchases[_purchase_id];
        return (
            purchase.amount,
            purchase.purchaser,
            purchase.ethAmount,
            purchase.timestamp,
            purchase.wasFinalized
        );
    }

    /**
    PurchaseID list of a buyer
    */
    function getMyPurchases(address _address) public view returns(uint256[] memory) {
        return myPurchases[_address];
    }

    /* Fund - Pre Sale Start */
    
    /**
    Call contract to get token after Owner approve for it
    */
    function fund(uint256 _amount) public onlyOwner isSalePreStarted {
        require(_amount > 0, "Added amount has to be > 0");
        require(availableTokens().add(_amount) <= tokensForSale, "Added amount is over tokensForSale");
        require(erc20.transferFrom(msg.sender, address(this), _amount), "erc20 worked failed");
        
        if (availableTokens() == tokensForSale) {
            isSaleFunded = true;
        }
    }
    
    /**
    Adding addresses list and their individualMaximumAmount into whitelist of contract
    */
    function addToWhitelist(address[] memory _addresses, uint256[] memory _tokensAmount) public onlyOwner isSalePreStarted onlyPrivate {
        for(uint i = 0; i < _addresses.length; i++) {
            require(_tokensAmount[i] < tokensForSale, "IndividualMaximumAmount must be smaller than tokensForSale");
        }
        add(_addresses, _tokensAmount);
    }

    /**
    Total Amount of token that buyer has bought
    */
    function getTotalPurchasesAmount(address _address) public view returns(uint256) {
        uint256[] memory _myPurchases = myPurchases[_address];
        uint256 total = 0;
        for(uint i = 0; i < _myPurchases.length; i++){
            Purchase memory _purchase = purchases[_myPurchases[i]];
            total = total + _purchase.amount;
        }
        return total;
    }

    /**
    Buy _amount of token
    */
    function swap(uint256 _amount) payable external isFunded isSaleOpen onlyWhitelisted {
        require(_amount > 0, "Swap amount has to be > 0");
        uint256 maximum = getIndividualMaximumAmount(msg.sender);
        require(getTotalPurchasesAmount(msg.sender).add(_amount) <= maximum, "Swap amount has over individualMaximumAmount");
        require(_amount <= tokensLeft(), "Swap amount has to be < tokensLeft");
        require(msg.value >= cost(_amount), "Your ETH value not enough");
        
        Purchase memory newPurchase = Purchase(_amount, msg.sender, msg.value, block.timestamp, false);
        purchases[nextPurchaseID] = newPurchase;
        
        tokensAllocated = tokensAllocated.add(_amount);
        myPurchases[msg.sender].push(nextPurchaseID);
        
        nextPurchaseID = nextPurchaseID.add(1);
        emit PurchaseEvent(newPurchase.amount, newPurchase.purchaser, newPurchase.timestamp);
    }

    /**
    Redeem tokens that buyer bought
    */
    function redeemTokens(uint256 purchase_id) external isSaleFinalized {
        require(isBuyer(purchase_id), "Be not buyer of this Purchase");
        require(purchases[purchase_id].wasFinalized == false, "This Purchase has been finalized");
        purchases[purchase_id].wasFinalized = true;
        require(erc20.transfer(msg.sender, purchases[purchase_id].amount), "ERC20 worked failed");
        
    }

    /* Admin Functions */
    
    /**
    Withdraw ETH after sale period
    */
    function withdrawFunds() external onlyOwner isSaleFinalized {
        FEE_ADDRESS.transfer(address(this).balance.mul(feePercentage).div(100)); /* Fee Address */
        payable(msg.sender).transfer(address(this).balance);
    }  

    /**
    Withdram unsold tokens after sale period
    */
    function withdrawUnsoldTokens() external onlyOwner isSaleFinalized {
        require(unsoldTokensRedeemed == false, "You have got all your token already");
        unsoldTokensRedeemed = true;
        require(erc20.transfer(msg.sender, tokensLeft()), "ERC20 worked failed");
    }
}