﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using toggl_timeline.Models;
using System.Net;

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

        [HttpGet("GetWorkspaces")]
        public async Task<ActionResult<List<TogglWorkspaces>>> GetWorkspaces(string apiKey)
        {
            var url = "/api/v8/workspaces";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{apiKey}:{"api_token"}")));
            var client = clientFactory.CreateClient("toggl");
            var response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<List<TogglWorkspaces>>(content);
            }
            else
            {
                throw new HttpRequestException(response.ReasonPhrase);
            }
        }

        [HttpGet("GetDetailedReport")]
        public async Task<ActionResult<TogglDetailedReport>> GetDetailedReport(string apiKey, int workspace)
        {
            var url = "/reports/api/v2/details";
            url += $"?workspace_id={workspace}";
            url += $"&since={DateTime.UtcNow.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture)}";
            url += "&user_agent=api_test&order_field=date&order_desc=off";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{apiKey}:{"api_token"}")));
            var client = clientFactory.CreateClient("toggl");
            var response = await client.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<TogglDetailedReport>(content);
            }
            else
            {
                throw new Exception();
            }
        }
    }
}