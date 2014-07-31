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
        });
    }

    public toggleLights() {
        Light.toggleAllLightsAsync().then(_ => this.loadLights());
    }
}

ko.applyBindings(new IndexModel());