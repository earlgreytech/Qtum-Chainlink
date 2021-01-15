pragma solidity 0.4.24;

import "./ChainlinkClient.sol";

contract Consumer is ChainlinkClient {
  bytes32 internal specId;
  bytes32 public currentPrice;

  uint256 constant private ORACLE_PAYMENT = 1 * LINK;

  event RequestFulfilled(
    bytes32 indexed requestId,  // User-defined ID
    bytes32 indexed price
  );

  function requestQTUMPrice() public {
    Chainlink.Request memory req = buildChainlinkRequest(specId, this, this.fulfill.selector);
    req.add("get", "https://api.liquid.com/products/133");
    req.add("path", "last_traded_price");
    req.addInt("times", 100000000);
    sendChainlinkRequest(req, 0);
  }


  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  ) public {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }

  function withdrawLink() public {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  }

  function fulfill(bytes32 _requestId, bytes32 _price)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestFulfilled(_requestId, _price);
    currentPrice = _price;
  }

}