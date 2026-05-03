export type ConjugationType =
  | "nai"
  | "te"
  | "ta"
  | "potential"
  | "imperative"
  | "volitional";

export interface JapaneseVerbEntry {
  dictionary: string;
  meaning: string;
  group: "godan" | "ichidan" | "irregular";
  forms: Record<ConjugationType, string>;
}

export interface JapaneseWordQuestion {
  verb: JapaneseVerbEntry;
  type: ConjugationType;
  prompt: string;
  answer: string;
  choices: string[];
}

export const conjugationTypeLabels: Record<ConjugationType, string> = {
  nai: "ない形",
  te: "て形",
  ta: "た形",
  potential: "可能形",
  imperative: "命令形",
  volitional: "意向形",
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
    group: "ichidan",
    forms: {
      nai: "食べない",
      te: "食べて",
      ta: "食べた",
      potential: "食べられる",
      imperative: "食べろ",
      volitional: "食べよう",
    },
  },
  {
    dictionary: "見る",
    meaning: "看",
    group: "ichidan",
    forms: {
      nai: "見ない",
      te: "見て",
      ta: "見た",
      potential: "見られる",
      imperative: "見ろ",
      volitional: "見よう",
    },
  },
  {
    dictionary: "起きる",
    meaning: "起床",
    group: "ichidan",
    forms: {
      nai: "起きない",
      te: "起きて",
      ta: "起きた",
      potential: "起きられる",
      imperative: "起きろ",
      volitional: "起きよう",
    },
  },
  {
    dictionary: "書く",
    meaning: "写",
    group: "godan",
    forms: {
      nai: "書かない",
      te: "書いて",
      ta: "書いた",
      potential: "書ける",
      imperative: "書け",
      volitional: "書こう",
    },
  },
  {
    dictionary: "話す",
    meaning: "说",
    group: "godan",
    forms: {
      nai: "話さない",
      te: "話して",
      ta: "話した",
      potential: "話せる",
      imperative: "話せ",
      volitional: "話そう",
    },
  },
  {
    dictionary: "読む",
    meaning: "读",
    group: "godan",
    forms: {
      nai: "読まない",
      te: "読んで",
      ta: "読んだ",
      potential: "読める",
      imperative: "読め",
      volitional: "読もう",
    },
  },
  {
    dictionary: "泳ぐ",
    meaning: "游泳",
    group: "godan",
    forms: {
      nai: "泳がない",
      te: "泳いで",
      ta: "泳いだ",
      potential: "泳げる",
      imperative: "泳げ",
      volitional: "泳ごう",
    },
  },
  {
    dictionary: "待つ",
    meaning: "等",
    group: "godan",
    forms: {
      nai: "待たない",
      te: "待って",
      ta: "待った",
      potential: "待てる",
      imperative: "待て",
      volitional: "待とう",
    },
  },
  {
    dictionary: "買う",
    meaning: "买",
    group: "godan",
    forms: {
      nai: "買わない",
      te: "買って",
      ta: "買った",
      potential: "買える",
      imperative: "買え",
      volitional: "買おう",
    },
  },
  {
    dictionary: "飲む",
    meaning: "喝",
    group: "godan",
    forms: {
      nai: "飲まない",
      te: "飲んで",
      ta: "飲んだ",
      potential: "飲める",
      imperative: "飲め",
      volitional: "飲もう",
    },
  },
  {
    dictionary: "来る",
    meaning: "来",
    group: "irregular",
    forms: {
      nai: "来ない",
      te: "来て",
      ta: "来た",
      potential: "来られる",
      imperative: "来い",
      volitional: "来よう",
    },
  },
  {
    dictionary: "する",
    meaning: "做",
    group: "irregular",
    forms: {
      nai: "しない",
      te: "して",
      ta: "した",
      potential: "できる",
      imperative: "しろ",
      volitional: "しよう",
    },
  },
];

export function getAvailableConjugationTypes(): ConjugationType[] {
  return ["nai", "te", "ta", "potential", "imperative", "volitional"];
}

export function buildQuestion(
  deck: JapaneseVerbEntry[],
  type: ConjugationType,
  random: () => number = Math.random
): JapaneseWordQuestion {
  const verb = deck[Math.floor(random() * deck.length)] ?? deck[0];
  const answer = verb.forms[type];
  const distractorPool = deck
    .filter((entry) => entry.dictionary !== verb.dictionary)
    .map((entry) => entry.forms[type])
    .filter((form, index, forms) => form !== answer && forms.indexOf(form) === index);

  const distractors: string[] = [];
  while (distractors.length < 3 && distractorPool.length > distractors.length) {
    const candidate = distractorPool[Math.floor(random() * distractorPool.length)];
    if (candidate && !distractors.includes(candidate)) {
      distractors.push(candidate);
    }
  }

  const choices = shuffle([answer, ...distractors].slice(0, 4), random);

  return {
    verb,
    type,
    answer,
    choices,
    prompt: `${verb.dictionary}（${verb.meaning}）的${conjugationTypeLabels[type]}是哪个？`,
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
