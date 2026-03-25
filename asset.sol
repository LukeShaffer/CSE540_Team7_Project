/* Moving asset code to its own contract to clean things up */

pragma solidity >=0.4.16 <0.9.0;

contract Asset {
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

    constructor() {
        assetId = ASSET_ID_COUNTER++;
        isShipped = false;
        isDelivered = false;
        isDamaged = false;
        currentLatDec = 0;
        currentLongDec = 0;
        productFactory = msg.sender;
    }


    // Just function signatures for now


    /* === Private Methods === */



    /* === Public Methods === */

    function setAssetTolerances(uint tempMax, uint tempMin,
        uint humMax, uint humMin, uint maxForce
    )

    // Add a new shipping address onto this asset's lifespan
    // shipping locations can only be added in order and require a maximum time
    // in MS to be delivered from their previous location, after which the asset
    // will be declared defacto damaged even if no other damage has occurred
    function addAssetShippingLocation(address shippingLocation, uint maxShippingTimeMs) public
    
    // chron-type checkup function that reads asset sensors and will mark the
    // asset damaged if any of the damage tracking stats exceeds their total
    // Also implicitly checks if the current delivery time has exceeded the
    //  maximum allowable for this leg of the delivery.
    // - temp is a temperature, specified in degrees F * 100 for decimals
    // - humidity is specified as a percentage from 100 * 100 for decimals
    // - maxForce represents an accelerometer reading for the object in units
    //      of g * 100. Seems a normal range is to check up to 16 g
    function assessDamage(uint temp, uint humidity, uint maxForce) public

    // Public function to be called when the asset is within the geographic
    // bounds of the delivery point. Transitions the asset to the next
    // ownership phase
    function deliverAsset() public
}