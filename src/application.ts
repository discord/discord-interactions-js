/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
 */
export enum ApplicationCommandType {
	CHAT_INPUT = 1,
	USER = 2,
	MESSAGE = 3,
	PRIMARY_ENTRY_POINT = 4,
}

/**
 * Where an app can be installed, also called its supported installation contexts.
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
 */
export enum ApplicationIntegrationType {
	GUILD_INSTALL = 0,
	USER_INSTALL = 1,
}

/**
 * Context in Discord where an interaction can be used, or where it was triggered from. Details about using interaction contexts for application commands is in the commands context documentation.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
 */
export enum ApplicationInteractionContextType {
	GUILD = 0,
	BOT_DM = 1,
	PRIVATE_CHANNEL = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
 */
export enum ApplicationCommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP = 2,
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
	MENTIONABLE = 9,
	NUMBER = 10,
	ATTACHMENT = 11,
}
