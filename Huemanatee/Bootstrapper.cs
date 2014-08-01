namespace Huemanatee
{
  using Huemanatee.Data;
  using Nancy;
  using Q42.HueApi;
  using System;
  using System.Linq;
  using System.Security.Cryptography;
  using System.Threading;

  public class Bootstrapper : DefaultNancyBootstrapper
  {
    protected async override void ApplicationStartup(Nancy.TinyIoc.TinyIoCContainer container, Nancy.Bootstrapper.IPipelines pipelines)
    {
      await HueHelper.Init();

      using (var ctx = new HueDataContext())
      {
        var apiKey = ctx.Settings.SingleOrDefault(s => s.Key == "HueApiKey");

        HueClient client;

        if (apiKey == null)
        {
          client = await SaveApiKey(ctx);
        }
        else
        {
          HueHelper.SetApiKey(apiKey.Value);
          client = HueHelper.GetClient();
        }

        var lights = await client.GetLightsAsync();

        var currentLights = ctx.Lights.ToList();

        foreach (var light in lights)
        {
          var existingLight = currentLights.SingleOrDefault(c => c.HueId == light.Id);

          if (existingLight == null)
          {
            existingLight = new Data.Light
            {
              HueId = light.Id,
              Name = light.Name,
            };

            ctx.Lights.Add(existingLight);
          }
        }

        ctx.SaveChanges();

      }
    }

    private static async System.Threading.Tasks.Task<HueClient> SaveApiKey(HueDataContext ctx)
    {
      HueClient client;
      var secret = GenerateApiKey();

      client = HueHelper.GetClient();

      var success = await client.RegisterAsync("Huemanatee", secret);

      if (!success)
      {
        throw new InvalidOperationException("Registering API key not successful.");
      }

      HueHelper.SetApiKey(secret);

      var setting = new Setting
      {
        Key = "HueApiKey",
        Value = secret
      };

      ctx.Settings.Add(setting);

      ctx.SaveChanges();

      client.Initialize(secret);

      return client;
    }

    private const string _chars = "0123456789";

    public static string GenerateApiKey(int length = 12)
    {
      var bytes = new byte[length];

      var random = new System.Security.Cryptography.RNGCryptoServiceProvider();

      random.GetBytes(bytes);

      var result = new char[bytes.Length];

      for (var i = 0; i < bytes.Length; i++)
      {
        result[i] = _chars[bytes[i] % _chars.Length];
      }

      return new string(result);
    }

    protected async void Bla(Nancy.TinyIoc.TinyIoCContainer container, Nancy.Bootstrapper.IPipelines pipelines)
    {
      var bridges = await new Q42.HueApi.HttpBridgeLocator().LocateBridgesAsync(TimeSpan.FromMinutes(1));

      var bridge = bridges.Single();

      var client = new HueClient(bridge, "frUwREPr3m");

      var lights = await client.GetLightsAsync();

      var sorted = lights.OrderBy(l => l.Id);

      var random = new Random();

      var duration = TimeSpan.FromSeconds(random.Next(10, 25));

      var start = DateTime.Now;

      var end = start + duration;

      var offCommand = new LightCommand();

      offCommand.On = false;
      offCommand.TransitionTime = TimeSpan.Zero;

      await client.SendCommandAsync(offCommand);

      Q42.HueApi.Light previousLight = null;

      while (DateTime.Now < end)
      {
        foreach (var light in sorted)
        {
          if (DateTime.Now >= end)
          {
            break;
          }

          if (previousLight != null)
          {
            var offCommand1 = new LightCommand();

            offCommand1.On = false;
            offCommand1.TransitionTime = TimeSpan.FromTicks(1);

            client.SendCommandAsync(offCommand1, new[] { previousLight.Id });
          }

          var command = new LightCommand();
          command.Hue = 65280;
          command.Saturation = 255;
          command.Brightness = 255;
          command.On = true;
          command.TransitionTime = TimeSpan.FromTicks(1);

          await client.SendCommandAsync(command, new[] { light.Id });

          previousLight = light;
        }
      }

      var c = new LightCommand();
      c.Hue = 25500;
      c.Saturation = 255;
      c.Brightness = 255;
      c.On = true;
      c.TransitionTime = TimeSpan.FromTicks(1);

      await client.SendCommandAsync(c, new[] { previousLight.Id });


      base.ApplicationStartup(container, pipelines);
    }
  }
}