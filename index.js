var Service, Characteristic;

var state = false;
var gpio = require('rpi-gpio');


module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-gpio-switch", "SPSwitch", Pulsante);
};

function Pulsante(log, config) {
    //config
    this.name = config["name"];
    this.pin = config["pin"];
    if (this.name == undefined || this.pin == undefined) {
        throw "Specify name and pin in config file.";
    }

    //setup
    this.log = log;
    this.service = new Service.StatelessProgrammableSwitch(this.name);
    this.service
        .getCharacteristic(Characteristic.ProgrammableSwitchEvent)
        .on('get', this.getState.bind(this));

    gpio.on('change', function (channel, value) {
        if (channel == this.pin) {
            this.service.setCharacteristic(Characteristic.ProgrammableSwitchEvent, value);
        }
    }.bind(this));
    gpio.setup(this.pin, gpio.DIR_IN, gpio.EDGE_BOTH, function () {
        gpio.read(this.pin, function (err, value) {
            state = value
        });
    }.bind(this));
}

Pulsante.prototype.getState = function (callback) {
    callback(null, state);

};


Pulsante.prototype.getServices = function () {
    return [this.service];
};
