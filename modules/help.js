const _ = require('lodash');
const Discord = require('discord.js');

class Help {
    constructor(commandChar, modules) {
        this.cc = commandChar;
        this.commands = {
            help: {
                aliases: [],
                inline: false,
                description: "Show this help text",
                help: 'This command allows you to explore the different functions and ' +
                    'features of your beloved Grimoire bot. You can look up detailed descriptions ' +
                    'for a command by using `'+this.cc+'help <command>`, like `!help card`.',
                examples: ["help", "help card"]
            }
        };
        this.location = 'https://github.com/bra1n/grimoire';
        this.modules = modules;
    }

    getCommands() {
        return this.commands;
    }

    handleMessage(command, parameter, msg) {
        let param = parameter.trim().toLowerCase().split(" ")[0];

        const embed = new Discord.MessageEmbed({
            title: 'List of available commands',
            // thumbnail: {url: this.thumbnail},
            url: this.location
        });

        const commands = {};
        this.modules.forEach(module => {
            _.forEach(module.getCommands(), (commandObj, command) => {
                commandObj.name = command;
                commands[command] = commandObj;
                commandObj.aliases.forEach(alias => {
                    commands[alias] = commandObj;
                });
            })
        })

        if (parameter && commands[parameter]) {
            embed.setTitle('Command "'+this.cc+commands[parameter].name+'"');
            embed.setDescription(commands[parameter].help);
            embed.addField('Examples', '`' + commands[parameter].examples.map(e => this.cc + e).join('`\n`') + '`', true)
            if (commands[parameter].aliases && commands[parameter].aliases.length) {
                embed.addField('Aliases', '`' + this.cc + commands[parameter].aliases.join('`\n`' + this.cc) + '`', true);
            }
        } else {
            let description = '';
            _.forEach(commands, (commandObj, command) => {
                if (command !== commandObj.name) return;
                description += ':small_blue_diamond: **'+this.cc+command+'**  '+commandObj.description+'\n';
            });
            embed.setDescription(description+'\n To learn more about a command, use `'+this.cc+'help <command>`');
            embed.addField('Add The Grimoire to your Discord', 'This bot is provided free of charge ' +
                'and can be added to your server, too!\n :link: ' +
                'https://discordapp.com/api/oauth2/authorize?client_id=667841700932091935&scope=bot&permissions=313408\n');
            embed.addField('Grimoire Source Code', ':link: https://github.com/bra1n/grimoire');
        }

        return msg.author.send('', {embed});
    }
}
module.exports = Help;
