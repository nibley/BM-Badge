vueComponents['editor-dialogs'] = {
	name: 'editor-dialogs',
	/*
	TODO mixins
	mixins: [
		makeComputedStoreGetterSettersMixin([
			'scenarioData',
			'fileNameMap',
			'currentData',
			'initState',
		]),
		makeFileChangeTrackerMixinByResourceType('dialogs'),
	],
	*/
	setup: function () {
		var currentDialogFileName = Vue.ref('');
		var currentDialog = Vue.ref('');

		var currentFileDialogs = Vue.computed(function() {
			return currentData.value.dialogsFileItemMap[currentDialogFileName.value];
		});

		var handleInput = function(dialogName, value) {
			// TODO: implement
		};
		var updateDialogsFileItemMap = function(map) {
			currentData.value.dialogsFileItemMap = map;
		};

		// TODO dialogsNeedSave was never implemented
		// TODO dialogs was from makeFileChangeTrackerMixinByResourceType

		return {
			// component state:
			currentDialogFileName,
			currentDialog,
			// global refs:
			scenarioData: window.scenarioData,
			fileNameMap: window.fileNameMap,
			currentData: window.currentData,
			initState: window.initState,
			// computeds:
			currentFileDialogs,
			// methods:
			handleInput,
			updateDialogsFileItemMap,
		};
	},
	template: /*html*/`
<div
	class="editor-dialogs card mb-4"
>
	<div
		class="card-header bg-secondary"
	>Dialog Editor</div>
	<div
		class="card-body"
	>
		<template
			v-if="dialogsNeedSave"
		>
			<copy-changes
				v-for="(changes, fileName) in dialogsChangedFileMap"
				:key="fileName"
				:file-name="fileName"
				:changes="changes"
				resource-name="dialog"
			></copy-changes>
		</template>
		<div class="form-group">
			<label for="currentDialogFileName">Dialog Files:</label>
			<select
				class="form-control"
				id="currentDialogFileName"
				v-model="currentDialogFileName"
			>
				<option
					value=""
				>Select a file</option>
				<option
					v-for="(dialog, dialogFileName) in currentData.dialogsFileItemMap"
					:key="dialogFileName"
					:value="dialogFileName"
				>{{ dialogFileName }}</option>
			</select>
		</div>
		<editor-dialog
			v-for="(dialogName, index) in currentFileDialogs"
			:key="dialogName"
			:dialog-name="dialogName"
			:index="index"
			:file-name="currentDialogFileName"
			@input="handleInput(dialogName, $event)"
			@updateDialogsFileItemMap="updateDialogsFileItemMap"
		></editor-dialog>
	</div>
</div>
`};
