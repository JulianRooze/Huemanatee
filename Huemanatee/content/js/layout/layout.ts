interface SignalR {
  lightsHub: any;
} 

class LightsChangedListener {
  public startHub() {

    var lightsHub = $.connection.lightsHub;

    lightsHub.client.lightsChanged = function () {

      Base.PageModel.currentPageModel().loadLights();

      setTimeout(function () {
        Base.PageModel.currentPageModel().loadLights();
      }, 3000);
    };

    $.connection.hub.start();
  }
}

$(document).ready(() => {
  
  var canvasEl = <HTMLCanvasElement>document.getElementById('canvas');

  var renderer = new Background.Renderer(canvasEl);
  var listener = new LightsChangedListener();

  listener.startHub();

  renderer.render();

  $(window).resize(ev => {
    renderer.restart();
  });

});