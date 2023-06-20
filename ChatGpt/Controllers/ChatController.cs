using Newtonsoft.Json;
using OpenAI_API;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Mvc;

namespace ChatGpt.Controllers
{
    public class ChatController : Controller
    {
        public static string chatGptToken = WebConfigurationManager.AppSettings["chatGptToken"];
        // GET: Chat
        public ActionResult Index()
        {
            return View();
        }

        public async Task<string> GetAllModels()
        {
            var api = new OpenAIAPI(chatGptToken);
            var modelList = await api.Models.GetModelsAsync();
            var modelIDList = modelList.Where(x => x.ModelID.StartsWith("gpt")).Select(x => x.ModelID).ToList();
            return JsonConvert.SerializeObject(new { IsValid = true, data = modelIDList });
        }
        [HttpPost]
        public async Task<string> SearchOnChatGPT(string query, string model,string instructions)
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

                var api = new OpenAIAPI(chatGptToken);
                // Create a new conversation with ChatGPT
                var conversation = api.Chat.CreateConversation();
                conversation.Model = model;
                // Append user input and get response from ChatGPT
                conversation.AppendUserInput(instructions + query);
                var response = await conversation.GetResponseFromChatbotAsync();
                OutPutResult = response.ToString();
            }
            catch (Exception e)
            {
                OutPutResult = "Exception occurred Message --> " + e.Message;
            }
            return JsonConvert.SerializeObject(new { IsValid = true, data = OutPutResult });
        }


    }
}