/**
 * The type of component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
 */
enum ComponentType {
  ACTION_ROW = 1,
  BUTTON = 2,
  SELECT_MENU = 3,
  TEXT_INPUT = 4,
}

type Component = Button | ActionRow | SelectMenu | TextInput;

/**
 * Button component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
type Button = {
  type: ComponentType.BUTTON;
  style: ButtonStyle.PRIMARY | ButtonStyle.SECONDARY | ButtonStyle.SUCCESS | ButtonStyle.DANGER | ButtonStyle.LINK;
  label: string;
  emoji?: Pick<EmojiInfo, 'id' | 'name' | 'animated'>;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
};

enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5,
}

/**
 * Action row component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
type ActionRow = {
  type: ComponentType.ACTION_ROW;
  components: Exclude<Component, ActionRow>[];
};

/**
 * Select menu component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
type SelectMenu = {
  type: ComponentType.SELECT_MENU;
  custom_id: string;
  options: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
};

type SelectOption = {
  label: string;
  value: string;
  description?: string;
  emoji?: Pick<EmojiInfo, 'id' | 'name' | 'animated'>;
  default?: boolean;
};

/**
 * Text input component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure}
 */
type TextInput = {
  type: ComponentType.TEXT_INPUT;
  custom_id: string;
  style: TextInputStyle.SHORT | TextInputStyle.PARAGRAPH;
  label: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
};

enum TextInputStyle {
  SHORT = 1,
  PARAGRAPH = 2,
}

type EmojiInfo = {
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

export { ComponentType, Component, Button, ButtonStyle, SelectMenu, SelectOption, TextInput, TextInputStyle };
