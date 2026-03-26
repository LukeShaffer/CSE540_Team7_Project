/* In the fabric samples this logic is separated into a separate file from the
type definition */

import {Context, Contract, Info, Returns, Transaction, ClientIdentity} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Asset, ShippingLeg, ShippingTolerances} from './asset';


type PartialWithRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

// This class contains all of the asset handling and governance logic.
@Info({title: 'AssetTransfer', description: 'Smart contract for IoT asset tracking and shipping logistics'});
export class AssetTransferContract extends Contract {

    @Transaction()
    public async CreateAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (exists) throw new Error(`The asset ${id} already exists`);

        const asset = new Asset(id);
        // insert the data in alphabetic order
        await ctx.sub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string|undefined) {
        if (id === null || id === undefined) return false;
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON.length > 0;
    }

    // Get an asset from its id
    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string|undefined): Promise<string> {
        // somehow magically gets the asset from the current context
        const assetJSON = await ctx.stub.getState(id);

        if (assetJSON.length === 0) throw new Error(`The asset ${id} does not exist`);

        return assetJSON.toString();
    }


    @Transaction()
    public async setTolerances(ctx: Context, id:string, tolerances: ShippingTolerances): Promise<void> {
        let asset: Asset = new Asset(JSON.parse(await this.ReadAsset(ctx, id)));

        // check that the asset has not already started its journey
        if (asset.isShipped) {
            throw new Error('Cannot edit an asset once it is shipped!')
        }

        asset.shippingTolerances = tolerances;

        this.updateAsset(ctx, asset);
    }


    /**
     * Add a shipping leg to this asset's planned route. Throws when the asset
     * specified has already left the warehouse
     * @param ctx - The hyperledger context
     * @param assetId - The id of the asset you want to edit
     * @param shippingLeg - The new shipping details
     */
    @Transaction()
    public async addShippingLeg(ctx: Context, assetId: string, shippingLeg: ShippingLeg): Promise<void> {
        let asset: Asset = new Asset(JSON.parse(await this.ReadAsset(ctx, assetId)));

        if (asset.isShipped || asset.isDelivered) {
            throw new Error(`Error, can't edit an asset that has already been shipped`);
        }

        // TODO: check if user adding shipping leg is authorized
        

        asset.shippingLegs.push(shippingLeg);
        this.updateAsset(ctx, asset)

    }

    /**
     * Update the asset with a partial mapping of new attribute values
     * @param ctx - The hyperledger context
     * @param newAsset - A simple Object with only a required "assetId" key
     * @returns 
     */
    @Transaction()
    public async updateAsset(ctx: Context, newAsset: PartialWithRequired<Asset, 'assetId'>): Promise<void> {
        let existing = new Asset(JSON.parse(await this.ReadAsset(ctx, newAsset.assetId)));
        
        // takes left and updates it with all the values present in right
        let updated = Object.assign(existing, newAsset);
        
        return ctx.stub.putState(updated.assetId, Buffer.from(stringify(sortKeysRecursive(updated))));
    }
     
   /**
    * Assess the current state of an asset and return a boolean of whether it
    * is bad enough to qualify as damaged.
    * @param ctx - The hyperledger context
    * @param id - The id of the asset
    * @returns 
    */
    @Transaction()
    public async assessDamage(ctx: Context, id: string|undefined): Promise<boolean> {
        let asset = new Asset(JSON.parse(await this.ReadAsset(ctx, id)));

        // Haven't fully defined how we will be assessing the current state of
        // the asset, temp, location, etc

        // leaving this as a mock, this is a TODO item
        let assetStats:Map<string, number> = asset.getCurrentState();
        if (!assetStats) return true;

        for (const [tolName, tolVal] of Object.entries(asset.shippingTolerances)){
            if (tolName.includes('Min') && assetStats.get(tolName) !== undefined) {
                if (tolVal > assetStats.get(tolName)) return true;
            }
            else if (tolName.includes('Max') && assetStats.get(tolName) !== undefined) {
                if (tolVal < assetStats.get(tolName)) return true;
            }
        }
        return false;
    }


    @Transaction()
    public async transferAsset(ctx: Context, id:string|undefined): Promise<void> {
        const asset = new Asset(JSON.parse(await this.ReadAsset(ctx, id)));

        // TODO, hasn't been implemented because I don't know where we're storing
        // the data
        const assetCurrentLocation = asset.getCurrentLocation();
        const assetReceiver = asset.getCurrentDeliveryReceiver()

        // TODO, not sure how I am going to link delivery party identities with
        // an immutable delivery location, but that is what I am looking to do
        // here
        const DELIVERY_LOCATIONS = {};
        if (isWithin(DELIVERY_LOCATIONS[assetReceiver], assetCurrentLocation)){
            // TODO - this will need to be fleshed out better

            // Mark shipping leg complete, and transition on to the next one.
            // If there is no next shipping leg, mark the asset as successfully
            // finally delivered

            // Finally save the updated asset
        }
        
    }
}
