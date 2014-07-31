var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var IndexModel = (function (_super) {
    __extends(IndexModel, _super);
    function IndexModel() {
        _super.call(this);
        this.lights = ko.observableArray([]);
        this.loadLights();
    }
    IndexModel.prototype.loadLights = function () {
        var _this = this;
        var promise = Light.loadAllLightsAsync(this);

        promise.then(function (lights) {
            _this.lights(lights);
        });
    };

    IndexModel.prototype.toggleLights = function () {
        var _this = this;
        Light.toggleAllLightsAsync().then(function (_) {
            return _this.loadLights();
        });
    };
    return IndexModel;
})(PageModel);

ko.applyBindings(new IndexModel());
//# sourceMappingURL=index.js.map
