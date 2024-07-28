import {
  BadGatewayException,
  Injectable,
  Logger,
  OnApplicationBootstrap
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Client,
  FetchMembersOptions,
  GatewayIntentBits,
  Guild,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';
import { DiscordEventType } from './discord.types';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private logger = new Logger(DiscordService.name);
  private guild: Guild;
  private client: Client;
  private rest: REST;

  constructor(private eventEmitter: EventEmitter2) {}

  onApplicationBootstrap() {
    this.logger.verbose(`onApplicationBootstrap()`);
    this.initialize().catch((error) => this.logger.error(error));
  }

  async initialize() {
    const { DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ],
      partials: [Partials.Channel, Partials.Message]
    });
    this.rest = new REST().setToken(DISCORD_TOKEN);

    this.client.on('ready', () => {
      this.logger.log(`Logged in as ${this.client.user.tag}!`);
      this.eventEmitter.emit(DiscordEventType.initialized);
    });
    this.client.on('messageCreate', (message) => {
      this.logger.verbose(`on(messageCreate) ${message.id}`);
      this.eventEmitter.emit(DiscordEventType.messageCreate, message);
    });
    this.client.on('interactionCreate', (interaction) => {
      this.logger.verbose(`on(interactionCreate) ${interaction.id}`);
      this.eventEmitter.emit(DiscordEventType.interactionCreate, interaction);
    });
    this.client.on('error', (error) => {
      this.logger.error(error);
    });

    this.logger.log(`initialize() login...`);
    await this.client.login(DISCORD_TOKEN);

    this.logger.log(`initialize() fetch guild...`);
    this.guild = await this.client.guilds.fetch(DISCORD_GUILD_ID);
    this.logger.log(`initialize() fetch guild... ${this.guild.id}`);

    // const commands = new SlashCommandBuilder();
    // commands.setName('verify').setDescription('Verify web account.');
  }

  get user() {
    return this.client.user;
  }

  // async sendMessage() {}

  async registerCommand(commands: SlashCommandBuilder[]) {
    const { DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;
    await this.rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: commands }
    );
  }

  async getMembers(options?: FetchMembersOptions) {
    if (!this.guild) throw new BadGatewayException('guild_not_ready');
    return this.guild.members.fetch(options);
  }
}
