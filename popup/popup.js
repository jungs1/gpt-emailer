// Get the email context input field and sample input field
const keyInput = document.getElementById("openai-key");
const emailContextInput = document.getElementById("email-context");
const sampleInput = document.getElementById("sample-input");
// Get the generate response button
const generateResponseBtn = document.getElementById("generate-response-btn");
const responseContainer = document.getElementById("response-container");

generateResponseBtn.addEventListener("click", async function () {
  // Get the email context and sample input
  browser.storage.local.set({ access_token: keyInput.value }).then(
    function () {
      console.log("API KEY is stored in browser storage.");
    },
    function (error) {
      console.log(`Error: ${error}`);
    }
  );

  const emailContext = emailContextInput.value;
  const sample = sampleInput.value;
  // Send the email context and sample input to the OpenAI API
  try {
    generateResponseBtn.setAttribute("disabled", "disabled");
    const response = await sendToOpenAI(emailContext, sample);
    const responseTextArea = document.getElementById("response-textarea");
    responseTextArea.innerText = response;
    responseContainer.style.display = "block";
    generateResponseBtn.removeAttribute("disabled");
  } catch (error) {
    responseContainer.style.display = "none";
    generateResponseBtn.removeAttribute("disabled");
    alert(error);
  }
});

async function sendToOpenAI(emailContext, sample) {
  const data = {
    model: "text-davinci-003",
    prompt: `${emailContext}\n${sample}`,
    temperature: 0,
    max_tokens: 200,
  };
  // Send a request to the OpenAI API
  const { access_token } = await browser.storage.local.get("access_token");

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(data),
  });
  // Parse the response from the OpenAI API
  const json = await response.json();
  // Extract the generated reply from the response
  const reply = json.choices[0].text;
  return reply;
}
