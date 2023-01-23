import React, { useState, useEffect } from 'react';

interface Courses {
  [key: string]: {
    url: string;
    text: string;
  }[];
}

export const StoredCourses: React.FC = () => {
  const [courses, setCourses] = useState<Courses>();

  const getCourseData = async () => {
    // get all the data in chrome.storage
    const storage = await chrome.storage.sync.get(null);

    // result is an object, remove the apiKey property
    delete storage.apiKey;

    // if no result then stop
    if (!Object.keys(storage).length) {
      return undefined;
    }

    // get the course name from the url and create an object with the course name as the key and the urls as the value
    const nextCourses: Courses = Object.entries(storage).reduce(
      (acc, [url, text]) => {
        const courseName = url.replace(
          /(https:\/\/www\.udemy\.com\/course\/)(.*)(\/learn\/lecture\/)(\d+)/,
          '$2'
        );

        const lessonObj = { url, text };

        if (acc[courseName]) {
          acc[courseName].push(lessonObj);
        } else {
          acc[courseName] = [lessonObj];
        }

        return acc;
      },
      {} as Courses
    );

    return nextCourses;
  };

  useEffect(() => {
    const getData = async () => {
      const nextCourses = await getCourseData();
      setCourses(nextCourses);
    };

    getData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = (url: string) => {
    chrome.storage.sync.remove(url, async function () {
      console.log('Summarized page deleted');
      const nextCourses = await getCourseData();
      setCourses(nextCourses);
    });
  };

  const handleDeleteAll = () => {
    // clear all the summarized pages from chrome.storage except the API key
    chrome.storage.sync.get(null, function (result) {
      delete result.apiKey;
      chrome.storage.sync.remove(Object.keys(result), async function () {
        console.log('All summarized pages cleared');
        const nextCourses = await getCourseData();
        setCourses(nextCourses);
      });
    });
  };

  if (!courses) return null;

  return (
    <>
      <h3>Summarized Pages</h3>

      {Object.entries(courses).map(([courseName, lessons]) => (
        <details key={courseName}>
          <summary>{courseName}</summary>
          <ul>
            {lessons.map((lesson: any) => (
              <li key={lesson.url}>
                <a href={lesson.url}>{lesson.url}</a>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <button
                    className="contrast button-small"
                    onClick={() => handleCopy(lesson.text)}
                  >
                    Copy
                  </button>
                  <button
                    className="secondary outline button-small"
                    onClick={() => handleDelete(lesson.url)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </details>
      ))}
      <button className="outline" onClick={handleDeleteAll}>
        Delete all summaries
      </button>
    </>
  );
};
