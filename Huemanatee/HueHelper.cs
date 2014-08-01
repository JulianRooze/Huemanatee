using Q42.HueApi;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace Huemanatee
{
  public class HueHelper
  {
    private static string _ip;
    private static string _apiKey;

    public static async Task<string> Init()
    {
      var task = new Q42.HueApi.HttpBridgeLocator().LocateBridgesAsync(TimeSpan.FromMinutes(1));

      var bridges = await task;

      _ip = bridges.Single();

      return _ip;
    }

    public static void SetApiKey(string key)
    {
      _apiKey = key;
    }

    public static HueClient GetClient()
    {
      if (_apiKey != null)
      {
        return new HueClient(_ip, _apiKey);
      }
      else
      {
        return new HueClient(_ip);
      }
    }
  }
}