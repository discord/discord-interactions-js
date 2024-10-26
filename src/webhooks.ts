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
	 * Event sent when an entitlement was created.
	 */
	ENTITLEMENT_CREATE = 'ENTITLEMENT_CREATE',
	/**
	 * Event sent when an user was added to a Quest.
	 */
	QUEST_USER_ENROLLMENT = 'QUEST_USER_ENROLLMENT',
}
