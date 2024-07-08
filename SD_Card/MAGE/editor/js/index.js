window.vueComponents = {};

// TODO make sure alternative to makeFileChangeTrackerMixinByResourceType is working
// TODO try throwing a fatal error. didn't show error text and still saw "loafing" when error was in mount hook of editor-warnings

window.vueApp = Vue.createApp({
	setup: function() {
		var uniqueEncodeAttempt = Vue.ref(Math.random());
		var isLoading = Vue.ref(false);
		var error = Vue.ref(null);
		var downloadData = Vue.ref(null);

		var fileNameMap = Vue.ref(undefined);
		var scenarioData = Vue.ref(undefined);
		var currentData = Vue.ref(undefined);
		var initState = Vue.ref(undefined);
		var warningsGeneratedScriptNames = Vue.ref([]);
		var dialogOptions = Vue.computed(function() {
			return Object.keys(
				(scenarioData.value || {}).dialogs || {}
			);
		});
		var scriptsOptions = Vue.computed(function() {
			return Object.keys(
				(currentData.value || {}).scripts || {}
			);
		});
		var mapsOptions = Vue.computed(function() {
			return Object.keys(
				(scenarioData.value || {}).maps || {}
			);
		});
		var entityTypesOptions = Vue.computed(function() {
			return Object.keys(
				(scenarioData.value || {}).entityTypes || {}
			)
				.sort(sortCaseInsensitive);
		});
		var entityNamesOptions = Vue.computed(function() {
			return [
				'%SELF%',
				'%PLAYER%',
			]
				.concat(extractNames(scenarioData.value.parsed.entities));
		});
		var geometryOptions = Vue.computed(function() {
			return [
				'%ENTITY_PATH%'
			]
				.concat(extractNames(scenarioData.value.parsed.geometry));
		});
		var borderTilesetOptions = Vue.computed(function() {
			return Object.keys(scenarioData.value.dialogSkins);
		});

		Vue.provide('fileNameMap', fileNameMap);
		Vue.provide('scenarioData', scenarioData);
		Vue.provide('currentData', currentData);
		Vue.provide('initState', initState);
		Vue.provide('warningsGeneratedScriptNames', warningsGeneratedScriptNames);

		Vue.provide('dialogOptions', dialogOptions);
		Vue.provide('scriptsOptions', scriptsOptions);
		Vue.provide('mapsOptions', mapsOptions);
		Vue.provide('entityTypesOptions', entityTypesOptions);
		Vue.provide('entityNamesOptions', entityNamesOptions);
		Vue.provide('geometryOptions', geometryOptions);
		Vue.provide('borderTilesetOptions', borderTilesetOptions);

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
			downloadData,
			// provided state:
			fileNameMap,
			scenarioData,
			currentData,
			initState,
			warningsGeneratedScriptNames,
			scriptsOptions,
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
	name: 'inputty',
	template: '#inputty'
};
