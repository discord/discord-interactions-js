/**
 * The type of component
 * @see {@link https://discord.com/developers/docs/components/reference#what-is-a-component}
 */
export enum MessageComponentTypes {
	ACTION_ROW = 1,
	BUTTON = 2,
	STRING_SELECT = 3,
	INPUT_TEXT = 4,
	USER_SELECT = 5,
	ROLE_SELECT = 6,
	MENTIONABLE_SELECT = 7,
	CHANNEL_SELECT = 8,
	SECTION = 9,
	TEXT_DISPLAY = 10,
	THUMBNAIL = 11,
	MEDIA_GALLERY = 12,
	FILE = 13,
	SEPARATOR = 14,
	CONTAINER = 17,
}

export type MessageComponent =
	| ActionRow
	| Button
	| StringSelect
	| UserSelect
	| RoleSelect
	| MentionableSelect
	| ChannelSelect
	| InputText
	| Section
	| TextDisplay
	| Thumbnail
	| MediaGallery
	| FileComponent
	| Separator
	| Container;

export enum ButtonStyleTypes {
	PRIMARY = 1,
	SECONDARY = 2,
	SUCCESS = 3,
	DANGER = 4,
	LINK = 5,
	PREMIUM = 6,
}

interface BaseComponent {
	type: MessageComponentTypes;
	id?: number;
}

interface BaseButton extends BaseComponent {
	disabled?: boolean;
	type: MessageComponentTypes.BUTTON;
}

interface LabeledButton extends BaseButton {
	emoji?: Pick<EmojiInfo, 'id' | 'name' | 'animated'>;
	label: string;
}

interface PremiumButton extends BaseButton {
	sku_id: string;
	style: ButtonStyleTypes.PREMIUM;
}

interface LinkButton extends LabeledButton {
	url: string;
	style: ButtonStyleTypes.LINK;
}

interface CustomButton extends LabeledButton {
	custom_id: string;
	style:
		| ButtonStyleTypes.PRIMARY
		| ButtonStyleTypes.SECONDARY
		| ButtonStyleTypes.SUCCESS
		| ButtonStyleTypes.DANGER;
}

/**
 * Button component
 * @see {@link https://discord.com/developers/docs/components/reference#button}
 */
export type Button = CustomButton | LinkButton | PremiumButton;

/**
 * Action row component
 * @see {@link https://discord.com/developers/docs/components/reference#action-row}
 */
export type ActionRow = BaseComponent & {
	type: MessageComponentTypes.ACTION_ROW;
	components: Array<
		| Button
		| StringSelect
		| UserSelect
		| RoleSelect
		| MentionableSelect
		| ChannelSelect
		| InputText
	>;
};

export type SelectComponentType =
	| MessageComponentTypes.STRING_SELECT
	| MessageComponentTypes.USER_SELECT
	| MessageComponentTypes.ROLE_SELECT
	| MessageComponentTypes.MENTIONABLE_SELECT
	| MessageComponentTypes.CHANNEL_SELECT;

// This parent type is to simplify the individual selects while keeping descriptive generated type hints
export type SelectMenu<T extends SelectComponentType> = BaseComponent & {
	type: T;
	custom_id: string;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	disabled?: boolean;
};

/**
 * Text select menu component
 * @see {@link https://discord.com/developers/docs/components/reference#string-select}
 */
export type StringSelect = SelectMenu<MessageComponentTypes.STRING_SELECT> & {
	options: StringSelectOption[];
};

export type StringSelectOption = {
	label: string;
	value: string;
	description?: string;
	emoji?: Pick<EmojiInfo, 'id' | 'name' | 'animated'>;
	default?: boolean;
};

/**
 * User select menu component
 * @see {@link https://discord.com/developers/docs/components/reference#user-select}
 */
export type UserSelect = SelectMenu<MessageComponentTypes.USER_SELECT>;

/**
 * Role select menu component
 * @see {@link https://discord.com/developers/docs/components/reference#role-select}
 */
export type RoleSelect = SelectMenu<MessageComponentTypes.ROLE_SELECT>;

