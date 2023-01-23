import React from 'react';
import { FormCourse } from './FormCourse';
import { FormApiKey } from './FormApiKey';
import { StoredCourses } from './StoredCourses';
import '@picocss/pico';
import './Options.css';

const Options: React.FC = () => (
  <main className="container">
    <h1>Udemy Summary with OpenAI Options</h1>
    <FormApiKey />
    <StoredCourses />
    <FormCourse />
  </main>
);

export default Options;
