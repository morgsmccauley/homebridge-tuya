const BaseAccessory = require('./BaseAccessory');

class SimpleFanAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.FAN;
    }

    constructor(...props) {
        super(...props);
    }

    _registerPlatformAccessory() {
        const {Service} = this.hap;

        this.accessory.addService(Service.Fan, this.device.context.name);

        super._registerPlatformAccessory();
    }

    _registerCharacteristics(dps) {
        const {Service, Characteristic} = this.hap;
        const service = this.accessory.getService(Service.Fan);
        this._checkServiceName(service, this.device.context.name);

        this.dpActive = this._getCustomDP(this.device.context.dpActive) || '1';
        this.dpRotationSpeed = this._getCustomDP(this.device.context.dpRotationSpeed) || '3';
        this.dpSwingMode = this._getCustomDP(this.device.context.dpSwingMode) || '5';

        this.enableOscillationControl = this.device.context.enableOscillationControl || true;

        const characteristicActive = service.getCharacteristic(Characteristic.On)
            .updateValue(this._getActive(dps[this.dpActive]))
            .on('get', this.getActive.bind(this))
            .on('set', this.setActive.bind(this));

        const characteristicRotationSpeed = service.getCharacteristic(Characteristic.RotationSpeed)
            .setProps({
                minValue: 0,
                maxValue: 3,
                minStep: 1
            })
            .updateValue(this._getSpeed(dps[this.dpRotationSpeed]))
            .on('get', this.getSpeed.bind(this))
            .on('set', this.setSpeed.bind(this));

        let characteristicSwingMode;
        if (this.enableOscillationControl) {
            characteristicSwingMode = service.getCharacteristic(Characteristic.SwingMode)
                .updateValue(this._getSwingMode(dps[this.dpSwingMode]))
                .on('get', this.getSwingMode.bind(this))
                .on('set', this.setSwingMode.bind(this));
        } else {
            this._removeCharacteristic(service, Characteristic.SwingMode);
        }
    }

    getSwingMode(callback) {
        this.getState(this.dpSwingMode, (err, dp) => {
            if (err) return callback(err);

            callback(null, this._getSwingMode(dp));
        });
    }

    _getSwingMode(dp) {
        const {Characteristic} = this.hap;

        return dp ? Characteristic.SwingMode.SWING_ENABLED : Characteristic.SwingMode.SWING_DISABLED;
    }

    setSwingMode(value, callback) {
        if (!this.enableOscillationControl) return callback();

        const {Characteristic} = this.hap;

        switch (value) {
            case Characteristic.SwingMode.SWING_ENABLED:
                return this.setState(this.dpSwingMode, true, callback);

            case Characteristic.SwingMode.SWING_DISABLED:
                return this.setState(this.dpSwingMode, false, callback);
        }

        callback();
    }

    getActive(callback) {
        this.getState(this.dpActive, (err, dp) => {
            if (err) return callback(err);

            callback(null, this._getActive(dp));
        });
    }

    _getActive(dp) {
        const {Characteristic} = this.hap;

        return dp;
    }

    setActive(value, callback) {
        const {Characteristic} = this.hap;
		
        return this.setState(this.dpActive, value, callback);

        callback();
    }

// Speed
    getSpeed(callback) {
        this.getState(this.dpRotationSpeed, (err, dp) => {
            if (err) return callback(err);

            callback(null, this._getSpeed(dp));
        });
    }

    _getSpeed(dp) {
        const {Characteristic} = this.hap;
//		console.log("_getSpeed = " + dp);
        return dp;
    }

    setSpeed(value, callback) {
        const {Characteristic} = this.hap;
        if (value == 0) {
        	return this.setState(this.dpActive, false, callback);
        } else {
        	return this.setState(this.dpRotationSpeed, value, callback);
        }

        callback();
    }	

}

module.exports = SimpleFanAccessory;
