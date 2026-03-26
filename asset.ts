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
    isComplete: Boolean
    isSuccess: Boolean

    transitTimeStartMs: number,
    maxTransitTimeMs: number,
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
    currentLat: number = 0;
    @Property()
    currentLong: number = 0;

    // An array of legs - trips from one handler to another.
    @Property()
    shippingLegs: ShippingLeg[] = [];

    @Property()
    shippingTolerances: ShippingTolerances = {};

    constructor(
        assetId: string,
        isShipped: boolean = false, isDelivered: Boolean = false,
        isDamaged: Boolean = false, currentLat: number = 0,
        currentLong: number = 0, shippingLegs: ShippingLeg[] = [],
    ) {
        this.assetId = assetId;
        this.isShipped = isShipped;
        this.isDelivered = isDelivered;
        this.isDamaged = isDamaged;
        this.currentLat = currentLat;
        this.currentLong = currentLong;
        this.shippingLegs = shippingLegs;
    }

    /**
     * TODO: Stub function, will fill in later. Might be able to merge with
     * getCurrentState()
     */
    getCurrentLocation() {};

    /**
     * TODO: Stub function, will fill in later
     */
    getCurrentState() {};

    getCurrentShippingLeg(): ShippingLeg|undefined {
        return this.shippingLegs.find(leg => leg.isComplete)
    }
}