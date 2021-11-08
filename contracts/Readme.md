## Class whitelist
<dl>
<dt><a href="#WhitelistContract">Whitelist</a></dt>
<dd></dd>
</dl>

## Function
<dl>
<dt><a href="#add">add(address, ethAmount)</a></dt>
<dd><p>Add chosed users list to the whitelist with their maximum amount of tokens they can buy</p></dd>
</dl>

<dl>
<dt><a href="#isWhiteListed">isWhitelisted(address)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if a user was in a whitelist</p></dd>
</dl>

<dl>
<dt><a href="#getIndividualMaximumAmount">getIndividualMaximumAmount(address)</a> ⇒ <code>integer</code></dt>
<dd><p>Get individual maximum amount of token for address</p></dd>
</dl>

## Class Pool
<dl>
<dt><a href="#poolContract">Pool</a></dt>
<dd></dd>
</dl>

## Function
<dl>
<dt><a href="#isBuyer">isBuyer(purchase_id)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if a sender is a purchaser of Purchase  with purchase_id</p></dd>
</dl>

<dl>
<dt><a href="#totalRaisedCost">totalRaiseCost()</a> ⇒ <code>integer</code></dt>
<dd><p>Total ETH can be raised (in wei unit)</p></dd>
</dl>

<dl>
<dt><a href="#availableTokens">availableTokens()</a> ⇒ <code>interger</code></dt>
<dd><p>Amount of tokens is been holding by contract</p></dd>
</dl>

<dl>
<dt><a href="#tokensLeft">tokensLeft()</a> ⇒ <code>interger</code></dt>
<dd><p>Amount of tokens haven't been sold yet</p></dd>
</dl>

<dl>
<dt><a href="#hasFinalized">hasFinalized()</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if a sale is finalized</p></dd>
</dl>
<dl>
<dt><a href="#hasStarted">hasStarted()</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if a sale is started</p></dd>
</dl>

<dl>
<dt><a href="#isPreStart">isPreStart()</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if a sale hasn't been started yet</p></dd>
</dl>

<dl>
<dt><a href="#isOpen">isOpen()</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if a sale is in open period</p></dd>
</dl>

<dl>
<dt><a href="#getInfo">getInfo()</a> ⇒ <code>address</code> | <code>integer</code> | <code>integer</code> | <code>integer</code> | <code>integer</code> | <code>integer</code> | <code>integer</code> | <code>integer</code></dt>
<dd><p>Get contract information for user</p></dd>
</dl>

<dl>
<dt><a href="#cost">cost(amount)</a> ⇒ <code>interger</code></dt>
<dd><p>Price of amount of token</p></dd>
</dl>

<dl>
<dt><a href="#getPurchase">getPurchase(purchase_id)</a> ⇒ <code>integer</code> | <code>address</code> | <code>integer</code> | <code>integer</code> | <code>bool</code></dt>
<dd><p>Get information of a purchase</p></dd>
</dl>

<dl>
<dt><a href="#getMyPurchases">getMyPurchases(address)</a> ⇒ <code>integer[]</code>
<dd><p>Get list of PurchasesID of buyer </p></dd>
</dl>

<dl>
<dt><a href="#fund">fund(amount)</a></dt>
<dd><p>Call contract to get token after owner approve for it</p></dd>
</dl>

<dl>
<dt><a href="#addToWhitelist">addToWhitelist(address, ethAmount)</a></dt>
<dd><p>Adding addresses list and their maximum amount into whitelist of pool</p></dd>
</dl>

<dl>
<dt><a href="#getTotalPurchasesAmount">getTotalPurchasesAmount(address)</a> ⇒ <code>integer</code></dt>
<dd><p>Get total amount of token was bought by the investor</p></dd>
</dl>

<dl>
<dt><a href="#swap">swap(amount)</a></dt>
<dd><p>buy _amount of token</p></dd>
</dl>

<dl>
<dt><a href="#redeemTokens">redeemTokens(purchase_id)</a></dt>
<dd><p>The investor redeem bought tokens of a purchase</p></dd>
</dl>

<dl>
<dt><a href="#withdrawFunds">withdrawFunds()</a></dt>
<dd><p>Owner withdraw ETH after sale period</p></dd>
</dl>

<dl>
<dt><a href="#withdrawUnsoldTokens">withdrawUnsoldTokens()</a></dt>
<dd><p>Owner withdraw unsold tokens after sale period</p></dd>
</dl>

# Class
<a name="WhitelistContract"></a>
## Whitelist
### new Whitelist(_hasWhitelisting, _individualMaximumAmount_public)
| Param | Type | Description |
| --- | --- | --- |
| _hasWhitelisting | <code>Boolean</code> | verify if a contract is had whitelist |
| _individualMaximumAmount_public | <code>Integer</code> | invidual maximum amount of tokens per investor can purchase |

# Function
<a name="add"></a>
### add(address, ethAmount)
| Param | Type | Description |
| --- | --- | --- |
| address | <code>Address List</code> | list of address is added into whitelist |
| ethAmount | <code>Integer List</code> | list of ETH amount corresponds to each element above |

<a name="isWhitelisted"></a>
### isWhitelisted(address) ⇒ <code>Boolean</code>
**Returns**: <code>Boolean</code> - verify if a user is in the whitelist
| Param | Type | Description |
| --- | --- | --- |
|address | <code>Address<code> | user's address |

