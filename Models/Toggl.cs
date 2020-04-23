using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace toggl_timeline.Models
{
    public class TogglWorkspaces
    {
        public int id { get; set; }
        public string name { get; set; }
        public DateTime at { get; set; }
        public string logo_url { get; set; }
    }


    public class TogglDetailedReport
    {
        public int total_count { get; set; }
        public int per_page { get; set; }
        public List<Data> data { get; set; }
    }

    public class Data
    {
        public long id { get; set; }
        public string description { get; set; }
        public DateTime start { get; set; }
        public DateTime end { get; set; }
        public long dur { get; set; }
        public string user { get; set; }
        public string project { get; set; }
        public List<string> tags { get; set; }
    }
}
