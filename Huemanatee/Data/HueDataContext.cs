using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace Huemanatee.Data
{
  public class Light
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string HueId { get; set; }
  }

  public class HueDataContext : DbContext
  {
    public IDbSet<Light> Lights { get; set; }
  }
}