/**
 * Mentionable (role & user) select menu component
 * @see {@link https://discord.com/developers/docs/components/reference#mentionable-select}
 */
export type MentionableSelect =
	SelectMenu<MessageComponentTypes.MENTIONABLE_SELECT>;

/**
 * Channel select menu component
 * @see {@link https://discord.com/developers/docs/components/reference#channel-select}
 */
export type ChannelSelect = SelectMenu<MessageComponentTypes.CHANNEL_SELECT> & {
	channel_types?: ChannelTypes[];
};

export enum ChannelTypes {
	DM = 1,
	GROUP_DM = 3,
	GUILD_TEXT = 0,
	GUILD_VOICE = 2,
	GUILD_CATEGORY = 4,
	GUILD_ANNOUNCEMENT = 5,
	GUILD_STORE = 6,
}

/**
 * Text input component
 * @see {@link https://discord.com/developers/docs/components/reference#text-input}
 */
export type InputText = {
	type: MessageComponentTypes.INPUT_TEXT;
	custom_id: string;
	style: TextStyleTypes.SHORT | TextStyleTypes.PARAGRAPH;
	label: string;
	min_length?: number;
	max_length?: number;
	required?: boolean;
	value?: string;
	placeholder?: string;
};

export enum TextStyleTypes {
	SHORT = 1,
	PARAGRAPH = 2,
}

export type EmojiInfo = {
	name: string | undefined;
	id: string | undefined;
	// Should define the user object in future
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	user?: { [key: string]: any };
	roles?: string[];
	require_colons?: boolean;
	managed?: boolean;
	available?: boolean;
	animated?: boolean;
};


/**
 * Section component
 * @see {@link https://discord.com/developers/docs/components/reference#section}
 */
export interface Section extends BaseComponent {
	type: MessageComponentTypes.SECTION;
	components: TextDisplay[] & { length: 1 | 2 | 3 };
	accessory: Thumbnail | Button;
}

/**
 * Text display component
 * @see {@link https://discord.com/developers/docs/components/reference#text-display}
 */
export interface TextDisplay extends BaseComponent {
	type: MessageComponentTypes.TEXT_DISPLAY;
	content: string;
}

/**
 * Thumbnail component
 * @see {@link https://discord.com/developers/docs/components/reference#thumbnail}
 */
export interface Thumbnail extends BaseComponent {
	type: MessageComponentTypes.THUMBNAIL;
	media: UnfurledMediaItem;
	description?: string;
	spoiler?: boolean;
}

/**
 * Media gallery component
 * @see {@link https://discord.com/developers/docs/components/reference#media-gallery}
 */
export interface MediaGallery extends BaseComponent {
	type: MessageComponentTypes.MEDIA_GALLERY;
	items: Array<MediaGalleryItem>;
}

export interface MediaGalleryItem {
	media: UnfurledMediaItem;
	description?: string;
	spoiler?: boolean;
}

/**
 * File component
 * @see {@link https://discord.com/developers/docs/components/reference#file}
 */
export interface FileComponent extends BaseComponent {
	type: MessageComponentTypes.FILE;
	file: UnfurledMediaItem;
	spoiler?: boolean;
}

/**
 * Separator component
 * @see {@link https://discord.com/developers/docs/components/reference#separator}
 */
export interface Separator extends BaseComponent {
	type: MessageComponentTypes.SEPARATOR;
	divider?: boolean;
	spacing?: SeparatorSpacingTypes;
}

export enum SeparatorSpacingTypes {
	SMALL = 1,
	LARGE = 2,
}

/**
 * Container component
 * @see {@link https://discord.com/developers/docs/components/reference#container}
 */
export interface Container extends BaseComponent {
	type: MessageComponentTypes.CONTAINER;
	components: Array<MessageComponent>;
	accent_color?: number | null;
	spoiler?: boolean;
}

export interface UnfurledMediaItem {
	url: string;
	proxy_url?: string;
	height?: number | null;
	width?: number | null;
	content_type?: string;
}
