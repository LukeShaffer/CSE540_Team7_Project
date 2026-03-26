/*
    This is a draft file, more so just for structure until a common
    language is decided on.
*/

import {Object, Property, ClientIdentity} from 'fabric-contract-api';

/*
    In fabric, there is no more need to keep the asset handlers as a separate
    class within the code - these will now be represented by the peers in the
    private hyperledger blockchain.

    Also, not sure I'm initializing things right and if there are other options
    besides "Property". We'll get to that later
*/

export interface ShippingLeg {
    shippingHandler: ClientIdentity,
    shippingReceiver: ClientIdentity,
    isComplete: Boolean = false,
    isSuccess: Boolean = false,

    transitTimeStartMs: Number,
    maxTransitTimeMs: Number,
};

// The common per-item tolerances that apply to every shipping leg
export interface ShippingTolerances {
    humidityMin?: number,
    humidityMax?: number,

    tempMin?: number,
    tempMax?: number,

    shockMin?: number,
    shockMax?: number
}



@Object()
export class Asset {
    // internal tracking id
    @Property()
    assetId: string;

    // flag to signal object construction is finished and asset is "live"
    @Property()
    isShipped: Boolean = false;

    // final state flag once a delivery is successful for asset tracking to
    // turn off
    @Property()
    isDelivered: Boolean = false;

    // we want to avoid setting this to true
    @Property()
    isDamaged: Boolean = false;

    // used for tracking location for custody hand offs
    @Property()
    currentLat: Number = 0;
    @Property()
    currentLong: Number = 0;

    // An array of legs - trips from one handler to another.
    @Property()
    shippingLegs: ShippingLeg[] = [];

    @Property()
    shippingTolerances: ShippingTolerances = {};

    constructor(
        assetId: string,
        isShipped: boolean = false, isDelivered: Boolean = false,
        isDamaged: Boolean = false, currentLat: Number = 0,
        currentLong: Number = 0, shippingLegs: ShippingLeg[] = [],
    ) {
        this.assetId = assetId;
        this.isShipped = isShipped;
        this.isDelivered = isDelivered;
        this.isDamaged = isDamaged;
        this.currentLat = currentLat;
        this.currentLong = currentLong;
        this.shippingLegs = shippingLegs;
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