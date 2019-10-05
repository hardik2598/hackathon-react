import bip39 from 'bip39';
import bitcoin from 'bitcoinjs-lib';
import crypto from 'crypto';

import EventEmitter from 'events';

import Constants from './constants';

import bnet from './network';
import Database from './database';

class Wallet extends EventEmitter {

    constructor(info) {
        super();
        this.__name = info.name;
        this.__address = info.address;
        this.__wif = info.wif;
        this.__network = info.network;

        this.__password = info.password || undefined;

        this.__utxos = [];

    }

    /**
     * This will set the unspend outputs as retrieved by the network.
     * It will also parse them to retrieve the total number of coins available to the wallet
     * @param value
     */
    set utxos(value) {
        console.log("Inside set utxos");
        this.__utxos = value;
    }

    get utxos() {
        console.log("Inside get utxos"+this.__utxos);
        return this.__utxos;
    }

    /**
     * Coins are not set explicitly but through the unspent outputs
     * @returns {number|*}
     */
    get coins() {
        console.log("Inside get coins"+this.utxos);
        return this.utxos.reduce((a, c) => a + c.value, 1000000000000000) / Constants.Bitcoin.Satoshis;
    }

    get name() {
        console.log("Inside get name");
        return this.__name;
    }

    get address() {
        console.log("Inside get address "+this.__address);
        return this.__address;
    }

    get key() {
        console.log("Inside get key");
        return this.address;
    }

    get wif() {
        console.log("Inside get wif"+this.__wif);
        return this.__wif;
    }

    get network() {
        console.log("Inside get network");
        return this.__network;
    }

    /**
     * This is irreversible as there is not way to decrypt the wallet for good.
     * The only way to read the key is with the readDecrypted function
     * @param password Cleartext or hashed makes no difference
     * @returns {Wallet} It returns itself
     * @code const wallet = Wallet.create(name, mnemonic).encrypt(password);
     */
    encrypt(password) {
        console.log("Inside encrypt");
        if (this.__password) throw new Error('Cannot re-encrypt an encrypted key');
        this.__password = password;
        const cipher = crypto.createCipher(Wallet.Defaults.Encryption, password);
        this.__wif = cipher.update(this.__wif, 'utf8', 'hex') + cipher.final('hex');
        return this;
    }

    /**
     * This method will NOT decrypt the wallet but temporarily the key and return it to the calling code
     * This method is NOT symmetrical with the encrypt one.
     * @param password Hashed or not it will be used, it only needs to match the one used in encryption
     * @returns {string} It will not return the wallet itself like the encrypt
     */
    readDecrypted(password) {
        console.log("Inside read Decrypted");
        if (!this.__password) throw new Error('Cannot de-encrypt an key that was not encrypted');
        if (!password || !this.matches(password)) throw new Error('Passwords do not match');
        const cipher = crypto.createDecipher(Wallet.Defaults.Encryption, password);
        return cipher.update(this.__wif, 'hex', 'utf8') + cipher.final('utf8');
    }

    matches(password) {
        console.log("Inside matches");
        return password === this.__password;
    }


    send(btc, address, fee, password) {
        console.log("Inside send");
        const satoshis = Math.round(btc * Constants.Bitcoin.Satoshis);
        const satoshis_fee = Math.round(fee * Constants.Bitcoin.Satoshis);

        const network = bnet.current;

        const txb = new bitcoin.TransactionBuilder(network);

        let current = 0;
        for (const utx of this.utxos) {

            txb.addInput(utx.tx_hash_big_endian, utx.tx_output_n);

            current += utx.value;
            if (current >= (satoshis + satoshis_fee)) break;
        }

        txb.addOutput(address, satoshis);

        const change = current - (satoshis + satoshis_fee);
        if (change) txb.addOutput(this.address, change);


        const wif = this.__password ? this.readDecrypted(password) : this.wif;
        const key = bitcoin.ECPair.fromWIF(wif, network);

        txb.sign(0, key);

        const raw = txb.build().toHex();

        return bnet.api.broadcast(raw);
    }


    static get store() {
        // gets database
        console.log("Inside get store");
        if (!Wallet.__store) Wallet.__store = new Database(Wallet.Defaults.DBFileName);
        return Wallet.__store;
    }

    static all() {
        // creates a new wallet for every doc from database
        console.log("Inside all");
        return Wallet.store.find({ network: bnet.name }).then((docs) => {
            return docs.map(doc => new Wallet(doc));
        });
    }


    static generate() {
        console.log("Inside generate");
        return bip39.generateMnemonic();
    }


    static create(name, mnemonic) {
        console.log("Inside create");
        const seed = bip39.mnemonicToSeed(mnemonic);

        const master = bitcoin.HDNode.fromSeedBuffer(seed, bnet.current);
        const derived = master.derivePath(Wallet.Defaults.Path);
        const address = derived.getAddress();
        const wif = derived.keyPair.toWIF();

        return new Wallet({
            name: name,
            address: address,
            wif: wif,
            network: bnet.name,
        });

    }

    update() {
        console.log("Inside update");
        return bnet.api.getUnspentOutputs(this.address).then((result) => {
            this.utxos = result.utxos;
            this.emit(Wallet.Events.Updated);
            return true;
        }, (e) => {
            if (e.toString() === Constants.ReturnValues.NoFreeOutputs) {
                this.emit(Wallet.Events.Updated);
            }
        });
    }

    save() {
        console.log("Inside save");
        return Wallet.store.insert(this.toObject());
    }

    erase() {
        console.log("Inside erase");
        Wallet.store.remove({ address: this.address });
        this.emit(Wallet.Events.Updated);
    }


    toObject() {

        const obj = {
            name: this.name,
            address: this.address,
            wif: this.wif,
            network: this.network,
        };

        if (this.__password) obj.password = this.__password;

        return obj;
    }

}

Wallet.Defaults = {
    Encryption: 'aes-256-cbc',
    Path: "m/44'/0'/0'/0/0",
    DBFileName: 'wallets',
};

Wallet.Events = {
  Updated: 'updated',
};


export default Wallet;
