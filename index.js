var Service, Characteristic;
var stato = 0, start = new Date().getTime();
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
		if (channel == this.pin && value == 0) {
		var pin0 = this.pin;
		var questo = this;
			if ((new Date().getTime() - start) > 150) {
				if (stato == 0){
					stato = 1;
					this.timer = setTimeout(function () {
						stato = 0;
						gpio.read(pin0, function (err, value) {
							if (value==1){
								questo.service.setCharacteristic(Characteristic.ProgrammableSwitchEvent, 0);
							}
							else if (value==0){
								questo.service.setCharacteristic(Characteristic.ProgrammableSwitchEvent, 2);
							}
						});
					}, 500);
				}
				else if (stato == 1) {
					this.service.setCharacteristic(Characteristic.ProgrammableSwitchEvent, 1);
					stato = 0;
					clearTimeout(this.timer);
				}
				start = new Date().getTime();
			}
		}
	}.bind(this));
	gpio.setup(this.pin, gpio.DIR_IN, gpio.EDGE_FALLING);
}

Pulsante.prototype.getState = function (callback) {
	callback(null, false);
};


Pulsante.prototype.getServices = function () {
	var informationService = new Service.AccessoryInformation();
    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Manna Corporation")
        .setCharacteristic(Characteristic.Model, "GPIO Switch")
        .setCharacteristic(Characteristic.SerialNumber, "AP8N3OMCBB1C2");
	return [informationService, this.service];
};
