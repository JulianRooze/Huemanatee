var Base;
(function (Base) {
    var PageModel = (function () {
        function PageModel() {
            this.selectedLight = ko.observable();
            this.lights = ko.observableArray([]);
            PageModel.currentPageModel(this);

            this.loadLights();

            var self = this;

            setInterval(function () {
                self.loadLights();
            }, 1000 * 60);
        }
        PageModel.prototype.selectLight = function (light) {
            this.selectedLight(light);
        };

        PageModel.prototype.loadLights = function () {
            var promise = Light.loadAllLightsAsync();

            var self = this;

            promise.then(function (lights) {
                self.lights(lights);

                Enumerable.from(lights).forEach(function (item, i) {
                    item.editRequested = function (x) {
                        return self.selectLight(x);
                    };
                });
            });
        };
        PageModel.currentPageModel = ko.observable(null);
        return PageModel;
    })();
    Base.PageModel = PageModel;

    var RgbColor = (function () {
        function RgbColor(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        return RgbColor;
    })();
    Base.RgbColor = RgbColor;

    var Helpers = (function () {
        function Helpers() {
        }
        Helpers.getForegroundColorForLightState = function (state) {
            var rgb = Helpers.hexToRgb(state.hex());

            var scale = 2;

            return Helpers.rgbToHex(Math.min(rgb.r * scale, 255), Math.min(rgb.g * scale, 255), Math.min(rgb.b * scale, 255));
        };

        Helpers.getBackgroundColorForLightState = function (state) {
            return Helpers.hexToRgbaString('#' + state.hex(), 0.5);
        };

        Helpers.lightStateToRadialGradient = function (state) {
            var brightness = state.brightness();

            var step1 = brightness / 23;
            var step2 = brightness / 15;
            var step3 = brightness / 10;

            return 'radial-gradient(' + step1 + 'px at 41px 40%, rgba(255, 255, 255, 1) ' + step2 + 'px, rgba(255, 255, 255, 0)' + step3 + 'px)';
        };

        Helpers.hexToRgbaString = function (hex, opacity) {
            var rgb = Helpers.hexToRgb(hex);

            if (rgb == null) {
                //debugger;
            }

            return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
        };

        Helpers.hexToRgb = function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? new RgbColor(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
        };

        Helpers.rgbToHex = function (r, g, b) {
            return "#" + ((1 << 24) + (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b)).toString(16).slice(1);
        };
        return Helpers;
    })();
    Base.Helpers = Helpers;
})(Base || (Base = {}));
//# sourceMappingURL=base.js.map
