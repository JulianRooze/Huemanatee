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
        }
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
