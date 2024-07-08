var getUnique = function (value, index, self) {
	return self.indexOf(value) === index;
};

var sortCaseInsensitive = function (a, b) {
	return a.toLowerCase().localeCompare(b.toLowerCase());
}

var extractNames = function (arrayOfObjects) {
	// console.log(arrayOfObjects);
	var result = arrayOfObjects
		.map(function (item) {
			return item.name;
		})
		.filter(function (itemName) {
			return itemName && itemName.length;
		})
		.sort(sortCaseInsensitive)
		.filter(getUnique);
	return result;
};

vueComponents['editor-scripts'] = {
	name: 'editor-scripts',
	setup: function() {
		var scenarioData = window.scenarioData;
		var fileNameMap = window.fileNameMap;
		var currentData = window.currentData;
		var initState = window.initState;
		var scriptsOptions = window.scriptsOptions;

		var currentScriptFileName = Vue.ref('');
		var newScriptFileName = Vue.ref(null);
		var newScriptName = Vue.ref(null);
		var {
			scriptsChangedFileMap,
			scriptsNeedSave,
		} = makeFileChangeTrackerUtilsByResourceType('scripts');

		var isNewScriptNameUnique = Vue.computed(function () {
			var existingNames = scriptsOptions.value;
			return !existingNames.includes(newScriptName.value);
		});
		/*var natLangScript = Vue.computed(function () {
			var currFile = currentScriptFileName.value;
			var scriptNames = currentData.value.scriptsFileItemMap[currFile];
			var scripts = currentData.value.scripts;
			var result = {};
			if (currFile) {
				scriptNames.forEach(function (scriptName) {
					result[scriptName] = scripts[scriptName];
				})
				var restored = makeNatLangScripts(result);
				return restored;
			} else {
				return '';
			}
		});*/

		var updateScript = function(scriptName,changes) {
			/*
			TODO store
			this.$store.commit('UPDATE_SCRIPT_BY_NAME', {
				scriptName: scriptName,
				script: changes
			})
			*/
		};
		var updateScriptName = function(oldName, newName, index) {
			// updates global script map
			var scriptValue = currentData.value.scripts[oldName];
			var newScriptsMap = Object.assign(
				{
					[newName]: scriptValue,
				},
				currentData.value.scripts,
			);
			delete newScriptsMap[oldName];

			// updates script name in file script list
			var fileName = currentScriptFileName.value;
			var newScriptList = currentData.value.scriptsFileItemMap[fileName].slice();
			newScriptList[index] = newName;

			currentData.value.scripts = newScriptsMap;
			updateScriptsFileItemMap(newScriptList);
		};
		var deleteScript = function(scriptName) {
			var fileName = currentScriptFileName.value;
			var newScriptList = currentData.value.scriptsFileItemMap[fileName]
				.filter(function (name) {
					return name !== scriptName;
				});

			var newScriptsMap = Object.assign(
				{},
				currentData.value.scripts,
			);
			delete newScriptsMap[scriptName];

			currentData.value.scripts = newScriptsMap;
			updateScriptsFileItemMap(newScriptList);
		};
		var updateScriptsFileItemMap = function(scripts) {
			var fileName = currentScriptFileName.value;
			var newScriptsFileItemMap = {};
			Object.assign(
				newScriptsFileItemMap,
				currentData.value.scriptsFileItemMap
			);
			newScriptsFileItemMap[fileName] = scripts;
			currentData.value.scriptsFileItemMap = newScriptsFileItemMap;
		};
		var addNewScriptFile = function() {
			var fileName = newScriptFileName.value;
			var allFiles = currentData.value.scriptsFileItemMap;
			currentData.value.scriptsFileItemMap = Object.assign(
				{},
				allFiles,
				{
					[fileName]: []
				}
			);
			currentScriptFileName.value = fileName;
			newScriptFileName.value = null;
		};
		var addNewScript = function() {
			var scriptName = newScriptName.value;
			var fileName = currentScriptFileName.value;
			var allScripts = currentData.value.scripts;
			currentData.value.scripts = Object.assign(
				{},
				allScripts,
				{
					[scriptName]: []
				}
			);
			currentData.value.scriptsFileItemMap[fileName].push(
				scriptName
			);
			newScriptName.value = null;
		};

		return {
			// component state:
			currentScriptFileName,
			newScriptFileName,
			newScriptName,
			scriptsChangedFileMap,
			scriptsNeedSave,
			// global state:
			scenarioData,
			fileNameMap,
			currentData,
			initState,
			scriptsOptions,
			// computeds:
			isNewScriptNameUnique,
			// natLangScript, // TODO enable? was commented out in vue 2
			// methods:
			updateScript,
			updateScriptName,
			deleteScript,
			updateScriptsFileItemMap,
			addNewScriptFile,
			addNewScript,
		};
	},
	template: /*html*/`
<div
	class="
		editor-scripts
		card
		text-white
		mb-3
	"
>
	<div class="card-header">Script Editor</div>
	<div class="card-body">
		<template
			v-if="scriptsNeedSave"
		>
			<copy-changes
				v-for="(changes, fileName) in scriptsChangedFileMap"
				:key="fileName"
				:file-name="fileName"
				:changes="changes"
				resource-name="script"
			></copy-changes>
		</template>
		<div class="form-group">
			<label for="currentScriptFileName">Script Files:</label>
			<select
				class="form-control"
				id="currentScriptFileName"
				v-model="currentScriptFileName"
			>
				<option
					value=""
				>Select a script</option>
				<option
					v-for="(script, scriptFileName) in currentData.scriptsFileItemMap"
					:key="scriptFileName"
					:value="scriptFileName"
				>{{ scriptFileName }}</option>
			</select>
		</div>
		<div
			v-if="newScriptFileName === null"
			class="form-group"
		>
			<button
				class="btn btn-block btn-primary"
				type="button"
				@click="newScriptFileName = 'script-YOUR_SCRIPT_NAME_HERE.json'"
			>Create New Script File</button>
		</div>
		<form
			v-if="newScriptFileName !== null"
			@submit.prevent="addNewScriptFile"
		>
			<div
				class="form-group"
			>
				<label
					class="form-label"
					for="newScriptFileName"
				>New Script FileName</label>
				<div class="input-group">
					<button
						class="btn btn-primary"
						type="button"
						@click="newScriptFileName = null"
					>X</button>
					<input
						type="text"
						class="form-control"
						id="newScriptFileName"
						placeholder="New Script FileName"
						aria-label="New Script FileName"
						v-model="newScriptFileName"
					/>
					<button
						class="btn btn-primary"
						type="submit"
					>Create New File</button>
				</div>
			</div>
		</form>

		<div
			v-if="currentScriptFileName"
		>
			<div
				v-for="(scriptName, index) in currentData.scriptsFileItemMap[currentScriptFileName]"
			>
				<editor-script
					:script-name="scriptName"
					:file-name="currentScriptFileName"
					:index="index"
					:file-name-map="fileNameMap"
					:scenario-data="scenarioData"
					@input="updateScript(scriptName,$event)"
					@updateScriptName="updateScriptName(scriptName,$event,index)"
					@deleteScript="deleteScript(scriptName)"
					@updateScriptsFileItemMap="updateScriptsFileItemMap($event)"
				></editor-script>
			</div>
			<div
				v-if="newScriptName === null"
				class="form-group"
			>
				<button
					class="btn btn-block btn-primary"
					type="button"
					@click="newScriptName = 'script-YOUR_SCRIPT_NAME_HERE'"
				>Create New Script</button>
			</div>
			<form
				v-if="newScriptName !== null"
				@submit.prevent="addNewScript"
			>
				<div
					class="form-group"
				>
					<label
						class="form-label"
						for="newScriptName"
					>New Script</label>
					<div class="input-group">
						<button
							class="btn btn-primary"
							type="button"
							@click="newScriptName = null"
						>X</button>
						<input
							type="text"
							class="form-control"
							:class="{
								'is-invalid': !isNewScriptNameUnique
							}"
							id="newScriptName"
							placeholder="New Script Name"
							aria-label="New Script Name"
							v-model="newScriptName"
						/>
						<button	
							class="btn btn-primary"
							type="submit"
							:disabled="!isNewScriptNameUnique"
						>Create New Script</button>
						<div
							class="invalid-feedback"
							v-if="!isNewScriptNameUnique"
						>Another script already has that name!</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
`};
