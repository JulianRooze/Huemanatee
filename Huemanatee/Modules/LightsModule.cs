using Nancy;
using Q42.HueApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Nancy.ModelBinding;

namespace Huemanatee.Modules
{
  public class LightsModule : NancyModule
  {
    public LightsModule()
      : base("/lights/")
    {
      Get["/all/", true] = async (_, token) =>
      {
        var client = HueHelper.GetClient();

        var lights = await client.GetLightsAsync();

        var data = (from l in lights
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
                    });

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

          await client.SendCommandAsync(command, new[] { id });
        }

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