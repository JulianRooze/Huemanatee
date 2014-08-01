module Index {

    export class IndexModel extends Base.PageModel {

        public lights: KnockoutObservableArray<Light> = ko.observableArray([]);

        constructor() {
            super();
            this.loadLights();
            this.lights.subscribe(newVal => {
                console.log('lights changed ' + newVal);
            });
        }

        private loadLights() {

            var promise = Light.loadAllLightsAsync();

            var self = this;
            
            promise.then((lights) => {
                self.lights(lights);

                console.log('promise.then ' + (self === this));

                Enumerable.from(lights).forEach((item: Light, i) => {

                    console.log('forEach ' + (self === this));

                    item.editRequested = (x) => self.selectLight(x);

                    item.stateApplied = (x) => {
                        console.log('stateApplied ' + (self === this));

                        self.loadLights();
                    };
                });
            });
        }

        public toggleLights() {
            Light.toggleAllLightsAsync().then(_ => this.loadLights());
        }
    }
}

ko.applyBindings(new Index.IndexModel());