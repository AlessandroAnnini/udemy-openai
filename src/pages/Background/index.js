// Listen for a message from the content script
chrome.runtime.onMessage.addListener(async function (request, _, sendResponse) {
  // If the message is a request to generate a summary
  if (request.type === 'generateSummary') {
    // Get the API key from the extension's storage
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    // if the API key is not set, open the options page of the chrome extension
    if (!apiKey) {
      chrome.runtime.openOptionsPage();
      return;
    }

    // send a message to content.js to get the transcript
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'getTranscript',
    });

    // do something with response here, not outside the function
    const { summary, error } = await generateSummary(
      response.transcript,
      apiKey
    );

    if (error) {
      chrome.runtime.sendMessage({ type: 'displayError', error });
      return;
    }

    // memoize the summary for this url
    const url = tab.url;
    const cleanUrl = url.replace(
      /(https:\/\/www\.udemy\.com\/course\/.*\/learn\/lecture\/)(\d+)(.*)/,
      '$1$2'
    );
    chrome.storage.sync.set({ [cleanUrl]: summary }, function () {
      console.log('Summary saved');
    });

    // Send the summary to the content script
    chrome.runtime.sendMessage({ type: 'displaySummary', summary });
  }

  return true;
});

const buildPrompt = (
  summaryWords,
  transcript
) => `Summarize concepts, knowledge, advices and ideas from the Video Transcript text with a Summary text of at least ${summaryWords} words and Take aways bullet points. Your response will be in markdown with the following format:

Format:
'''
# <summary title>

## Summary
<summary text>

## Take aways
<bullet points>
'''

Video Transcript:
'''
${transcript}
'''

Summary:
`;

// Function to generate a summary using the OpenAI API
async function generateSummary(transcript, apiKey) {
  const words = transcript.split(' ').length;
  const maxSummaryLength = Math.max(Math.round(words * 0.5), 300);
  const prompt = buildPrompt(maxSummaryLength, transcript);

  console.log('Prompt: ', prompt);

  // Send the transcript to the OpenAI API and get the summary
  const response = await fetch('https://api.openai.com/v1/completions ', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      prompt,
      temperature: 0.7,
      n: 1,
      max_tokens: maxSummaryLength,
    }),
  }).catch((err) => {
    console.log('Error: ', err);
  });

  const summary = await response.json();

  if (summary.error) {
    console.log('Error: ', summary.error.message);
    return { error: 'text too long' };
  }

  console.log('Summary: ', summary);

  // Return the summary
  return { summary: summary.choices[0].text };
}
