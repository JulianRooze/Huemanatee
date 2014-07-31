namespace Huemanatee.Modules
{
  using Huemanatee.Data;
  using Huemanatee.Models;
  using Nancy;
  using System.Linq;

  public class IndexModule : NancyModule
  {
    public IndexModule()
    {
      Get["/"] = parameters =>
      {
        using (var ctx = new HueDataContext())
        {
          var lights = ctx.Lights.ToList();
          var model = new IndexModel
          {
            Lights = lights
          };

          return View["index", model];
        }
      };
    }
  }
}