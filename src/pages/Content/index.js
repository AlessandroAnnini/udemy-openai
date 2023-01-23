window.onload = function () {
  console.log('Content script loaded');

  // Listen for a message from the background script
  chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    console.log('Message received from background script');

    if (request.type === 'getTranscript') {
      // Find the transcript button on the Udemy page and click it, the button by the attribute data-purpose="transcript-button"
      const transcriptButton = document.querySelector(
        'button[data-purpose="transcript-toggle"]'
      );
      transcriptButton.click();
      // wait for the transcript to load and then get the transcript text
      setTimeout(function () {
        const transcriptText = document.querySelector(
          '[data-purpose="transcript-panel"]'
        ).textContent;
        transcriptButton.click();

        // Send the transcript text to the background script for summary generation
        sendResponse({ type: 'getTranscript', transcript: transcriptText });
      }, 500);
    }

    return true;
  });
};
