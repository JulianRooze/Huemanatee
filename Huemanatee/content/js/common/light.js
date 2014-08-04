var LightState = (function () {
    function LightState(light, data) {
        var _this = this;
        this._hexChanged = false;
        this._isDirty = ko.observable(false).extend({ rateLimit: { timeout: 500 } });
        this.brightness = ko.observable(data.brightness);
        this.hue = ko.observable(data.hue);
        this.saturation = ko.observable(data.saturation);
        this.on = ko.observable(data.on);
        this.hex = ko.observable(data.hex);

        this.hex.subscribe(function (newVal) {
            _this._hexChanged = true;
        });

        var isDirtySubscribers = [this.brightness, this.hue, this.saturation, this.on, this.hex];

        var timeout = null;

        Enumerable.from(isDirtySubscribers).forEach(function (el, i) {
            return el.subscribe(function (newVal) {
                /*console.log('subscriber dirty: ' + this._isDirty());
                this._isDirty(!this._isDirty());*/
                if (timeout != null) {
                    clearTimeout(timeout);
                }

                timeout = setTimeout(function () {
                    light.applyState(_this);
                }, 500);
            });
        });

        this._isDirty.subscribe(function (newVal) {
            console.log('dirty: ' + _this._isDirty());
            if (_this._isDirty()) {
                light.applyState(_this);
            }
            _this._isDirty(false);
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
    function Light(data) {
        this.stateApplied = function () {
        };
        this.editRequested = function () {
        };
        this.id = data.id;
        this.name = data.name;
        this.state = new LightState(this, data.state);
    }
    Light.loadAllLightsAsync = function () {
        return $.get('/lights/all', null, 'json').then(function (data) {
            var lights = Enumerable.from(data).select(function (l) {
                return new Light(l);
            }).toArray();
            return lights;
        });
    };

    Light.toggleAllLightsAsync = function () {
        return $.post('/lights/all/toggle', null, 'json');
    };

    Light.prototype.requestEdit = function () {
        this.editRequested(this);
        $('#edit-light').modal('show');
    };

    Light.prototype.applyState = function (state) {
        var _this = this;
        return $.ajax('/lights/' + this.id + '/state/apply', {
            type: 'POST',
            data: state.serialize(),
            contentType: 'application/json',
            dataType: 'json'
        }).then(function (data) {
            return _this.stateApplied(_this);
        });
    };
    return Light;
})();
//# sourceMappingURL=light.js.map
