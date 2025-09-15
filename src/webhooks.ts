/**
 * @see {@link https://discord.com/developers/docs/events/webhook-events#webhook-types}
 */
export enum WebhookType {
	/**
	 * A ping.
	 */
	PING = 0,
	/**
	 * A webhook event.
	 */
	EVENT = 1,
}

/**
 * Events to which an app can subscribe to
 * @see {@link https://discord.com/developers/docs/events/webhook-events#event-types}
 */
export enum WebhookEventType {
	/**
	 * Event sent when an app was authorized by a user to a server or their account.
	 */
	APPLICATION_AUTHORIZED = 'APPLICATION_AUTHORIZED',
	/**
	 * Event sent when an app was deauthorized by a user.
	 */
	APPLICATION_DEAUTHORIZED = 'APPLICATION_DEAUTHORIZED',
	/**
	 * Event sent when an entitlement was created.
	 */
	ENTITLEMENT_CREATE = 'ENTITLEMENT_CREATE',
	/**
	 * Event sent when a user was added to a Quest.
	 */
	QUEST_USER_ENROLLMENT = 'QUEST_USER_ENROLLMENT',
	/**
	 * Event sent when a message is created in a lobby.
	 */
	LOBBY_MESSAGE_CREATE = 'LOBBY_MESSAGE_CREATE',
	/**
	 * Event sent when a message is updated in a lobby.
	 */
	LOBBY_MESSAGE_UPDATE = 'LOBBY_MESSAGE_UPDATE',
	/**
	 * Event sent when a message is deleted from a lobby.
	 */
	LOBBY_MESSAGE_DELETE = 'LOBBY_MESSAGE_DELETE',
	/**
	 * Event sent when a direct message is created during an active Social SDK session.
	 */
	GAME_DIRECT_MESSAGE_CREATE = 'GAME_DIRECT_MESSAGE_CREATE',
	/**
	 * Event sent when a direct message is updated during an active Social SDK session.
	 */
	GAME_DIRECT_MESSAGE_UPDATE = 'GAME_DIRECT_MESSAGE_UPDATE',
	/**
	 * Event sent when a direct message is deleted during an active Social SDK session.
	 */
	GAME_DIRECT_MESSAGE_DELETE = 'GAME_DIRECT_MESSAGE_DELETE',
}
