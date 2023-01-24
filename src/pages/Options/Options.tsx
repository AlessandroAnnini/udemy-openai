import React from 'react';
// import { FormCourse } from './modules/FormCourse';
import { FormApiKey } from './modules/FormApiKey';
import { StoredCourses } from './modules/StoredCourses';
import '@picocss/pico';
import './Options.css';

const Options: React.FC = () => (
  <main className="container">
    <h1>Udemy Summary with OpenAI Options</h1>
    <FormApiKey />
    <StoredCourses />
    {/* <FormCourse /> */}
  </main>
);

export default Options;
