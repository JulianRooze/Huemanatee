var LightState = (function () {
    function LightState(light, data) {
        var _this = this;
        this._hexChanged = false;
        this._isDirty = ko.observable(false).extend({ rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } });
        this.brightness = ko.observable(data.brightness);
        this.hue = ko.observable(data.hue);
        this.saturation = ko.observable(data.saturation);
        this.on = ko.observable(data.on);
        this.hex = ko.observable(data.hex);

        this.hex.subscribe(function (newVal) {
            _this._hexChanged = true;
        });

        var isDirtySubscribers = [this.brightness, this.hue, this.saturation, this.on, this.hex];

        Enumerable.from(isDirtySubscribers).forEach(function (el, i) {
            return el.subscribe(function (newVal) {
                return _this._isDirty(true);
            });
        });

        this._isDirty.subscribe(function (newVal) {
            if (_this._isDirty()) {
                light.applyState(_this);
                _this._isDirty(false);
            }
        });
    }
    LightState.prototype.serialize = function () {
        var data = JSON.stringify({
            on: this.on(),
            brightness: this.brightness(),
            saturation: this.saturation(),
            hue: this.hue(),
            hex: this._hexChanged ? this.hex() : null
        });

        return data;
    };
    return LightState;
})();

var Light = (function () {
    function Light(data, model) {
        this.id = data.id;
        this.name = data.name;
        this.state = new LightState(this, data.state);
        this.model = model;
    }
    Light.loadAllLightsAsync = function (model) {
        return $.get('/lights/all', null, 'json').then(function (data) {
            var lights = Enumerable.from(data).select(function (l) {
                return new Light(l, model);
            }).toArray();
            return lights;
        });
    };

    Light.toggleAllLightsAsync = function () {
        return $.post('/lights/all/toggle', null, 'json');
    };

    Light.prototype.requestEdit = function () {
        this.model.selectLight(this);
        $('#edit-light').modal('show');
    };

    Light.prototype.applyState = function (state) {
        return $.ajax('/lights/' + this.id + '/state/apply', {
            type: 'POST',
            data: state.serialize(),
            contentType: 'application/json',
            dataType: 'json'
        });
    };
    return Light;
})();
//# sourceMappingURL=light.js.map
