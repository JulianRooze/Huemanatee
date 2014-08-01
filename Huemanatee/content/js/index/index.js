var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Index;
(function (Index) {
    var IndexModel = (function (_super) {
        __extends(IndexModel, _super);
        function IndexModel() {
            _super.call(this);
            this.lights = ko.observableArray([]);
            this.loadLights();
            this.lights.subscribe(function (newVal) {
                console.log('lights changed ' + newVal);
            });
        }
        IndexModel.prototype.loadLights = function () {
            var _this = this;
            var promise = Light.loadAllLightsAsync();

            var self = this;

            promise.then(function (lights) {
                self.lights(lights);

                console.log('promise.then ' + (self === _this));

                Enumerable.from(lights).forEach(function (item, i) {
                    console.log('forEach ' + (self === _this));

                    item.editRequested = function (x) {
                        return self.selectLight(x);
                    };

                    item.stateApplied = function (x) {
                        console.log('stateApplied ' + (self === _this));

                        self.loadLights();
                    };
                });
            });
        };

        IndexModel.prototype.toggleLights = function () {
            var _this = this;
            Light.toggleAllLightsAsync().then(function (_) {
                return _this.loadLights();
            });
        };
        return IndexModel;
    })(Base.PageModel);
    Index.IndexModel = IndexModel;
})(Index || (Index = {}));

ko.applyBindings(new Index.IndexModel());
//# sourceMappingURL=index.js.map
