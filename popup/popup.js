const keyInput = document.querySelector(".modal__input");
const emailContextInput = document.querySelector(
  ".modal__textarea#email-context"
);
const sampleInput = document.querySelector(".modal__textarea#sample-input");
const generateResponseBtn = document.querySelector(
  ".modal__button#generate-response-btn"
);
const responseContainer = document.querySelector(".modal__response-container");
const responseTextArea = document.querySelector(
  ".modal__textarea#response-textarea"
);

function isValidKey(key) {
  return key.length > 0;
}

function isValidEmailContext(emailContext) {
  return emailContext.length > 0;
}

function isValidSample(sample) {
  return sample.length > 0;
}

function showError(errorMessage) {
  alert(errorMessage);
}
window.addEventListener("load", async () => {
  const { access_token } = await browser.storage.local.get("access_token");
  if (access_token) {
    console.log("access token exists");
    keyInput.value = access_token;
  }
});

generateResponseBtn.addEventListener("click", async function () {
  try {
    generateResponseBtn.setAttribute("disabled", "disabled");
    // Store the API Key in browser storage
    const key = keyInput.value;
    const emailContext = emailContextInput.value;
    const sample = sampleInput.value;

    if (!isValidKey(key)) {
      throw new Error("Invalid API Key. Please enter a valid API Key.");
    }

    if (!isValidEmailContext(emailContext)) {
      throw new Error(
        "Invalid Email Context. Please enter a valid Email Context."
      );
    }

    if (!isValidSample(sample)) {
      throw new Error("Invalid Sample. Please enter a valid Sample.");
    }

    await browser.storage.local.set({ access_token: keyInput.value });
    const response = await sendToOpenAI(emailContext, sample);
    responseTextArea.innerText = response;
    responseContainer.style.display = "block";
  } catch (error) {
    showError(error.message);
  } finally {
    generateResponseBtn.removeAttribute("disabled");
  }
});

async function sendToOpenAI(emailContext, sample) {
  const { access_token } = await browser.storage.local.get("access_token");
  const data = {
    model: "text-davinci-003",
    prompt: `${emailContext}\n${sample}`,
    temperature: 0,
    max_tokens: 200,
  };
  // Send a request to the OpenAI API
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
