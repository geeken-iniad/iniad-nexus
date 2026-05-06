// アプリで扱う授業データの型
export type Course = {
  id: string;
  title: string;       
  day: number;         // 曜日 (1=月, 2=火, ..., 6=土)
  period: number;      // 時限 (1~8)
  room?: string;       // 教室 (JSONには含まれていないため今回は空)
};

const STORAGE_KEY = 'iniad_nexus_timetable';

export const PERIODS = [
  { id: 1, start: "09:00", end: "10:30" },
  { id: 2, start: "10:40", end: "12:10" },
  { id: 3, start: "13:00", end: "14:30" },
  { id: 4, start: "14:45", end: "16:15" },
  { id: 5, start: "16:30", end: "18:00" },
  { id: 6, start: "18:15", end: "19:45" },
];

export function saveScheduleToStorage(json: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  }
}

// JSONデータを扱いやすい配列データに変換する関数
export function getScheduleData(): Course[] {
  let rawData: Record<string, string[]> = {};

  // ブラウザ環境ならLocal Storageから読み込む
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        rawData = JSON.parse(stored);
      } catch (e) {
        console.error("時間割データの読み込みに失敗しました", e);
      }
    }
  }

  // データがない場合は空配列を返す（またはデフォルトデータを返す）
  if (Object.keys(rawData).length === 0) {
    return [];
  }

  const courses: Course[] = [];
  
  Object.entries(rawData).forEach(([periodKey, dayArray]) => {
    const period = parseInt(periodKey, 10);
    if (isNaN(period)) return;

    dayArray.forEach((rawTitle, index) => {
      if (!rawTitle) return;
      
      // "科目名/英語名..." を短縮
      const cleanTitle = rawTitle.split('/')[0];

      courses.push({
        id: `${index}-${period}`,
        title: cleanTitle,
        day: index + 1, // 月=1
        period: period,
      });
    });
  });

  return courses;
}

// 次の授業を取得する関数
export function getNextClass(): Course | null {
  const courses = getScheduleData();
  const now = new Date();
  const currentDay = now.getDay(); 
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const todaysCourses = courses
    .filter(c => c.day === currentDay)
    .sort((a, b) => a.period - b.period);

  for (const course of todaysCourses) {
    const periodData = PERIODS.find(p => p.id === course.period);
    if (!periodData) continue; 
    
    if (currentMinutes < toMinutes(periodData.end)) {
      return course;
    }
  }

  return null;
}