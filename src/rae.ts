import axios from "axios";
import cheerio from "cheerio";

const url = "https://dle.rae.es/";
const MAX_ENTRIES = 5;

export default async function getDefinitions(event: any) {
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

export async function getExpressions(event: any) {
    const axiosInstance = axios.create();
    const request = url + event.message.split(" ")[1];
    axiosInstance
        .get(encodeURI(request))
        .then((response) => {
            const html = response.data;

            const $ = cheerio.load(html);
            const expresiones: string[] = [];
            const significados: string[] = [];

            $(".k6").each((_, e) => {
                expresiones.push($(e).text());
            });
            $(".m").each((_, e) => {
                significados.push($(e).text());
            });

            expresiones.forEach((expresion) => {
                event.reply(expresion);
                let found = false;
                let result = "";
                let count = 0;

                for(let i = 0; i < significados.length; i++) {
                    const entrada = significados[i];
                    if (entrada[0] === "1" && !found) {
                        found = true;
                        result += entrada;
                        count++;
                    }
                    else if (entrada[0] === "1" && found) {
                        break;
                    }
                    else {
                        result += ", " + entrada;
                        count++;
                    }
                }

                // im so tired
                while(count) {
                    significados.shift();
                    count--;
                }
                
                event.reply(result);
            });
        })
        .catch(console.error);
}