//@ts-expect-error
import { Client } from "irc-framework";
import axios from "axios";
import cheerio from "cheerio";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const url = "https://dle.rae.es/";

const MAX_ENTRIES = 5;

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
    const axiosInstance = axios.create();
    const request = url + event.message.split(" ")[1];
    axiosInstance
      .get(encodeURI(request))
      .then((response) => {
        const html = response.data;

        const $ = cheerio.load(html);
        const results = $(".j").text() + $(".j2").text();
        const regEx = new RegExp(".?[0-9]. ", "g");

        let definitions: string[] = [];
        if (results) {
          definitions = results.split(regEx).splice(1);

          for (let i = 0; i < definitions.length; i++) {
            event.reply(definitions[i]);
            if (i >= MAX_ENTRIES - 1) break;
          }
	}
	else {
	   event.reply("error: palabra no está en el diccionario.");
	}
      })
      .catch(console.error);
  }
});