<a name="getIndividualMaximumAmount"></a>
### getIndividualMaximumAmount(address) ⇒ <code>Integer</code>
return: <code>Integer</code> - individual Maximum Amount for each address
| Param | Type | Description |
| --- | --- | --- |
| address | <code>Address</code> | user's address |

# Class
<a name="poolContract"></a>
## Pool
### new Pool(_tokenAddress, _tradeValue, _tokensForSale, _startDate, _endDate, _feeAmount, _hasWhiteListing, _individualMaximumAmount_public)
| Param | Type | Description |
| --- | --- | --- |
| _tokenAddress | <code>Address</code> | address of token |
| _tradeValue | <code>Integer</code> | number of wei per token |
| _tokensForSale | <code>Integer</code> | total tokens for sale in the contract |
| _startDate | <code>Integer</code> | start date |
| _endDate | <code>Integer</code> | end date |
| _feeAmount | <code>Integer</code> | fee for contract |
| _hasWhiteListing | <code>Boolean</code> | verify if a contract is had whitelist |
| _individualMaximumAmount_public | <code>Integer</code> | invidual maximum amount per investor can purchase |

# Function
<a name="isBuyer"></a>
### isBuyer(purchase_id) ⇒ <code>Boolean</code>
**Returns**: <code>Boolean</code> - check if sender is purchaser of Purchase with purchase_id
| Param | Type | Description |
| --- | --- | --- |
| purchase_id | <code>Integer</code> | Id of purchase |

<a name="totalRaiseCost"></a>
### totalRaiseCost() ⇒ <code>Integer</code>
**Returns**: <code>Integer</code> - total ETH can be raised (in wei unit)

<a name="availableTokens"></a>
### availableTokens() ⇒ <code>Integer</code>
**Returns**: <code>Integer</code> - amount of tokens that contract is holding

<a name="tokensLeft"></a>
### tokensLeft() ⇒ <code>Integer</code>
**Returns**: <code>Integer</code> - amount of unsold tokens

<a name="hasFinalized"></a>
### hasFinalized() ⇒ <code>Boolean</code>
**Returns**: <code>Boolean</code> - check if a sale is finalized

<a name="hasStarted"></a>
### hasStarted() ⇒ <code>Boolean</code>
**Returns**: <code>Boolean</code> - check if a sale is started

<a name="isPreStart"></a>
### isPreStart() ⇒ <code>Boolean</code>
**Returns**: <code>Boolean</code> - check if a sale hasn't been started yet

<a name="isOpen"></a>
### isOpen() ⇒ <code>Boolean</code>
**Returns**: <code>Boolean</code> - check if the sale is in open period

<a name="getInfo"></a> 
### getInfo() ⇒ <code>Address</code> | <code>Integer</code> | <code>Integer</code> | <code>Integer</code> | <code>Integer</code> | <code>Integer</code> | <code>integer</code> | <code>integer</code>
**Return**:
 - <code>Address</code> - token's address
 - <code>Integer</code> - token's decimal
 - <code>Integer</code> - token's price
 - <code>Integer</code> - sale start date
 - <code>Integer</code> - sale end date
 - <code>Integer</code> - total tokens were sold
 - <code>Integer</code> - total token for sale
 - <code>Integer</code> - total raise

<a name="cost"></a>
### cost(amount) ⇒ <code>Integer</code>
**Return**: <code>Integer</code> - price of amount of tokens
| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Integer</code> | amount of tokens |

<a name="getPurchase"></a>
### getPurchase(purchase_id) ⇒ <code>Integer</code> | <code>Address</code> | <code>Interger</code> | <code>Integer</code> | <code>Boolean</code>
**Return**: 
 - <code>Integer</code> - sold token amount
 - <code>Address</code> - investor's address
 - <code>Integer</code> - amount of Wei that a investor use to buy
 - <code>Integer</code> - time of making purchase
 - <code>Boolean</code> - confirm the tokens were sent already

| Param | Type | Description |
| --- | --- | --- |
| purchase_id | <code>Integer</code> | id of purchase |

<a name="getMyPurchases"></a>
### getMyPurchases(address) ⇒ <code>Integer List</code>
**Returns**: <code>Integer List</code> - an investor's list id of purchases
| Param | Type | Description |
| --- | --- | --- |
| address | <code>Address</code> | Address of investor |

<a name="fund"></a>
### fund(amount)
| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Integer</code> | amount of tokens is approved by owner |

<a name="addToWhitelist"></a>
### addToWhitelist(addresses, ethAmounts)
| Param | Type | Description |
| --- | --- | --- |
| addresses | <code>Address List</code> | list of address will be add into whitelist |
| ethAmounts | <code>Inteeger List</code> | list of ETH amount corresponds to each element above |

<a name="getTotalPurchaseAmount"></a>
### getTotalPurchaseAmount(address) ⇒ <code>Integer</code>
**Returns**: <code>Integer</code> - total tokens a investor bought
| Param | Type | Description |
| --- | --- | --- |
| address | <code>Address</code> | address of a investor |

<a name="swap"></a>
### swap(amount)
| Param | Type | Description |
| --- | --- | --- |
| amount | <code>Integer</code> | amount of tokens investor buys |

<a name="redeemTokens"></a>
### redeemTokens(purchase_id)
| Param | Type | Description |
| --- | --- | --- |
| purchase_id | <code>Integer</code> | purchase id of investor |

#Admin functions

<a name="withdrawFunds"></a>
### withdrawFunds()

<a name="withdrawUnsoldTokens"></a>
### withdrawUnsoldTokens()