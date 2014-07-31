var PageModel = (function () {
    function PageModel() {
        this.selectedLight = ko.observable();
    }
    PageModel.prototype.selectLight = function (light) {
        this.selectedLight(light);
    };
    return PageModel;
})();
//# sourceMappingURL=base.js.map
