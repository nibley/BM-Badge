vueApp.component('editor-options', {
	name: 'editor-options',
	alignmentOptions: Object.keys(dialogAlignmentEnum),
	props: {
		value: {
			type: Array,
			required: true
		},
	},
	emits: ['input'].
	setup = function(props, context) {
		var scriptPresenceMap = Vue.computed(function () {
			return (currentData.value || {}).scripts || {}
		});

		var updateOption = function (index, propertyName, value) {
			var options = jsonClone(props.value);
			options[index][propertyName] = value;
			context.emit(
				'input',
				options
			);
		};
		var addOption = function () {
			var options = props.value.slice()
			options.push({
				"label": "Another Option",
				"script": null
			});
			context.emit(
				'input',
				options
			);
		};
		var removeOption = function (index) {
			var options = props.value.slice()
			options.splice(index, 1)
			context.emit(
				'input',
				options
			);
		};

		return {
			// global refs:
			currentData: window.currentData,
			// computeds:
			scriptPresenceMap,
			// methods:
			updateOption,
			addOption,
			removeOption,
		};
	},
	template: /*html*/`
<div
	class="
		editor-options
		card
		mb-3
	"
>
	<div
		class="card-body"
	>
		<div
			v-for="(option, index) in value"
			:key="index"
			class="position-relative mb-1 pr-5"
		>
			<div
				class="input-group"
			>
				<div class="input-group-prepend">
					<span class="input-group-text">Label</span>
				</div>
				<field-text
					property="script"
					:value="option.label"
					@input="updateOption(index, 'label', $event || null)"
				></field-text>
			</div>
			<div class="input-group">
				<div class="input-group-prepend">
					<span class="input-group-text">Script</span>
				</div>
				<field-text
					property="script"
					:value="option.script"
					:class="{
						'is-invalid': !scriptPresenceMap[option.script]
					}"
					@input="updateOption(index, 'script', $event || null)"
				></field-text>
				<div
					v-if="!scriptPresenceMap[option.script]"
					class="invalid-feedback"
				>Script not found yet. Make sure you create one with this name!</div>
			</div>
			<span
				class="position-absolute"
				style="top:0; right:0; height: 100%;"
			>
				<button
					type="button"
					class="btn btn-outline-danger"
					style="height: 100%;"
					@click="removeOption(index)"
				>x</button>
			</span>
		</div>
		<div>
			<button
				class="btn btn-primary"
				@click="addOption"
			>Add Option</button>
		</div>
	</div>
</div>
`});
