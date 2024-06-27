window.vueComponents = {};

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
		var warningsGeneratedScriptNames = Vue.ref(undefined);
		Vue.provide('fileNameMap', fileNameMap);
		Vue.provide('scenarioData', scenarioData);
		Vue.provide('currentData', currentData);
		Vue.provide('initState', initState);
		Vue.provide('warningsGeneratedScriptNames', warningsGeneratedScriptNames);

		var closeError = function () {
			uniqueEncodeAttempt = Math.random();
			error = false;
		};

		var closeSuccess = function () {
			uniqueEncodeAttempt = Math.random();
			downloadData = null;
		};

		var prepareDownload = function (data, name) {
			var blob = new Blob(data, { type: 'octet/stream' });
			var url = window.URL.createObjectURL(blob);
			if (downloadData) {
				window.URL.revokeObjectURL(downloadData.url);
			}
			downloadData = {
				href: url,
				target: '_blank',
				download: name
			}
		};

		var handleChange = function (event) {
			var fileNameMap = {};
			closeError();

			var handleError = function(newError) {
				closeSuccess();
				console.error(newError);
				error = newError.message;
				isLoading = false;
			};

			try {
				var filesArray = Array.prototype.slice.call(event.target.files);
				isLoading = true;

				filesArray.forEach(function (file) {
					if (fileNameMap[file.name] === undefined) {
						fileNameMap[file.name] = file;
					} else {
						throw new Error(`Multiple files with name '${file.name}' present in scenario source!`);
					}
				});

				var scenarioFile = fileNameMap['scenario.json'];
				if (!scenarioFile) {
					throw new Error('No `scenario.json` file detected in folder, nowhere to start!');
				} else {
					getFileJson(scenarioFile)
						.then(handleScenarioData(fileNameMap))
						.then(function (newScenarioData) {
							fileNameMap = fileNameMap;
							
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

							// return scenarioData;
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
							isLoading = false;
							uniqueEncodeAttempt = Math.random();
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

vueApp.component(
	'inputty',
	{
		name: 'inputty',
		template: '#inputty'
	}
);
