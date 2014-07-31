class LightState {

    public brightness: KnockoutObservable<number>;
    public hue: KnockoutObservable<number>;
    public saturation: KnockoutObservable<number>;
    public on: KnockoutObservable<boolean>;
    public hex: KnockoutObservable<string>;

    private _hexChanged: boolean = false;

    private _isDirty: KnockoutObservable<boolean> = ko.observable(false).extend({ rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } });

    public serialize(): string {

        var data = JSON.stringify({
            on: this.on(),
            brightness: this.brightness(),
            saturation: this.saturation(),
            hue: this.hue(),
            hex: this._hexChanged ? this.hex() : null
        });

        return data;
    }

    constructor(light: Light, data: any) {
        this.brightness = ko.observable<number>(data.brightness);
        this.hue = ko.observable<number>(data.hue);
        this.saturation = ko.observable<number>(data.saturation);
        this.on = ko.observable<boolean>(data.on);
        this.hex = ko.observable<string>(data.hex);

        this.hex.subscribe(newVal => {
            this._hexChanged = true;
        });

        var isDirtySubscribers = [this.brightness, this.hue, this.saturation, this.on, this.hex];

        Enumerable.from(isDirtySubscribers).forEach((el: any, i) => el.subscribe(newVal => this._isDirty(true)));

        this._isDirty.subscribe(newVal => {
            if (this._isDirty()) {
                light.applyState(this);
                this._isDirty(false);
            }
        });
    }
}

class Light {
    public state: LightState;
    public id: string;
    public name: string;
    private model: PageModel;

    public stateApplied: (a : any) : void;

    constructor(data: any, model: PageModel) {
        this.id = data.id;
        this.name = data.name;
        this.state = new LightState(this, data.state);
        this.model = model;
    }

    public static loadAllLightsAsync(model: PageModel): JQueryPromise<Light[]> {
        var x = (a: any) => {
        }

        return $.get('/lights/all', null, 'json').then(data => {
            var lights = Enumerable.from(<any[]>data).select(l => new Light(l, model)).toArray();
            return lights;
        });
    }

    public static toggleAllLightsAsync(): JQueryPromise<any> {
        return $.post('/lights/all/toggle', null, 'json');
    }

    public requestEdit() {
        this.model.selectLight(this);
        (<any>$('#edit-light')).modal('show');
    }

    public applyState(state: LightState): JQueryPromise<any> {

        return $.ajax('/lights/' + this.id + '/state/apply', {
            type: 'POST',
            data: state.serialize(),
            contentType: 'application/json',
            dataType: 'json'
        }).then(data => {
            this.model.
        });
    }
}