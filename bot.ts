import { createBot, text } from "@fedify/botkit";
// For development, we use in‑memory KV store and message queue.
// For production, replace these with persistent implementations.
import { DenoKvMessageQueue, DenoKvStore } from "@fedify/fedify/x/denokv";

const kv = await Deno.openKv();
// Create your bot instance.
const bot = createBot<void>({
  username: "bot",
  name: "HackersPub Ask Bot",
  summary: text`주기적으로 Hackers' Pub에 질문을 남기는 봇입니다.`,
  kv: new DenoKvStore(kv),
  queue: new DenoKvMessageQueue(kv),
});

// Create the weekly post content using the new header.
const weeklyMessage = text`
# Ask Hackers Pub : 이번 주말에 뭐 하시나요?

이번 주말에 뭘 하려고 계획 중인지 편하게 얘기해 보아요.
읽을 책, 가볼 곳, 해볼 것.. 어떤 것이든 좋습니다.
도움 요청이나 피드백 요청도 좋습니다.
물론! 아무것도 하지 않고 쉬는 것도 훌륭합니다.

* 지난 주말에 계획하셨던 일의 회고도 한 번 남겨보면 좋을 것 같아요.
`;

// Schedule the message using cron syntax.
// The expression "0 18 * * 5" means: at minute 0 of hour 18 (6:00 PM) on every Friday.
// Adjust if you need a different time.
const testPeriod = "* * * * *";
const realPeriod = "40 1 * * 6";
Deno.cron("post message periodically", realPeriod, async () => {
  try {
    // Use the actual domain for your bot.
    const session = bot.getSession("https://hackerspub-ask-bot.deno.dev");
    await session.publish(weeklyMessage);
    console.log("Weekly message posted");
  } catch (error) {
    console.error("Failed to post weekly message:", error);
  }
});

export default bot;
