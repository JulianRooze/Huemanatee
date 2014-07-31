class PageModel {
    public selectedLight: KnockoutObservable<Light> = ko.observable<Light>();

    public selectLight(light: Light) {
        this.selectedLight(light);
    }
} 