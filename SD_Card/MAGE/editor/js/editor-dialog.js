vueComponents['editor-dialog'] = {
	name: 'editor-dialog',
	props: {
		dialogName: {
			type: String,
			required: true,
		},
		fileName: {
			type: String,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
	},
	setup: function(props) {
		var currentData = window.currentData;
		var fileNameMap = window.fileNameMap;
		var scenarioData = window.scenarioData;

		var newActionName = Vue.ref(null);

		var dialogPhases = Vue.computed(function() {
			return currentData.value.dialogs[props.dialogName];
		});

		var moveDialog = function (direction) {
			/*
			TODO make sure this works after using accordion
			TODO store
			this.$store.commit('MOVE_DIALOG', {
				fileName: props.fileName,
				index: props.index,
				direction: direction
			});
			*/
		};
		var addDialogPhase = function(dialogName) {
			var dialog = currentData.value.dialogs[dialogName].slice();
			dialog.push({
				alignment: 'BOTTOM_LEFT',
				messages: [
					'TEXT_ABOUT_GOATS'
				],
			})
			currentData.value.dialogs[dialogName] = dialog;
		};
		var updateDialogPhase = function(phaseIndex, phase) {
			/*
			TODO store
			this.$store.commit('UPDATE_DIALOG_PHASE', {
				dialogName: props.dialogName,
				phaseIndex: phaseIndex,
				phase: phase,
			});
			*/
		};
		var deleteDialogPhase = function(phaseIndex) {
			/*
			TODO store
			this.$store.commit('DELETE_DIALOG_PHASE', {
				dialogName: props.dialogName,
				phaseIndex: phaseIndex,
			});
			*/
		};

		return {
			// component state:
			newActionName,
			// global state:
			currentData,
			fileNameMap,
			scenarioData,
			// computeds:
			dialogPhases,
			// methods:
			addDialogPhase,
			moveDialog,
			updateDialogPhase,
			deleteDialogPhase,
		};
	},
	template: /*html*/`
<editor-accordion
	class="editor-dialog"
	:title="dialogName"
>
	<template #header>
		<button
			type="button"
			class="btn btn-outline-light"
			:disabled="index === 0"
			@click="moveDialog(-1)"
		>↑</button>
		<button
			type="button"
			class="btn btn-outline-light"
			:disabled="index === (currentData.dialogsFileItemMap[fileName].length - 1)"
			@click="moveDialog(1)"
		>↓</button>
	</template>

	<editor-dialog-phase
		v-for="(phase, index) in dialogPhases"
		:key="index"
		:phase="phase"
		:phase-index="index"
		@input="updateDialogPhase(index, $event)"
		@delete="deleteDialogPhase(index)"
	></editor-dialog-phase>
	<div>
		<button
			class="btn btn-primary"
			type="submit"
			@click="addDialogPhase(dialogName)"
		>Add Phase</button>
	</div>
</editor-accordion>`};
