module Index {

  export class IndexModel extends Base.PageModel {

    constructor() {
      super();
    }

    public toggleLights() {
      Light.toggleAllLightsAsync().then(_ => this.loadLights());
    }
  }
}

ko.applyBindings(new Index.IndexModel());