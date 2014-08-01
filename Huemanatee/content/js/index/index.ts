class IndexModel extends PageModel {

    public lights: KnockoutObservableArray<Light> = ko.observableArray([]);

    constructor() {
        super();
        this.loadLights();
    }

    private loadLights() {

        var promise = Light.loadAllLightsAsync(this);

        promise.then((lights) => {
          this.lights(lights);

          Enumerable.from(lights).forEach((item: Light, i) => {
            item.editRequested = (x) => this.selectLight(x);
            item.stateApplied = (x) => this.loadLights();
          });
        });
    }

    public toggleLights() {
        Light.toggleAllLightsAsync().then(_ => this.loadLights());
    }
}

ko.applyBindings(new IndexModel());