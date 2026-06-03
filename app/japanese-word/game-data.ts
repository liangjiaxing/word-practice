export type ConjugationType =
  | "passive"
  | "potential"
  | "causative"
  | "causativepassive";

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
    group: "ichidan",
    forms: {
      passive: "食べられる",
      potential: "食べられる",
      causative: "食べさせる",
      causativepassive: "食べさせられる",
    },
  },
  {
    dictionary: "見る",
    meaning: "看",
    group: "ichidan",
    forms: {
      passive: "見られる",
      potential: "見られる",
      causative: "見させる",
      causativepassive: "見させられる",
    },
  },
  {
    dictionary: "起きる",
    meaning: "起床",
    group: "ichidan",
    forms: {
      passive: "起きられる",
      potential: "起きられる",
      causative: "起きさせる",
      causativepassive: "起きさせられる",
    },
  },
  {
    dictionary: "書く",
    meaning: "写",
    group: "godan",
    forms: {
      passive: "書かれる",
      potential: "書ける",
      causative: "書かせる",
      causativepassive: "書かせられる",
    },
  },
  {
    dictionary: "話す",
    meaning: "说",
    group: "godan",
    forms: {
      passive: "話される",
      potential: "話せる",
      causative: "話させる",
      causativepassive: "話させられる",
    },
  },
  {
    dictionary: "読む",
    meaning: "读",
    group: "godan",
    forms: {
      passive: "読まれる",
      potential: "読める",
      causative: "読ませる",
      causativepassive: "読ませられる",
    },
  },
  {
    dictionary: "泳ぐ",
    meaning: "游泳",
    group: "godan",
    forms: {
      passive: "泳がれる",
      potential: "泳げる",
      causative: "泳がせる",
      causativepassive: "泳がせられる",
    },
  },
  {
    dictionary: "待つ",
    meaning: "等",
    group: "godan",
    forms: {
      passive: "待たれる",
      potential: "待てる",
      causative: "待たせる",
      causativepassive: "待たせられる",
    },
  },
  {
    dictionary: "買う",
    meaning: "买",
    group: "godan",
    forms: {
      passive: "買われる",
      potential: "買える",
      causative: "買わせる",
      causativepassive: "買わせられる",
    },
  },
  {
    dictionary: "飲む",
    meaning: "喝",
    group: "godan",
    forms: {
      passive: "飲まれる",
      potential: "飲める",
      causative: "飲ませる",
      causativepassive: "飲ませられる",
    },
  },
  {
    dictionary: "来る",
    meaning: "来",
    group: "irregular",
    forms: {
      passive: "来られる",
      potential: "来られる",
      causative: "来させる",
      causativepassive: "来させられる",
    },
  },
  {
    dictionary: "する",
    meaning: "做",
    group: "irregular",
    forms: {
      passive: "される",
      potential: "できる",
      causative: "させる",
      causativepassive: "させられる",
    },
  },
];

export function getAvailableConjugationTypes(): ConjugationType[] {
  return ["passive", "potential", "causative", "causativepassive"];
}

export function buildQuestion(
  deck: JapaneseVerbEntry[],
  type: ConjugationType,
  random: () => number = Math.random
): JapaneseWordQuestion {
  const verb = deck[Math.floor(random() * deck.length)] ?? deck[0];
  const answer = verb.forms[type];

  const sameVerbDistractors = getSameVerbDistractors(verb, type);
  const relatedVerbDistractors = deck
    .filter((entry) => entry.dictionary !== verb.dictionary)
    .flatMap((entry) => [entry.forms[type], ...getSameVerbDistractors(entry, type)])
    .filter((form, index, forms) => form !== answer && forms.indexOf(form) === index);

  const distractors = [
    ...pickUnique(sameVerbDistractors, 2, random),
    ...pickUnique(relatedVerbDistractors, 2, random),
  ]
    .filter((form, index, forms) => form !== answer && forms.indexOf(form) === index)
    .slice(0, 3);

  const fallbackChoices = [answer, verb.dictionary, ...sameVerbDistractors, ...relatedVerbDistractors]
    .filter((form) => !!form)
    .filter((form, index, forms) => forms.indexOf(form) === index)
    .slice(0, 4);

  const choices = shuffle(
    (distractors.length === 3 ? [answer, ...distractors] : fallbackChoices).slice(0, 4),
    random
  );

  return {
    verb,
    type,
    answer,
    choices,
    prompt: `${verb.dictionary}（${verb.meaning}）的${conjugationTypeLabels[type]}是哪个？`,
  };
}

function getSameVerbDistractors(
  verb: JapaneseVerbEntry,
  targetType: ConjugationType
): string[] {
  return getAvailableConjugationTypes()
    .filter((item) => item !== targetType)
    .map((item) => verb.forms[item])
    .filter((form, index, forms) => form && forms.indexOf(form) === index);
}

function pickUnique<T>(items: T[], count: number, random: () => number): T[] {
  const pool = [...items];
  const picked: T[] = [];

  while (pool.length > 0 && picked.length < count) {
    const raw = random();
    const normalized = Number.isFinite(raw) ? raw : 0;
    const index = Math.max(0, Math.min(pool.length - 1, Math.floor(normalized * pool.length)));
    const [candidate] = pool.splice(index, 1);
    if (candidate !== undefined) {
      picked.push(candidate);
    }
  }

  return picked;
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
