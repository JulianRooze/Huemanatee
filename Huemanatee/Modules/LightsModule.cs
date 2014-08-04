using Nancy;
using Q42.HueApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Nancy.ModelBinding;
using System.Threading.Tasks;
using log4net;
using Microsoft.AspNet.SignalR;
using Huemanatee.Hubs;

namespace Huemanatee.Modules
{
  public class LightsModule : NancyModule
  {
    private ILog log = LogManager.GetLogger("LightsModule");

    public LightsModule()
      : base("/lights/")
    {
      Get["/all/", true] = async (_, token) =>
      {
        var client = HueHelper.GetClient();

        var lights = await client.GetLightsAsync();

        var lightsData = from l in lights
                         let state = l.State
                         select new
                         {
                           id = l.Id,
                           name = l.Name,
                           state = new
                           {
                             brightness = state.Brightness,
                             @on = state.On,
                             saturation = state.Saturation,
                             hue = state.Hue,
                             hex = state.ToHex()
                           }
                         };

        var anyOn = lightsData.Any(l => l.state.on);

        var brightestLight = lightsData.Where(l => l.state.on).OrderByDescending(l => l.state.brightness).FirstOrDefault();

        var allLight = new[] 
        {
          new
          {
            id = "all",
            name = "All",
            state = new
            {
              brightness = brightestLight != null ? brightestLight.state.brightness : (byte)0,
              @on = anyOn,
              saturation = brightestLight != null ? brightestLight.state.saturation : 0,
              hue = brightestLight != null ? brightestLight.state.hue : 0,
              hex = brightestLight != null ? brightestLight.state.hex : "000000"
            }
          }
        };

        var data = allLight.Union(lightsData);

        return data;
      };

      Post["/all/toggle", true] = async (_, token) =>
      {
        var client = HueHelper.GetClient();

        var lights = await client.GetLightsAsync();

        var anyOn = lights.Any(l => l.State.On);

        bool turnOff = anyOn;

        var command = new LightCommand();
        command.On = !turnOff;
        await client.SendCommandAsync(command, lights.Select(l => l.Id));

        var hub = GlobalHost.ConnectionManager.GetHubContext<LightsHub>();

        hub.Clients.All.lightsChanged();

        return new
        {
          success = true
        };
      };


      Post["/{id}/state/apply/", true] = async (p, token) =>
      {
        var data = this.Bind<StateData>();

        var client = HueHelper.GetClient();

        var id = (string)p.id;

        var command = new LightCommand();

        checked
        {
          command.Hue = data.Hue;
          command.Saturation = data.Saturation;
          command.Brightness = (byte?)data.Brightness;
          command.On = data.On;

          if (data.Hex != null)
          {
            command.SetColor(data.Hex);
          }

          if (id == "all")
          {
            await client.SendCommandAsync(command);
          }
          else
          {
            await client.SendCommandAsync(command, new[] { id });
          }
        }

        var hub = GlobalHost.ConnectionManager.GetHubContext<LightsHub>();

        hub.Clients.All.lightsChanged();

        return new
        {
          success = true
        };
      };
    }

    private class StateData
    {
      public bool On { get; set; }
      public int Brightness { get; set; }
      public int Saturation { get; set; }
      public int Hue { get; set; }
      public string Hex { get; set; }
    }
  }

}