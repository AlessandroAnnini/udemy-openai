import React, { useEffect, useState, useRef } from 'react';
import Markdown from 'marked-react';
import '@picocss/pico';
import './Popup.css';

// function markdownToHTML(markdown: string) {
//   // Convert heading
//   markdown = markdown.replace(/^# (.*)/gm, '<h1>$1</h1>');
//   markdown = markdown.replace(/^## (.*)/gm, '<h2>$1</h2>');

//   // Convert bold text
//   markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

//   // Convert italic text
//   markdown = markdown.replace(/_(.*?)_/g, '<em>$1</em>');

//   // Convert code blocks
//   markdown = markdown.replace(/```(.*?)```/g, '<pre><code>$1</code></pre>');

//   // Convert inline code
//   markdown = markdown.replace(/`(.*?)`/g, '<code>$1</code>');

//   // Convert lists
//   markdown = markdown.replace(/^- (.*)/gm, '<li>$1</li>');

//   // remove new lines
//   return markdown.replace(/\n/g, '');
// }

const Popup: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const summaryRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // get the url of the current tab
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      function (tabs) {
        const url = tabs[0].url;
        // clean the url to get the url of the lecture
        const cleanUrl = url!.replace(
          /(https:\/\/www\.udemy\.com\/course\/.*\/learn\/lecture\/)(\d+)(.*)/,
          '$1$2'
        );

        // get the summary from chrome.storage
        chrome.storage.sync.get(cleanUrl, function (result) {
          const nextSummary = result[cleanUrl];
          nextSummary && setSummary(nextSummary);
        });
      }
    );

    chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
      setIsLoading(false);
      if (request.type === 'displaySummary') {
        setSummary(request.summary);
      } else if (request.type === 'displayError') {
        setError(request.error);
      }
    });
  }, []);

  const handleGetSummary = () => {
    setIsLoading(true);
    setSummary('');
    setError('');
    // Send a message to the content script to trigger the summary generation in background.js
    chrome.runtime.sendMessage({ type: 'generateSummary' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <div className="App">
      <header>
        {!isLoading ? (
          <button ref={buttonRef} onClick={handleGetSummary}>
            Generate Udemy Lesson Summary
          </button>
        ) : (
          <button aria-busy="true">Please wait…</button>
        )}
      </header>
      {error ? (
        <>
          <h3>Error</h3>
          <p>{error}</p>
        </>
      ) : null}
      {summary ? (
        <>
          <article ref={summaryRef}>
            <button onClick={handleCopy}>Copy</button>
            <Markdown>{summary}</Markdown>
          </article>
        </>
      ) : null}
    </div>
  );
};

export default Popup;
