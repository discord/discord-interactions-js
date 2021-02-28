const Snowflake = require("snowflake-util");

/*
 * CUSTOM SPECIFIC ERRORS
 */

class DiscordInteractionError extends Error
{
	constructor(...args)
	{
		super(...args);
	}
}

class VersionError extends DiscordInteractionError
{
	constructor(...args)
	{
		super(...args);
	}
}

class CommandNameMatchError extends DiscordInteractionError
{
	constructor(...args)
	{
		super(...args);
	}
}

/*
 * ENUMERATORS (TYPE DEFINITIONS)
 */

const ApplicationCommandOptionType = {
	SUB_COMMAND: 1,
	SUB_COMMAND_GROUP: 2,
	STRING: 3,
	INTEGER: 4,
	BOOLEAN: 5,
	USER: 6,
	CHANNEL: 7,
	ROLE: 8
};

const InteractionType = {
	PING: 1,
	APPLICATION_COMMAND: 2
};

const InteractionResponseType = {
	PONG: 1,
	ACKNOWLEDGE: 2,
	CHANNEL_MESSAGE: 3,
	CHANNEL_MESSAGE_WITH_SOURCE: 4,
	ACKNOWLEDGE_WITH_SOURCE: 5
};

/*
 * GENERICS
 */

class GenericDataManager
{
	constructor(existingData, DataObjectType = Object, dataObjectLimit = 10)
	{
		this.dataArr = [];
		if (existingData != null)
		{
			if (existingData instanceof GenericDataManager)
				this.dataArr = existingData.dataArr;
			else if (Array.isArray(existingData))
				this.dataArr = existingData.slice(0, 10).map(x =>
				{
					if (!(x instanceof DataObjectType))
						x = new DataObjectType(x);
				});
		}

		this.DataObjectType = DataObjectType;
		this.dataObjectLimit = dataObjectLimit;
	}

	add(dataObject)
	{
		if (this.dataArr.length === this.dataObjectLimit)
			throw new RangeError(`There are already ${this.dataObjectLimit} objects in this Array.`);

		if (!(dataObject instanceof this.DataObjectType))
			dataObject = new this.DataObjectType(dataObject);

		this.dataArr.push(dataObject);
		return this;
	}

	remove(dataObject)
	{
		if (!this.length)
			return this;

		if (!(dataObject instanceof this.dataObjectType))
			dataObject = new this.DataObjectType(dataObject);

		const index = this.dataArr.indexOf(dataObject);
		this.dataArr.splice(index, 1);
		return this;
	}

	removeAt(index)
	{
		if (!this.length)
			return this;

		this.dataArr.splice(index, 1);
		return this;
	}

	valueOf()
	{
		return this.dataArr;
	}
}

class ApplicationCommandOptionManager extends GenericDataManager
{
	constructor(existingData)
	{
		super(existingData, ApplicationCommandOption, 10);
	}
}

class ApplicationCommandOptionChoiceManager extends GenericDataManager
{
	constructor(existingData)
	{
		super(existingData, ApplicationCommandOptionChoice, 10);
	}
}

class ApplicationCommandInteractionDataOptionManager extends GenericDataManager
{
	constructor(existingData)
	{
		super(existingData, ApplicationCommandInteractionDataOption, Math.Infinity);
	}
}

/*
 * DATA MODELS
 */

class ApplicationCommandInteractionDataOption
{
	constructor(name, valueOrOptions = null)
	{
		this.name = name;

		if (valueOrOptions != null)
		{
			if (valueOrOptions instanceof ApplicationCommandInteractionDataOptionManager)
				this.options = valueOrOptions;
			else
				this.value = valueOrOptions;
		}
	}
}

class ApplicationCommandOptionChoice
{
	constructor(name, value)
	{
		if ((typeof name) !== "string")
			throw new TypeError("'name' must be a string.");

		if (![ "string", "number" ].some(type => (typeof value) === type))
			throw new TypeError("'value' must be a string or a number.");

		this.name = name.slice(0, 100);
		this.value = value;
	}
}

class ApplicationCommandOption
{
	constructor(data)
	{
		if ((typeof data.type) !== "number")
			throw new TypeError("'type' must be a number");
		else if (!Object.values(ApplicationCommandOptionType).includes(data.type))
			throw new RangeError(`'type' must range between ${Math.min(...Object.values(ApplicationCommandOptionType))} - ${Math.max(...Object.values(ApplicationCommandOptionType))}`);

		if ((typeof data.name) !== "string")
			throw new TypeError("'name' must be a string");
		else if (!/^[\w-]{1,32}$/.test(data.name))
			throw new CommandNameMatchError("'name' must match '^[\\w-]{1,32}$'");

		if ((typeof data.description) !== "string")
			throw new TypeError("'description' must be a string");

		this.type = data.type;
		this.name = data.name.slice(0, 32);
		this.description = data.description.slice(0, 100);
		this.required = data.required || false;
		this.choices = new ApplicationCommandOptionChoiceManager(data.choices);
		this.options = new ApplicationCommandOptionManager(data.options);
	}
}

class ApplicationCommand
{
	constructor(data)
	{
		// if these raise no errors, they're valid Snowflakes
		Snowflake.deconstruct(data.id);
		Snowflake.deconstruct(data.application_id);

		if ((typeof data.name) !== "string")
			throw new TypeError("'name' must be a string.");

		if ((typeof data.description) !== "string")
			throw new TypeError("'description' must be a string.");

		this.id = data.id;
		this.appID = data.application_id;
		this.name = data.name;
		this.description = data.description;
		this.options = new ApplicationCommandOptionManager(data.options);
	}
}

class ApplicationCommandInteractionData
{
	constructor(id, name, options)
	{
		this.id = id;
		this.name = name;
		this.options = new ApplicationCommandInteractionDataOptionManager(options);
	}
}

class Interaction
{
	constructor(data)
	{
		if (data.version !== "1")
			throw new VersionError("Invalid 'version' specified");

		this.id = data.id;
		this.token = data.token;
		this.version = data.version;

		this.type = data.type;
		this.data = data.data;
		this.guildID = data.guild_id;
		this.channelID = data.channel_id;
		this.member = data.member;
		this.user = data.user;
	}
}

class InteractionApplicationCommandCallbackData
{
	constructor(data)
	{
		if (!(data instanceof InteractionApplicationCommandCallbackData))
		{
			if ((typeof data.content) !== "string")
				throw new TypeError("'content' must be a string");
		}

		this.tts = data.tts || false;
		this.content = data.content;
		this.embeds = data.embeds;
		this.allowedMentions = data.allowedMentions;
	}
}

class InteractionResponse
{
	constructor(type, data)
	{
		if ((typeof type) !== "number")
			throw new TypeError("'type' must be a number");
		else if (!Object.values(InteractionResponseType).includes(type))
			throw new RangeError(`'type' must range between ${Math.min(...Object.values(InteractionResponseType))} - ${Math.max(...Object.values(InteractionResponseType))}`);

		this.type = type;
		this.data = new InteractionApplicationCommandCallbackData(data);
	}
}

module.exports = {
	ApplicationCommandOptionType,
	InteractionType,
	InteractionResponseType,
	GenericDataManager,
	ApplicationCommandOptionManager,
	ApplicationCommandOptionChoiceManager,
	ApplicationCommandInteractionDataOptionManager,
	ApplicationCommand,
	ApplicationCommandOption,
	ApplicationCommandOptionChoice,
	ApplicationCommandInteractionDataOption,
	ApplicationCommandInteractionData,
	Interaction,
	InteractionApplicationCommandCallbackData,
	InteractionResponse
};
