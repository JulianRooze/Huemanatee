module Base {

    export class PageModel {
        public selectedLight: KnockoutObservable<Light> = ko.observable<Light>();

        public selectLight(light: Light) {
            this.selectedLight(light);
        }
    }

    export class RgbColor {
        constructor(public r: number, public g: number, public b: number) { }
    }


    export class Helpers {

        public static getBackgroundColorForLightState(state: LightState): string {
            return Helpers.hexToRgbaString('#' + state.hex(), 0.4);
        }

        public static lightStateToRadialGradient(state: LightState): string {

            var brightness = state.brightness();

            var step1 = 35;
            var step2 = 50;
            var step3 = 120;

            step1 = brightness / 8;
            step2 = brightness / 5;
            step3 = brightness / 2;

            return 'radial-gradient(' + step1 + 'px at 30px 40%, rgba(255, 255, 255, 1) ' + step2 + 'px, rgba(255, 255, 255, 0)' + step3 + 'px)';
        }

        public static hexToRgbaString(hex: string, opacity: number): string {
            var rgb = Helpers.hexToRgb(hex);

            if (rgb == null) {
                debugger;
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
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
    }
}