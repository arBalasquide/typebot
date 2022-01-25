//@ts-expect-error
import { Client } from "irc-framework";
import * as dotenv from "dotenv";
import getDefinitions, { getExpressions } from "./rae";

dotenv.config({ path: __dirname + "/.env" });

const bot = new Client({
  hostname: "unaffiliated/squidbot",
});
bot.connect({
  host: process.env.SERVER,
  port: process.env.PORT,
  nick: process.env.NICK,
});

let buffers = [];
bot.on("registered", () => {
  let channel = bot.channel(process.env.CHANNELS);
  buffers.push(channel);

  bot.say(
    "NickServ",
    "IDENTIFY " + process.env.NICK + " " + process.env.PASSWORD
  );
  setInterval(() => {
    channel.join();
  }, 3000);
});

bot.on("message", (event: any) => {
  if (event.message.match("^\\.rae ")) {
    getDefinitions(event);
  }
  if (event.message.match("^\\.exp ")) {
    getExpressions(event);
  }
});
