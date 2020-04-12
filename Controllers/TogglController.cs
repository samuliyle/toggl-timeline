using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using toggl_timeline.Models;

namespace toggl_timeline.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TogglController : ControllerBase
    {
        private readonly IHttpClientFactory clientFactory;
        private readonly Key ApiKeys;

        public TogglController(IHttpClientFactory clientFactory, IOptions<Key> apiKeys)
        {
            this.clientFactory = clientFactory;
            ApiKeys = apiKeys.Value;
        }

        [HttpGet("GetDetailedReport")]
        public async Task<ActionResult<ToggleDetailedReport>> GetDetailedReport()
        {
            var url = "details";
            url += $"?workspace_id={ApiKeys.WorkSpaceId}";
            url += $"&since={DateTime.UtcNow.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture)}";
            url += "&user_agent=api_test";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            var client = clientFactory.CreateClient("toggl");
            var response = await client.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<ToggleDetailedReport>(content);
            } else
            {
                throw new Exception();
            }
        }
    }
}