export interface TestPaperItem {
  id: string;
  name: string;
  description?: string[];
  suggest?: ResultSuggest;
  userCount: number;
  questionCount: number;
  duration: number;
  isNew?: boolean;
  type: "depressed" | "anxiety" | "personality";
  source?: string;
  items?: TestItem[];
  soloChoice: boolean;
}

export interface TestItem {
  title: strings;
  answers: AnswerItem[];
}

export interface AnswerItem {
  text: string;
  score: number;
  selected?: boolean;
}

export interface ResultItem {
  id: string;
  test: TestPaperItem;
  completedDate: number;
  result: object;
  suggest?: ResultSuggest;
}

export interface ResultSuggest {
  title: string;
  suggestes: string[];
}

export interface ResultResponse {
  code: number;
  message: string;
  data: any;
}
