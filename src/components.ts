/**
 * The type of component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
 */
enum MessageComponentTypes {
  ACTION_ROW = 1,
  BUTTON = 2,
  STRING_SELECT = 3,
  INPUT_TEXT = 4,
}

type MessageComponent = Button | ActionRow | StringSelect | InputText;

/**
 * Button component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
type Button = {
  type: MessageComponentTypes.BUTTON;
  style:
    | ButtonStyleTypes.PRIMARY
    | ButtonStyleTypes.SECONDARY
    | ButtonStyleTypes.SUCCESS
    | ButtonStyleTypes.DANGER
    | ButtonStyleTypes.LINK;
  label: string;
  emoji?: Pick<EmojiInfo, 'id' | 'name' | 'animated'>;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
};

enum ButtonStyleTypes {
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
  type: MessageComponentTypes.ACTION_ROW;
  components: Exclude<MessageComponent, ActionRow>[];
};

/**
 * Select menu component
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
type StringSelect = {
  type: MessageComponentTypes.STRING_SELECT;
  custom_id: string;
  options: StringSelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
};

type StringSelectOption = {
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
type InputText = {
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

enum TextStyleTypes {
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

export {
  MessageComponentTypes,
  MessageComponent,
  Button,
  ButtonStyleTypes,
  StringSelect,
  StringSelectOption,
  InputText,
  TextStyleTypes,
};
