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
		var collapsed = Vue.ref(true);
		var newActionName = Vue.ref(null);

		var dialogPhases = Vue.computed(function() {
			return currentData.value.dialogs[props.dialogName];
		});

		var moveDialog = function (direction) {
			/*
			TODO store
			this.$store.commit('MOVE_DIALOG', {
				fileName: props.fileName,
				index: props.index,
				direction: direction
			});
			*/
		};
		var collapse = function() {
			collapsed.value = !(collapsed.value);
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
			collapsed,
			newActionName,
			// global refs:
			currentData: window.currentData,
			fileNameMap: window.fileNameMap,
			scenarioData: window.scenarioData,
			// computeds:
			dialogPhases,
			// methods:
			addDialogPhase,
			moveDialog,
			collapse,
			updateDialogPhase,
			deleteDialogPhase,
		};
	},
	template: /*html*/`
<div
	class="editor-dialog card bg-secondary border-primary mb-4"
>
	<div class="card-header bg-primary">
		<strong class="me-auto">{{ dialogName }}</strong>
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
				@click="moveDialog(-1)"
			>↑</button>
			<button
				type="button"
				class="btn btn-outline-info"
				:disabled="index === (currentData.dialogsFileItemMap[fileName].length - 1)"
				@click="moveDialog(1)"
			>↓</button>
		</span>
	</div>
	<div
		class="card-body p-3"
		v-if="!collapsed"
	>
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
	</div>
</div>
`};
