module Base {

  export class PageModel {
    public selectedLight: KnockoutObservable<Light> = ko.observable<Light>();
    public lights: KnockoutObservableArray<Light> = ko.observableArray([]);

    public static currentPageModel: KnockoutObservable<PageModel> = ko.observable(null);

    constructor() {
      PageModel.currentPageModel(this);

      this.loadLights();
    }

    public selectLight(light: Light) {
      this.selectedLight(light);
    }

    public loadLights() {

      var promise = Light.loadAllLightsAsync();

      var self = this;

      promise.then((lights) => {
        self.lights(lights);

        Enumerable.from(lights).forEach((item: Light, i) => {
          item.editRequested = (x) => self.selectLight(x);
        });
      });
    }

  }

  export class RgbColor {
    constructor(public r: number, public g: number, public b: number) { }
  }


  export class Helpers {

    public static getForegroundColorForLightState(state: LightState): string {

      var rgb = Helpers.hexToRgb(state.hex());

      var scale = 2;

      return Helpers.rgbToHex(Math.min(rgb.r * scale, 255), Math.min(rgb.g * scale, 255), Math.min(rgb.b * scale, 255));
    }

    public static getBackgroundColorForLightState(state: LightState): string {
      return Helpers.hexToRgbaString('#' + state.hex(), 0.5);
    }

    public static lightStateToRadialGradient(state: LightState): string {

      var brightness = state.brightness();

      var step1 = brightness / 23;
      var step2 = brightness / 15;
      var step3 = brightness / 10

      return 'radial-gradient(' + step1 + 'px at 41px 40%, rgba(255, 255, 255, 1) ' + step2 + 'px, rgba(255, 255, 255, 0)' + step3 + 'px)';
    }

    public static hexToRgbaString(hex: string, opacity: number): string {
      var rgb = Helpers.hexToRgb(hex);

      if (rgb == null) {
        //debugger;
      }

      return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
    }

    public static hexToRgb(hex: string): RgbColor {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? new RgbColor(
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)) : null;
    }

    public static rgbToHex(r, g, b): string {
      return "#" + ((1 << 24) + (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b)).toString(16).slice(1);
    }
  }
}