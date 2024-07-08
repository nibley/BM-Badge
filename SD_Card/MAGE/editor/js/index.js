window.vueComponents = {};

// TODO make sure alternative to makeFileChangeTrackerMixinByResourceType is working
// TODO try throwing a fatal error. didn't show error text and still saw "loafing" when error was in mount hook of editor-warnings

window.vueApp = Vue.createApp({
	setup: function() {
		var uniqueEncodeAttempt = Vue.ref(Math.random());
		var isLoading = Vue.ref(false);
		var error = Vue.ref(null);
		var downloadData = Vue.ref(null);

		window.fileNameMap = Vue.ref(undefined);
		window.scenarioData = Vue.ref(undefined);
		window.currentData = Vue.ref(undefined);
		window.initState = Vue.ref(undefined);
		window.warningsGeneratedScriptNames = Vue.ref([]);
		window.dialogOptions = Vue.computed(function() {
			return Object.keys(
				(scenarioData.value || {}).dialogs || {}
			);
		});
		window.scriptsOptions = Vue.computed(function() {
			return Object.keys(
				(currentData.value || {}).scripts || {}
			);
		});
		window.mapsOptions = Vue.computed(function() {
			return Object.keys(
				(scenarioData.value || {}).maps || {}
			);
		});
		window.entityTypesOptions = Vue.computed(function() {
			return Object.keys(
				(scenarioData.value || {}).entityTypes || {}
			)
				.sort(sortCaseInsensitive);
		});
		window.entityNamesOptions = Vue.computed(function() {
			return [
				'%SELF%',
				'%PLAYER%',
			]
				.concat(extractNames(scenarioData.value.parsed.entities));
		});
		window.geometryOptions = Vue.computed(function() {
			return [
				'%ENTITY_PATH%'
			]
				.concat(extractNames(scenarioData.value.parsed.geometry));
		});
		window.borderTilesetOptions = Vue.computed(function() {
			return Object.keys(scenarioData.value.dialogSkins);
		});

		var closeError = function () {
			uniqueEncodeAttempt.value = Math.random();
			error.value = false;
		};

		var closeSuccess = function () {
			uniqueEncodeAttempt.value = Math.random();
			downloadData.value = null;
		};

		var prepareDownload = function (data, name) {
			var blob = new Blob(data, { type: 'octet/stream' });
			var url = window.URL.createObjectURL(blob);
			if (downloadData.value) {
				window.URL.revokeObjectURL(downloadData.value.url);
			}
			downloadData.value = {
				href: url,
				target: '_blank',
				download: name
			};
		};

		var handleChange = function (event) {
			var newFileNameMap = {};
			closeError();

			var handleError = function(newError) {
				closeSuccess();
				console.error(newError);
				error.value = newError.message;
				isLoading.value = false;
			};

			try {
				var filesArray = Array.prototype.slice.call(event.target.files);
				isLoading.value = true;

				filesArray.forEach(function (file) {
					if (newFileNameMap[file.name] === undefined) {
						newFileNameMap[file.name] = file;
					} else {
						throw new Error(`Multiple files with name '${file.name}' present in scenario source!`);
					}
				});

				var scenarioFile = newFileNameMap['scenario.json'];
				if (!scenarioFile) {
					throw new Error('No `scenario.json` file detected in folder, nowhere to start!');
				} else {
					getFileJson(scenarioFile)
						.then(handleScenarioData(newFileNameMap))
						.then(function (newScenarioData) {
							fileNameMap.value = newFileNameMap;
							scenarioData.value = newScenarioData;

							/*
							TODO store	
							vm.$store.commit('INIT_CURRENT_DATA');
							*/
							currentData.value = {
								dialogs: jsonClone(newScenarioData.dialogs),
								dialogsFileItemMap: jsonClone(newScenarioData.dialogsFileItemMap),
								scripts: jsonClone(newScenarioData.scripts),
								scriptsFileItemMap: jsonClone(newScenarioData.scriptsFileItemMap),
							};
							initState.value = jsonClone(currentData);

							return scenarioData.value;
						})
						.then(generateIndexAndComposite)
						.then(function (compositeArray) {
							prepareDownload([compositeArray], 'game.dat');
						})
						.catch(function (error) {
							handleError(error);
							throw error;
						})
						.then(function () {
							isLoading.value = false;
							uniqueEncodeAttempt.value = Math.random();
						});
				}
			} catch (error) {
				handleError(error);
			}
		};

		return {
			// component state:
			uniqueEncodeAttempt,
			isLoading,
			error,
			scenarioData,
			currentData,
			downloadData,
			// methods:
			closeError,
			closeSuccess,
			prepareDownload,
			handleChange,
		};
	},
	/*
	TODO mixins
	mixins: [
		makeComputedStoreGetterSettersMixin([
			'scenarioData',
			'fileNameMap',
			'currentData',
		]),
	],*/
});

vueComponents['inputty'] = {
	// TODO remove since unused?
	name: 'inputty',
	template: ``
};
