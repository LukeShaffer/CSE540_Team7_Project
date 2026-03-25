/* First draft, this is probably trash */


pragma solidity >=0.4.16 <0.9.0;

contract AssetTracker {
    uint ASSET_ID_COUNTER = 0;
    mapping(uint => Asset) public assets;
    mapping(address => assetHandler) public assetHandlers;

    // I've seen that to simulate decimal arithmetic, people will take a unit
    // value and just multiply it by some large number to denote it
    // semantically a "decimal"
    uint public constant DECIMALS = 1e18;

    // A struct that represents nodes in a supply chain. Suppliers,
    // Manufacturers and transportation / logistics middlemen are all just
    // assetHanlders in that they will take custody of goods and 
    struct assetHandler {
        address handlerId;
        // Used exclusively for external event handling
        string public handlerName;

        // Pseudo decimals
        uint receivingLatDec;
        uint receivingLongDec;
    }

    struct Asset {
        // internal tracking id
        uint assetId;

        // flag to signal object construction is finished and asset is "live"
        bool isShipped;

        // final state flag once a delivery is successful for asset tracking to
        // turn off
        bool isDelivered;

        // we want to avoid setting this to true
        bool isDamaged;

        // used for tracking location for custody hand offs
        uint currentLatDec;
        uint currentLongDec;

        // common index for tracking the asset's current shipment state
        uint shipmentIndex;
        uint160[] shippingChainHandlers;
        bool[] shippingChainSuccess;

        // set an address that "owns" the asset for use during pre-shipment set
        // up
        address public productFactory;
    }

    


    function createAsset(address productFactory) public Asset{
        Asset newAsset;
        newAsset.assetId = ASSET_ID_COUNTER++;
        newAsset.isShipped = false;
        newAsset.isDelivered = false;
        newAsset.isDamaged = false;
        newAsset.currentLatDec = 0;
        newAsset.currentLongDec = 0;
        newAsset.productFactory = productFactory;

        assets[ASSET_ID_COUNTER] = newAsset;

        return newAsset
    }

    function addAssetShippingLocation()

    
    // there is no built in scheduling that can happen on-chain, we need to
    // have some off-chain service trigger this contract execution
    // see functionality in ethers.js, web3.js or brownie
    function assessDamage(temp, humidity, maxDeliveryTimeStamp) {
        if temp > tempThreshold:
            isDamaged = true;
        if humidity > humidityThreshold:
            isDamaged = true;
        if current_timestamp > maxDeliveryTimeStamp:
            isDamaged = true;
    }

    function get() public view returns (bool) {
        return isDamaged;
    }
}