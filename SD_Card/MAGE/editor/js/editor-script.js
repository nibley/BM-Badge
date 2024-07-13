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
			updateAction,
			addAction,
		};
	},
	template: /*html*/`
<editor-accordion
	class="editor-action"
>
	<template #header>
		<template v-if="editing">
			<!-- TODO would be nice if these warnings would sit vertically middle -->
			<span
				v-if="
					isNewScriptNameUnique
					|| scriptName === editingName
				"
				class="text-warning"
				style="font-size: 90%;"
			>NOTE: Script name references <br/>will not be updated elsewhere!</span>
			<span
				v-if="
					!isNewScriptNameUnique
					&& scriptName !== editingName
				"
				class="text-danger"
				style="font-size: 90%;"
			>Another script <br/>already has that name!</span>
		</template>

		<template v-else>
			<button
				type="button"
				class="btn btn-outline-light"
				:disabled="index === 0"
				@click="moveScript(-1)"
			>↑</button>
			<button
				type="button"
				class="btn btn-outline-light"
				:disabled="index === (currentData.scriptsFileItemMap[fileName].length - 1)"
				@click="moveScript(1)"
			>↓</button>
		</template>
	</template>

	<template #headerLeft>
		<template v-if="editing">
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
					class="btn btn-sm btn-outline-light"
					@click="editing = false; editingName = null"
				>Cancel</button>
				<button
					type="button"
					class="btn btn-sm btn-outline-light"
					@click="submitNewScriptName"
					:disabled="
						!isNewScriptNameUnique
						&& scriptName !== editingName
					"
				>OK</button>
			</div>
		</template>
		
		<template v-else>
			<button
				type="button"
				class="btn mr-1 btn-outline-danger"
				@click="$emit('deleteScript')"
			>X</button>
			<span class="ml-2">
				<span class="mr-auto">{{scriptName}}</span>
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
			</span>
		</template>
	</template>

	<div v-for="(action, index) in script">
		<editor-action
			:script="script"
			:action="action"
			:index="index"
			@input="updateAction(index,$event)"
			@moveAction="moveAction(index,$event)"
			@deleteAction="deleteAction(index)"
		></editor-action>
	</div>
	<form @submit.prevent="addAction">
		<div class="form-group">
			<label
				class="form-label"
				for="newScriptFileName"
			>New Action</label>
			<div class="input-group">
				<!-- TODO update use of v-model per https://v3-migration.vuejs.org/breaking-changes/v-model.html
				value prop is no longer present through v-model
				also consider the update event changes -->
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
</editor-accordion>`};
