vueComponents['editor-script'] = {
	name: 'editor-script',
	props: {
		scriptName: {
			type: String,
			required: true
		},
		fileName: {
			type: String,
			required: true
		},
		index: {
			type: Number,
			required: true
		},
	},
	emits: [
		'updateScriptsFileItemMap',
		'updateScriptName',
		'input',
		'deleteScript',
	],
	setup: function(props, context) {
		var fileNameMap = window.fileNameMap;
		var scenarioData = window.scenarioData;
		var currentData = window.currentData;
		var scriptsOptions = window.scriptsOptions;

		var collapsed = Vue.ref(true);
		var editingName = Vue.ref(props.scriptName);
		var newActionName = Vue.ref(null);
		var editing = Vue.ref(false);

		var script = Vue.computed(function() {
			return currentData.value.scripts[props.scriptName];
		});
		var isNewScriptNameUnique = Vue.computed(function() {
			var existingNames = scriptsOptions.value;
			return !existingNames.includes(editingName.value);
		});

		var moveScript = function(direction) {
			var fileName = props/fileName;
			var scripts = currentData.value.scriptsFileItemMap[fileName].slice();
			var index = props.index;
			var targetIndex = index + direction;
			var splice = scripts.splice(index, 1);
			scripts.splice(targetIndex, 0, splice[0]);
			context.emit('updateScriptsFileItemMap', scripts);
		};
		var submitNewScriptName = function() {
			var newName = editingName.value;
			editing.value = false;
			context.emit('updateScriptName', newName);
		};
		var moveAction = function(index, direction) {
			var newScript = script.value.slice();
			var targetIndex = index + direction;
			var splice = newScript.splice(index, 1);
			newScript.splice(targetIndex, 0, splice[0]);
			context.emit('input', newScript);
		};
		var deleteAction = function(index) {
			var newScript = script.value.slice();
			newScript.splice(index, 1);
			context.emit('input', newScript);
		};
		var collapse = function() {
			collapsed.value = !(collapsed.value);
		};
		var updateAction = function(index, action) {
			var newScript = script.value.slice();
			newScript[index] = action;
			context.emit('input', newScript);
		};
		var addAction = function() {
			var actionName = newActionName.value;
			var fieldsForAction = actionFieldsMap[actionName];
			// don't try to add an action if it's not valid
			if (fieldsForAction) {
				var newScript = script.value.slice();
				var action = {
					action: actionName,
				};
				fieldsForAction.forEach(function(field) {
					action[field.propertyName] = null;
				});
				newScript.push(action);
				context.emit('input', newScript);
			}
			newActionName.value = null;
		};

		return {
			// component state:
			collapsed,
			editingName,
			newActionName,
			editing,
			// global state:
			fileNameMap,
			scenarioData,
			currentData,
			scriptsOptions,
			// computeds:
			script,
			isNewScriptNameUnique,
			// methods:
			moveScript,
			submitNewScriptName,
			moveAction,
			deleteAction,
			collapse,
			updateAction,
			addAction,
		};
	},
	template: /*html*/`
<div
	class="editor-script card border-primary mb-4"
>
	<div class="card-header bg-primary">
		<div
			v-if="!editing"
		>
			<button
				type="button"
				class="btn mr-1 btn-outline-danger"
				@click="$emit('deleteScript')"
			>X</button>
			<strong class="mr-auto">{{scriptName}}</strong>
			<button
				type="button"
				class="btn btn-sm p-0"
				@click="editing = true; editingName = scriptName;"
			>
				<component-icon
					color="white"
					:size="12"
					subject="edit"
				></component-icon>
			</button>
			<span
				class="position-absolute"
				style="top:6px; right:6px;"
			>
				<button
					type="button"
					class="btn btn-outline-info"
					@click="collapse"
				>_</button>
				<button
					type="button"
					class="btn btn-outline-info"
					:disabled="index === 0"
					@click="moveScript(-1)"
				>↑</button>
				<button
					type="button"
					class="btn btn-outline-info"
					:disabled="index === (currentData.scriptsFileItemMap[fileName].length - 1)"
					@click="moveScript(1)"
				>↓</button>
			</span>
		</div>
		<div
			v-if="editing"
		>
			<div class="input-group">
				<input
					type="text"
					class="form-control"
					:class="{
						'is-invalid': !isNewScriptNameUnique && scriptName !== editingName
					}"
					v-model="editingName"
					aria-label="editingName"
				>
				<button
					type="button"
					class="btn btn-sm"
					@click="editing = false; editingName = null"
				>Cancel</button>
				<button
					type="button"
					class="btn btn-sm"
					@click="submitNewScriptName"
					:disabled="
						!isNewScriptNameUnique
						&& scriptName !== editingName
					"
				>OK</button>
			</div>
			<div
				class="form-text text-warning"
				v-if="
					isNewScriptNameUnique
					|| scriptName === editingName
				"
			>NOTE: Script name references will not be updated elsewhere!</div>
			<div
				class="form-text text-danger"
				v-if="
					!isNewScriptNameUnique
					&& scriptName !== editingName
				"
			>Another script already has that name!</div>
		</div>
	</div>
	<div
		class="card-body p-3"
		v-if="!collapsed"
	>
		<div
			v-for="(action, index) in script"
		>
			<editor-action
				:script="script"
				:action="action"
				:index="index"
				@input="updateAction(index,$event)"
				@moveAction="moveAction(index,$event)"
				@deleteAction="deleteAction(index)"
			></editor-action>
		</div>
		<form
			@submit.prevent="addAction"
		>
			<div
				class="form-group"
			>
				<label
					class="form-label"
					for="newScriptFileName"
				>New Action</label>
				<div class="input-group">
					<action-input-action-type
						id="newActionName"
						placeholder="New Action"
						aria-label="New Action"
						v-model="newActionName"
					></action-input-action-type>
					<button
						class="btn btn-primary"
						type="submit"
					>Add Action</button>
				</div>
			</div>
		</form>
	</div>
</div>
`};
