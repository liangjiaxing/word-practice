export type ConjugationType = "passive" | "potential" | "causative" | "causativepassive";

export interface JapaneseVerbEntry {
  dictionary: string;
  meaning: string;
  romaji?: string;
  group: "godan" | "ichidan" | "irregular";
  forms: Record<ConjugationType, string>;
  exampleSentence?: string;
}

export interface JapaneseWordQuestion {
  verb: JapaneseVerbEntry;
  prompt: string;
  answer: string;
  choices: string[];
}

export const conjugationTypeLabels: Record<ConjugationType, string> = {
  passive: "被动形",
  potential: "可能形",
  causative: "使役形",
  causativepassive: "使役被动形",
};

export const groupHints: Record<JapaneseVerbEntry["group"], string> = {
  godan: "五段动词：根据题目要求把词尾变到对应假名行。",
  ichidan: "一段动词：通常把 る 去掉，再接目标词尾。",
  irregular: "不规则动词：需要单独记忆整组变形。",
};

export const japaneseWordDeck: JapaneseVerbEntry[] = [
  {
    dictionary: "食べる",
    meaning: "吃",
    romaji: "taberu",
    group: "ichidan",
    forms: {
      passive: "食べられる",
      potential: "食べられる",
      causative: "食べさせる",
      causativepassive: "食べさせられる",
    },
    exampleSentence: "母は子供に野菜を食べさせる。",
  },
  {
    dictionary: "見る",
    meaning: "看",
    romaji: "miru",
    group: "ichidan",
    forms: {
      passive: "見られる",
      potential: "見られる",
      causative: "見させる",
      causativepassive: "見させられる",
    },
    exampleSentence: "母は子供に映画を見させる。",
  },
  {
    dictionary: "起きる",
    meaning: "起床",
    romaji: "okiru",
    group: "ichidan",
    forms: {
      passive: "起きられる",
      potential: "起きられる",
      causative: "起きさせる",
      causativepassive: "起きさせられる",
    },
    exampleSentence: "母は子供を朝７時に起きさせる。",
  },
  {
    dictionary: "書く",
    meaning: "写",
    romaji: "kaku",
    group: "godan",
    forms: {
      passive: "書かれる",
      potential: "書ける",
      causative: "書かせる",
      causativepassive: "書かせられる",
    },
    exampleSentence: "先生は生徒にレポートを書かせる。",
  },
  {
    dictionary: "話す",
    meaning: "说",
    romaji: "hanasu",
    group: "godan",
    forms: {
      passive: "話される",
      potential: "話せる",
      causative: "話させる",
      causativepassive: "話させられる",
    },
    exampleSentence: "先生は学生に日本語で話させる。",
  },
  {
    dictionary: "読む",
    meaning: "读",
    romaji: "yomu",
    group: "godan",
    forms: {
      passive: "読まれる",
      potential: "読める",
      causative: "読ませる",
      causativepassive: "読ませられる",
    },
    exampleSentence: "父は息子に本を毎晩読ませる。",
  },
  {
    dictionary: "泳ぐ",
    meaning: "游泳",
    romaji: "oyogu",
    group: "godan",
    forms: {
      passive: "泳がれる",
      potential: "泳げる",
      causative: "泳がせる",
      causativepassive: "泳がせられる",
    },
    exampleSentence: "コーチは選手たちでプールを泳がせる。",
  },
  {
    dictionary: "待つ",
    meaning: "等",
    romaji: "matsu",
    group: "godan",
    forms: {
      passive: "待たれる",
      potential: "待てる",
      causative: "待たせる",
      causativepassive: "待たせられる",
    },
    exampleSentence: "駅で客を１０分待たせる。",
  },
  {
    dictionary: "買う",
    meaning: "买",
    romaji: "kau",
    group: "godan",
    forms: {
      passive: "買われる",
      potential: "買える",
      causative: "買わせる",
      causativepassive: "買わせられる",
    },
    exampleSentence: "母は子供を一緒に果物を買わせる。",
  },
  {
    dictionary: "飲む",
    meaning: "喝",
    romaji: "nomu",
    group: "godan",
    forms: {
      passive: "飲まれる",
      potential: "飲める",
      causative: "飲ませる",
      causativepassive: "飲ませられる",
    },
    exampleSentence: "医者は患者に薬を飲ませる。",
  },
  {
    dictionary: "来る",
    meaning: "来",
    romaji: "kuru",
    group: "irregular",
    forms: {
      passive: "来られる",
      potential: "来られる",
      causative: "来させる",
      causativepassive: "来させられる",
    },
    exampleSentence: "駅へ友達を来させる。",
  },
  {
    dictionary: "する",
    meaning: "做",
    romaji: "suru",
    group: "irregular",
    forms: {
      passive: "される",
      potential: "できる",
      causative: "させる",
      causativepassive: "させられる",
    },
    exampleSentence: "先生は学生に宿題をさせる。",
  },
];

const availableTypes = ["passive", "potential", "causative", "causativepassive"] as const;
const availableLabels = availableTypes.map((type) => conjugationTypeLabels[type]);

export function getAvailableConjugationTypes(): ConjugationType[] {
  return [...availableTypes];
}

export function buildQuestion(
  random: () => number = Math.random
): JapaneseWordQuestion {
  const verb = japaneseWordDeck[Math.floor(random() * japaneseWordDeck.length)] ?? japaneseWordDeck[0];
  const type = availableTypes[Math.floor(random() * availableTypes.length)] ?? availableTypes[0];
  const form = verb.forms[type];
  const answer = conjugationTypeLabels[type];

  const choices = shuffle([...availableLabels], random).slice(0, 4);

  return {
    verb,
    prompt: `この形「${form}」は何形ですか？`,
    answer,
    choices,
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const raw = random();
    const normalized = Number.isFinite(raw) ? raw : 0;
    const j = Math.max(0, Math.min(i, Math.floor(normalized * (i + 1))));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
