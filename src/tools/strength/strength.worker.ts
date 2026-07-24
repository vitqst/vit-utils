/// <reference lib="webworker" />

import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as common from "@zxcvbn-ts/language-common";
import * as english from "@zxcvbn-ts/language-en";

type Request = { type: "check"; id: number; password: string };

const estimator = new ZxcvbnFactory({
  translations: english.translations,
  graphs: common.adjacencyGraphs,
  dictionary: {
    ...common.dictionary,
    ...english.dictionary,
  },
});

self.onmessage = (event: MessageEvent<Request>) => {
  const { id, password } = event.data;
  try {
    const result = estimator.check(password);
    self.postMessage({
      type: "result",
      id,
      score: result.score,
      guesses: result.guesses,
      crackTime: result.crackTimes.offlineFastHashingXPerSecond.display,
      warning: result.feedback.warning,
      suggestions: result.feedback.suggestions,
      patterns: [...new Set(result.sequence.map((match) => match.pattern))],
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

