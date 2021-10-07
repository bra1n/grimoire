const rp = require("request-promise-native");
const Discord = require("discord.js");
const utils = require("../utils");
const log = utils.getLogger('glossary');

class BotcGlossaryLoader {
  constructor(commandChar) {
    this.cc = commandChar;
    this.commands = {
      glossary: {
        aliases: ['define'],
        inline: true,
        description: "Search the glossary for a definition",
        help: '',
        examples: ["glossary drunk", "define dead"]
      },
    };
    this.wikiPage = "https://wiki.bloodontheclocktower.com/Glossary";
    this.wikiApi = "https://wiki.bloodontheclocktower.com/api.php?action=query&prop=categories|revisions&rvprop=content&format=json&rvslots=*&titles=Glossary";
    this.definitions = new Map();
    this.fetchDefinitions();
  }

  getCommands() {
    return this.commands;
  }

  /**
   * Fetch the glossary from the BOTC wiki
   * @returns {Promise<Object>}
   */
  async fetchDefinitions() {
    const body = await rp({url: this.wikiApi, json: true});
    if (body.query && body.query.pages["366"]) {
      const page = body.query.pages["366"];
      const glossary = page.revisions[0].slots.main['*'].replace(/\n +\n/,"\n\n").split("\n\n").map(e =>
        (e.match(/^'''(.*?):?''':? (.*)$/) || []).splice(1,2));
      log.info("loaded " + glossary.length + " definitions");
      this.definitions = new Map(glossary.map(e => [e[0].trim().toLowerCase(), {
        title: e[0],
        definition: e[1]
      }]));
    } else throw new Error('not found');
  }

  // generate the embed
  generateEmbed({ title, definition }) {
    // footer
    let footer = this.wikiPage;

    // instantiate embed object
    return new Discord.MessageEmbed({
      title: 'Glossary: ' + title,
      description: definition,
      footer: {text: footer},
      url: this.wikiPage,
      color: 0x2096FF
    });
  }

  /**
   * Handle an incoming message
   * @param command
   * @param parameter
   * @param msg
   * @returns {Promise}
   */
  handleMessage(command, parameter, msg) {
    const search = parameter.toLowerCase();
    // no search param, no lookup
    if (!search) return;
    // fetch data from Glossary
    if(this.definitions.has(search)) {
      // generate embed
      const embed = this.generateEmbed(this.definitions.get(search));
      return msg.channel.send('', {embed});
    } else {
      let description = 'No glossary entry matched `' + search + '`.';
      return msg.channel.send('', {
        embed: new Discord.MessageEmbed({
          title: 'Error',
          description,
          color: 0xff0000
        })
      });
    }
  }
}

module.exports = BotcGlossaryLoader;
