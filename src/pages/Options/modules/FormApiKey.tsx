import React, { useState, useEffect } from 'react';

export const FormApiKey: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyStored, setApiKeyStored] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('apiKey', function (result) {
      setApiKeyStored(!!result.apiKey);
    });
  }, []);

  const handleSaveApiKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    chrome.storage.sync.set({ apiKey }, function () {
      setApiKey('');
      setApiKeyStored(true);
      console.log('API key saved');
    });
  };

  const handleCleanApiKey = () => {
    chrome.storage.sync.remove('apiKey', function () {
      console.log('API key cleared');
      setApiKeyStored(false);
    });
  };

  if (apiKeyStored) {
    return (
      <>
        <h3>OpenAI API Key </h3>
        <button onClick={handleCleanApiKey}>Clean API Key</button>
      </>
    );
  }

  return (
    <>
      <h3>OpenAI API Key </h3>
      <form onSubmit={handleSaveApiKey}>
        <label htmlFor="api-key">OpenAI API Key</label>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type="password"
          id="api-key"
          name="api-key"
          placeholder="api key"
          required
        />
        <small>
          <a
            href="https://beta.openai.com/account/api-keys"
            target="_blank"
            rel="noreferrer"
          >
            Go get an API Key
          </a>
        </small>

        <button type="submit">Save</button>
      </form>
    </>
  );
};
