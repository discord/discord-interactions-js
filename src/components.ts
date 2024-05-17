/**
 * The type of component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
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
}

export type MessageComponent = Button | ActionRow | StringSelect | InputText;

export enum ButtonStyleTypes {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5,
  PREMIUM = 6,
}

interface BaseButton {
  disabled?: boolean;
  emoji?: Pick<EmojiInfo, 'id' | 'name' | 'animated'>;
  label: string;
  type: MessageComponentTypes.BUTTON;
}

interface PremiumButton extends BaseButton {
  sku_id: string;
  style: ButtonStyleTypes.PREMIUM;
}

interface LinkButton extends BaseButton {
  url: string;
  style: ButtonStyleTypes.LINK;
}

interface AllOtherButtons extends BaseButton {
  custom_id: string;
  style: ButtonStyleTypes.PRIMARY | ButtonStyleTypes.SECONDARY | ButtonStyleTypes.SUCCESS | ButtonStyleTypes.DANGER;
}

/**
 * Button component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
export type Button = AllOtherButtons | LinkButton | PremiumButton;

/**
 * Action row component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
export type ActionRow = {
  type: MessageComponentTypes.ACTION_ROW;
  components: Exclude<MessageComponent, ActionRow>[];
};

export type SelectComponentType =
  | MessageComponentTypes.STRING_SELECT
  | MessageComponentTypes.USER_SELECT
  | MessageComponentTypes.ROLE_SELECT
  | MessageComponentTypes.MENTIONABLE_SELECT
  | MessageComponentTypes.CHANNEL_SELECT;

// This parent type is to simplify the individual selects while keeping descriptive generated type hints
export type SelectMenu<T extends SelectComponentType> = {
  type: T;
  custom_id: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  options: StringSelectOption[];
  channel_types?: ChannelTypes[];
};

/**
 * Text select menu component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export type StringSelect = Omit<SelectMenu<MessageComponentTypes.STRING_SELECT>, 'channel_types'>;

export type StringSelectOption = {
  label: string;
  value: string;
  description?: string;
  emoji?: Pick<EmojiInfo, 'id' | 'name' | 'animated'>;
  default?: boolean;
};

/**
 * User select menu component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export type UserSelect = Omit<SelectMenu<MessageComponentTypes.USER_SELECT>, 'channel_types' | 'options'>;

/**
 * Role select menu component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export type RoleSelect = Omit<SelectMenu<MessageComponentTypes.ROLE_SELECT>, 'channel_types' | 'options'>;

/**
 * Mentionable (role & user) select menu component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export type MentionableSelect = Omit<SelectMenu<MessageComponentTypes.MENTIONABLE_SELECT>, 'channel_types' | 'options'>;

/**
 * Channel select menu component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export type ChannelSelect = Omit<SelectMenu<MessageComponentTypes.CHANNEL_SELECT>, 'options'>;

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
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure}
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
  user?: { [key: string]: any };
  roles?: string[];
  require_colons?: boolean;
  managed?: boolean;
  available?: boolean;
  animated?: boolean;
};
