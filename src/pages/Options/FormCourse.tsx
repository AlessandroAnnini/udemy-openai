import React, { useState } from 'react';
import { getCourseLectures } from './getAllCaptions';

export const FormCourse = () => {
  const [courseId, setCourseId] = useState<string>('');

  const handleFullCourse = async () => {
    const { captionPoolOrder, captionPool } = await getCourseLectures(courseId);
    console.log(captionPoolOrder);
    console.log(captionPool);
  };

  return (
    <>
      <h3>Get full course in PDF</h3>
      <input value={courseId} onChange={(e) => setCourseId(e.target.value)} />
      <button onClick={handleFullCourse}>Get full course</button>
    </>
  );
};
