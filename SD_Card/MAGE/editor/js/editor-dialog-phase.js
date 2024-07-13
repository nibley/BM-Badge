vueComponents['editor-dialog-phase'] = {
	name: 'editor-dialog-phase',
	props: {
		phaseIndex: {
			type: Number,
			required: true
		},
		phase: {
			type: Object,
			required: true
		},
	},
	emits: ['input', 'delete'],
	setup: function(props, context) {
		var borderTilesetOptions = window.borderTilesetOptions;

		var alignmentOptions = Vue.ref(Object.keys(dialogAlignmentEnum));

		var messageIndexOptions = Vue.computed(function() {
			return Object.keys(props.phase.messages);
		});
		var showOptions = Vue.computed(function() {
			return props.phase.response_type === 'SELECT_FROM_SHORT_LIST';
		});
		var newMessage = Vue.computed(function() {
			// TODO newMessage was never implemented
			return undefined;
		});

		var updateValueWithChanges = function(changes) {
			var result = Object.assign(
				{},
				props.phase,
				changes
			)
			Object.keys(changes).forEach(function (propertyName) {
				var value = result[propertyName]
				if (value === null) {
					delete result[propertyName]
				}
			})
			context.emit('input', result);
		};
		var updateProperty = function(propertyName, value) {
			updateValueWithChanges({
				[propertyName]: value
			})
		};
		var updateMessage = function(index, message) {
			var messages = (props.phase.messages || []).slice();
			messages[index] = message;
			updateProperty(
				'messages',
				messages
			);
		};
		var addMessage = function() {
			var messages = (props.phase.messages || []).slice();
			messages.push(newMessage.value);
			updateProperty(
				'messages',
				messages
			);
		};
		var deleteMessage = function(index) {
			var messages = (props.phase.messages || []).slice();
			messages.splice(index, 1);
			updateProperty(
				'messages',
				messages
			);
		};
		var changeOptionsPresence = function(on) {
			var changes = {}
			if (on && !props.phase.options) {
				changes.options = [
					{
						"label": "Choice One",
						"script": null
					},
					{
						"label": "Choice Two",
						"script": null
					},
				];
			}
			changes.response_type = on
				? 'SELECT_FROM_SHORT_LIST'
				: null
			updateValueWithChanges(changes);
		};

		return {
			// component state:
			alignmentOptions,
			// global state:
			borderTilesetOptions,
			// computeds:
			newMessage,
			messageIndexOptions,
			showOptions,
			// methods:
			updateValueWithChanges,
			updateProperty,
			updateMessage,
			addMessage,
			deleteMessage,
			changeOptionsPresence,
		};
	},
	template: /*html*/`
<div
	class="editor-dialog-phase card border-secondary mb-2"
>
	<div
		class="card-header"
	>
		<span>Phase: {{ phaseIndex }}</span>
		<span
			class="position-absolute"
			style="top:6px; right:6px;"
		>
			<component-button
				type="delete"
				title="Delete phase"
				@click="$emit('delete')" />
		</span>
	</div>
	<div
		class="card-body"
	>
		<div
			class="input-group"
		>
			<div class="input-group-prepend">
				<span class="input-group-text">Border Tileset</span>
			</div>
			<field-select
				property="border_tileset"
				:options="borderTilesetOptions"
				:value="phase.border_tileset"
				@input="updateProperty('border_tileset', $event || null)"
			></field-select>
		</div>
		<div
			class="input-group"
		>
			<div class="input-group-prepend">
				<span class="input-group-text">Alignment</span>
			</div>
			<field-select
				property="alignment"
				:options="alignmentOptions"
				:value="phase.alignment"
				@input="updateProperty('alignment', $event || null)"
			></field-select>
		</div>
		<div
			class="input-group"
		>
			<div class="input-group-prepend">
				<span class="input-group-text">Entity</span>
			</div>
			<field-text
				property="entity"
				:value="phase.entity"
				@input="updateProperty('entity', $event || null)"
			></field-text>
		</div>
		<div
			class="input-group"
		>
			<div class="input-group-prepend">
				<span class="input-group-text">Portrait</span>
			</div>
			<field-text
				property="portrait"
				:value="phase.portrait"
				@input="updateProperty('portrait', $event || null)"
			></field-text>
		</div>
		<div
			class="input-group"
		>
			<div class="input-group-prepend">
				<span class="input-group-text">Name</span>
			</div>
			<field-text
				property="name"
				:value="phase.name"
				@input="updateProperty('name', $event || null)"
			></field-text>
		</div>
		<div
			v-for="(message, index) in phase.messages"
			:key="index"
			class="position-relative"
		>
			<editor-dialog-phase-preview
				:phase="phase"
				:message-index="index"
			></editor-dialog-phase-preview>
			<div
				class="position-absolute"
				style="
					top: 0;
					left: 320px;
					right: 0;
				"
			>
				<div class="form-group position-relative">
					<label>Message</label>
					<span
						class="position-absolute"
						style="top: 0; right: 6px;"
					>
						<!-- TODO doesn't seem to be working -->
						<component-button
							type="delete"
							title="Delete Message"
							@click="deleteMessage(index)"
							class="btn-sm" />
					</span>
					<textarea
						class="form-control"
						rows="5"
						:value="message"
						@input="updateMessage(index, $event.target.value)"
					></textarea>
				</div>
			</div>
		</div>
		<div>
			<button
				class="btn btn-primary"
				@click="addMessage"
			>Add Message</button>
		</div>
		<div
			class="input-group"
		>
			<div class="input-group-prepend">
				<span class="input-group-text">Show Options?</span>
			</div>
			<field-select
				property="response_type"
				:options="[true]"
				:value="showOptions"
				@input="changeOptionsPresence"
			></field-select>
		</div>
		<editor-options
			v-if="showOptions"
			:value="phase.options"
			@input="updateProperty('options', $event)"
		></editor-options>
	</div>
</div>
`};
