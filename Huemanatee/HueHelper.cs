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

    public static async void Init()
    {
      var bridges = await new Q42.HueApi.HttpBridgeLocator().LocateBridgesAsync(TimeSpan.FromMinutes(1));

      _ip = bridges.Single();
    }

    public static HueClient GetClient()
    {
      var client = new HueClient(_ip, "frUwREPr3m");
      return client;
    }
  }
}