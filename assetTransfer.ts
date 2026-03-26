/* In the fabric samples this logic is separated into a separate file from the
type definition */

import {Context, Contract, Info, Returns, Transaction, ClientIdentity} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Asset, ShippingLeg, ShippingTolerances} from './asset';


type PartialWithRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

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
    public async AssetExists(ctx: Context, id: string|null|undefined) {
        if (id === null || id === undefined) return false;
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON.length > 0;
    }

    // Get an asset from its id
    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
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

    @Transaction()
    public async addShippingLeg(ctx: Context, assetId: string, shippingLeg: ShippingLeg): Promise<void> {
        let asset: Asset = new Asset(JSON.parse(await this.ReadAsset(ctx, assetId)));

        // TODO: check if user adding shipping leg is authorized

        asset.shippingLegs.push(shippingLeg);
        this.updateAsset(ctx, asset)

    }

    // Partial<T> is a built-in that does what it sounds - does not require all
    // fields
    @Transaction()
    public async updateAsset(ctx: Context, newAsset: PartialWithRequired<Asset, 'assetId'>): Promise<void> {
        let existing = this.ReadAsset(ctx, newAsset.assetId)
        
        // takes left and updates it with all the values present in right
        let updated = Object.assign(existing, newAsset);
        
        return ctx.stub.putState(updated.assetId, Buffer.from(stringify(sortKeysRecursive(updated))));
    }
}
