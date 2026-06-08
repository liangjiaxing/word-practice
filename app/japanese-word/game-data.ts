export type ConjugationType = "passive" | "potential" | "causative" | "causativepassive";

export interface JapaneseVerbEntry {
  dictionary: string;
  meaning: string;
  romaji?: string;
  group: "godan" | "ichidan" | "irregular";
  forms: Record<ConjugationType, string>;
  exampleSentences?: Partial<Record<ConjugationType, string>>;
}

export interface JapaneseWordQuestion {
  verb: JapaneseVerbEntry;
  type: ConjugationType;
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
    exampleSentences: {
      passive: "弟は兄に野菜を食べられる。",
      potential: "私は一人でピザを食べられる。",
      causative: "母は子供に野菜を食べさせる。",
      causativepassive: "弟は母に野菜を食べさせられる。",
    },
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
    exampleSentences: {
      passive: "彼は先輩にその映画を見られる。",
      potential: "私はこのレンズで微观図を見られる。",
      causative: "母は子供に絵本を見させる。",
      causativepassive: "彼は母に毎晩ニュースを見させられる。",
    },
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
    exampleSentences: {
      passive: "子供は父に朝６時に起きられる。",
      potential: "ここでは地下鉄の音でよく起きられる。",
      causative: "母は子供を朝７時に起きさせる。",
      causativepassive: "子供は母に夏休みでも朝６時に起きさせられる。",
    },
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
    exampleSentences: {
      passive: "生徒は先生にこの単語を漢字で書かれる。",
      potential: "私は手紙を簡単に書ける。",
      causative: "先生は学生にレポートを書かせる。",
      causativepassive: "学生は担当教授に毎週課題を書かせられる。",
    },
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
    exampleSentences: {
      passive: "新入生は先輩に日本語で挨拶を話される。",
      potential: "僕は子供とすぐに仲良くなって話せる。",
      causative: "先生は学生に日本語で意見を話させる。",
      causativepassive: "学生は先生に授業中にグループの話を話させられる。",
    },
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
    exampleSentences: {
      passive: "子どもたちは先生に絵本を音読で読まれる。",
      potential: "このアプリで外国語の記事がすぐ読める。",
      causative: "母は子供に毎晩本を読ませる。",
      causativepassive: "子供は母に学校の本を読む宿題を毎日読ませられる。",
    },
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
    exampleSentences: {
      passive: "選手はコーチに今日の課題を泳がれる。",
      potential: "ここは水がきれいだから気持ちよく泳げる。",
      causative: "コーチは選手たちでプールを泳がせる。",
      causativepassive: "初心者はコーチに毎回同じ距離を泳がせられる。",
    },
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
    exampleSentences: {
      passive: "利用客は店員に順番が来るまで待たれる。",
      potential: "家で荷物が届くまで少し待てる。",
      causative: "駅で客を１０分待たせる。",
      causativepassive: "バス停で乗客は遅れたバスを１０分待たせられる。",
    },
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
    exampleSentences: {
      passive: "この絵は有名なコレクターに高値で買われる。",
      potential: "ネットで老舗の限定商品がすぐ買える。",
      causative: "母は子供を一緒に果物を買わせる。",
      causativepassive: "子供は母に毎週スナックを買わさせられる。",
    },
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
    exampleSentences: {
      passive: "お茶は来客にまず会釈をしてから飲まれる。",
      potential: "この店は menu の分量も調整して飲める。",
      causative: "医者は患者に薬を飲ませる。",
      causativepassive: "患者は医師に実験中の新薬を飲まさせられる。",
    },
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
    exampleSentences: {
      passive: "彼は支配人に面接のために営業所へ来られる。",
      potential: "地下鉄が使えるから学会会場へ簡単に来られる。",
      causative: "駅へ友達を来させる。",
      causativepassive: "教授は毎朝ゼミ生を研究室へ来させられる。",
    },
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
    exampleSentences: {
      passive: "面接は担当部長に最後に自己紹介をされる。",
      potential: "一人でいつでも銀行振込ができる。",
      causative: "先生は学生に宿題をさせる。",
      causativepassive: "学生は科目によって毎週レポートを書かさせられる。",
    },
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
    type,
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
