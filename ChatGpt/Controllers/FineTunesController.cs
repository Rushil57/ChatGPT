using Newtonsoft.Json;
using OpenAI_API;
using System;
using siFile = System.IO.File;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Linq;
using OpenAI_API.Completions;

namespace ChatGpt.Controllers
{
    public class FineTunesController : Controller
    {
        // GET: FineTunes

        public static string chatGptToken = WebConfigurationManager.AppSettings["chatGptToken"];
        public ActionResult Index()
        {
            return View();
        }
        public async Task<string> GetAllModels()
        {
            var api = new OpenAIAPI(chatGptToken);
            var modelList = await api.Models.GetModelsAsync();
            var modelIDList = modelList.Where(x => x.ModelID.StartsWith("curie:ft")).Select(x => x.ModelID).ToList();
            return JsonConvert.SerializeObject(new { IsValid = true, data = modelIDList });
        }
        public async Task<string> GenerateFineTunes(HttpPostedFileBase file, string model)
        {

            var fineTuneId = string.Empty;
            string fineTuneModelId = string.Empty;
            string filePath = string.Empty;

            var fileExt = Path.GetExtension(file.FileName).ToLower();
            if (fileExt != ".json")
            {
                return JsonConvert.SerializeObject(new { IsValid = false, data = "Please upload json file." });
            }
            try
            {

                filePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory)) + @"Document\FileTune" + DateTime.Now.Ticks + ".json";
                file.SaveAs(filePath);

                var api = new OpenAIAPI(chatGptToken);
                // Create a new conversation with ChatGPT
                var conversation = await api.Files.UploadFileAsync(filePath);
                var fileId = conversation.Id.ToString();

                HttpClient httpClient = new HttpClient();
                var httpReq = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/fine-tunes");

                httpReq.Headers.Add("Authorization", "Bearer " + chatGptToken);
                string content = string.Empty;
                if (!string.IsNullOrEmpty(model))
                {
                    content = "{\"training_file\":\"" + fileId + "\",\"model\":\"" + model + "\"}";
                }
                else
                {
                    content = "{\"training_file\":\"" + fileId + "\"}";
                }
                httpReq.Content = new StringContent(content, Encoding.UTF8, "application/json");
                HttpResponseMessage httpResponse = await httpClient.SendAsync(httpReq);


                if (httpResponse.IsSuccessStatusCode)
                {
                    var contentStream =
                        await httpResponse.Content.ReadAsStringAsync();
                    var ftID = JsonConvert.DeserializeObject<FineTuneId>(contentStream);
                    fineTuneId = ftID.id.ToString();
                }

                if (!string.IsNullOrEmpty(fineTuneId))
                {

                    while (string.IsNullOrEmpty(fineTuneModelId))
                    {
                        Thread.Sleep(120000);
                        var httpReq1 = new HttpRequestMessage(HttpMethod.Get, "https://api.openai.com/v1/fine-tunes/" + fineTuneId);

                        httpReq1.Headers.Add("Authorization", "Bearer " + chatGptToken);
                        HttpResponseMessage httpResponse1 = await httpClient.SendAsync(httpReq1);

                        if (httpResponse1.IsSuccessStatusCode)
                        {
                            var contentStream =
                                await httpResponse1.Content.ReadAsStringAsync();
                            var ftID = JsonConvert.DeserializeObject<FineTunedModel>(contentStream);
                            fineTuneModelId = string.IsNullOrEmpty(ftID.fine_tuned_model) ? string.Empty : ftID.fine_tuned_model;
                        }
                    }

                    if (!string.IsNullOrEmpty(model) && !string.IsNullOrEmpty(fineTuneModelId))
                    {
                        string deleteModel = await DeleteModel(model);
                    }
                }
            }
            catch (Exception e)
            {
                fineTuneModelId = "Exception occurred Message --> " + e.Message + " \n StackTrace --> " + e.StackTrace;
                //throw;
            }
            finally
            {
                if (siFile.Exists(filePath))
                {
                    siFile.Delete(filePath);
                }
            }
            return JsonConvert.SerializeObject(new { IsValid = true, data = fineTuneModelId });
        }
        private class FineTuneId
        {
            public string id { get; set; }
        }

        class FineTunedModel
        {
            public string fine_tuned_model { get; set; }
        }
        [HttpGet]
        public async Task<string> SearchOnChatGPT(string query, string model)
        {

            string OutPutResult = string.Empty;
            try
            {
                if (model.ToLower() == "---select---" || string.IsNullOrEmpty(model))
                {
                    return JsonConvert.SerializeObject(new { IsValid = false, data = "Please select model." });
                }
                else if (string.IsNullOrEmpty(query))
                {
                    return JsonConvert.SerializeObject(new { IsValid = false, data = "Please enter search string." });
                }
                var openai = new OpenAIAPI(chatGptToken);
                CompletionRequest completionRequest = new CompletionRequest();
                completionRequest.Prompt = query;
                completionRequest.Model = model;
                completionRequest.MaxTokens = 2000;
                var completions = await openai.Completions.CreateAndFormatCompletion(completionRequest);
                OutPutResult = completions;
                //foreach (var completion in completions.Completions)
                //{
                //    OutPutResult += completion.Text;
                //}
            }
            catch (Exception e)
            {
                OutPutResult = "Exception occurred Message --> " + e.Message + " \n StackTrace --> " + e.StackTrace;
            }
            return JsonConvert.SerializeObject(new { IsValid = true, data = OutPutResult });
        }

        public async Task<string> DeleteModel(string model)
        {
            string result = string.Empty;
            result = model + " is not deleted successfully.";
            bool isValid = false;
            try
            {
                if (model.ToLower() == "---select---" || string.IsNullOrEmpty(model))
                {
                    return JsonConvert.SerializeObject(new { IsValid = isValid, data = "Please select model." });
                }
                HttpClient httpClient = new HttpClient();
                var httpReq = new HttpRequestMessage(HttpMethod.Delete, "https://api.openai.com/v1/models/" + model);
                httpReq.Headers.Add("Authorization", "Bearer " + chatGptToken);
                HttpResponseMessage httpResponse = await httpClient.SendAsync(httpReq);
                if (httpResponse.IsSuccessStatusCode)
                {
                    result = model + " is deleted successfully.";
                    isValid = true;
                }
                else if (httpResponse.StatusCode == System.Net.HttpStatusCode.Forbidden)
                {
                    result = "Delete a fine-tuned model. You must have the Owner role in your organization.";
                }
            }
            catch (Exception e)
            {
                result = "Exception occurred Message --> " + e.Message + " \n StackTrace --> " + e.StackTrace;
            }
            return JsonConvert.SerializeObject(new { IsValid = isValid, data = result });
        }
    }
}