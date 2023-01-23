/*
// course data
original -> https://www.udemy.com/api-2.0/courses/1120038/subscriber-curriculum-items/?page_size=200&fields[lecture]=title,object_index,is_published,sort_order,created,asset,supplementary_assets,is_free&fields[quiz]=title,object_index,is_published,sort_order,type&fields[practice]=title,object_index,is_published,sort_order&fields[chapter]=title,object_index,is_published,sort_order&fields[asset]=title,filename,asset_type,status,time_estimation,is_external&caching_intent=True
filtered -> https://www.udemy.com/api-2.0/courses/1120038/subscriber-curriculum-items/?page_size=200&fields[lecture]=title,asset&fields[quiz]=id&fields[practice]=id&fields[chapter]=id&fields[asset]=title,asset_type

data.results[].id

// lesson data
original -> https://www.udemy.com/api-2.0/users/me/subscribed-courses/1120038/lectures/6726030/?fields[lecture]=asset,description,download_url,is_free,last_watched_second&fields[asset]=asset_type,length,media_license_token,course_is_drmed,media_sources,captions,thumbnail_sprite,slides,slide_urls,download_urls,external_url
filtered -> https://www.udemy.com/api-2.0/users/me/subscribed-courses/1120038/lectures/6726030/?fields[lecture]=title,title_cleaned,asset,description&fields[asset]=captions&fields[caption]=id,url,locale_id

data.asset.captions[].locale_id = 'en_US'

url:
https://vtt-c.udemycdn.com/39073572/en_US/2022-01-28_04-53-43-ac5dd6d99fb623c33c5e048bd5044126.vtt?Expires=1674237374&Signature=enHOD4FzLzq38D8I8gpG1HipQUTYR2Aaq5Ojc4x2FcRWmviqgP~mc1gfU~O956ZnG-ZUTvSNLsjAOAv5BhzcxEdVlLXRR287muIiK-e-0t9mUDpKD8-1INI1pYsl16ZcrI~h6glTNOVtTH5U9vTERKdGCqLmAz0oQRtG6M0zNFJX-Jf90ho-M1KWYLVslJwTTBY-eGwdK4gt-aEuhjT7TYbIrOvc9ZC9TCB1K6M5s8fkls5E80NzTG3JFbHFc1H2QB5fGe~EIS9ekintrOX8~HjSi1SeDaockXnDYQ71rw-l3D~snPbax64NCg5~TsyDcpigNsb-fItuVaE9RIKhXw__&Key-Pair-Id=APKAITJV77WS5ZT7262A
*/

// const courseId = 1120038

import axios from 'axios';

const makeCourseUrl = (courseId: string): string =>
  `https://www.udemy.com/api-2.0/courses/${courseId}/subscriber-curriculum-items/?page_size=200&fields[lecture]=title,asset&fields[quiz]=id&fields[practice]=id&fields[chapter]=id&fields[asset]=title,asset_type`;
const makeLectureUrl = (courseId: string, lectureId: string): string =>
  `https://www.udemy.com/api-2.0/users/me/subscribed-courses/${courseId}/lectures/${lectureId}/?fields[lecture]=title,title_cleaned,asset,description&fields[asset]=captions&fields[caption]=id,url,locale_id`;

const captionPoolOrder: any[] = [];
const captionPool = {};

export const getCourseLectures = async (courseId: string) => {
  debugger;
  const courseUrl = makeCourseUrl(courseId);
  const { data: course } = await axios.get(courseUrl);

  const lecturesIds = course.results
    .filter((lecture: any) => lecture.asset.asset_type === 'Video')
    .map((lecture: any) => lecture.id);

  for (let lectureId in lecturesIds) {
    const lectureUrl = makeLectureUrl(courseId, lectureId);
    const { data: lecture } = await axios.get(lectureUrl);

    for (let caption in lecture.asset.captions) {
      if (caption.locale_id === 'en_US') {
        const videoCaption = fetch(caption.url);
        captionPoolOrder.push(caption.id);
        captionPool[caption.id] = videoCaption;
      }
    }
  }

  return { captionPoolOrder, captionPool };
};
