window.vueApp = Vue.createApp({
	setup: function() {
		const fileNameMap = Vue.reactive({});
		const scenarioData = Vue.reactive({});
		const currentData = Vue.reactive({});
		const initState = Vue.reactive({});
		const warningsGeneratedScriptNames = Vue.reactive({});

		return {
			fileNameMap,
			scenarioData,
			currentData,
			initState,
			warningsGeneratedScriptNames
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
	data: function() {
		return 	{
			uniqueEncodeAttempt: Math.random(),
			isLoading: false,
			error: null,
			downloadData: null,
		};
	},
	methods: {
		closeError: function () {
			this.uniqueEncodeAttempt = Math.random();
			this.error = false;
		},
		closeSuccess: function () {
			this.uniqueEncodeAttempt = Math.random();
			this.downloadData = null;
		},
		prepareDownload: function (data, name) {
			var blob = new Blob(data, { type: 'octet/stream' });
			var url = window.URL.createObjectURL(blob);
			if (this.downloadData) {
				window.URL.revokeObjectURL(this.downloadData.url);
			}
			this.downloadData = {
				href: url,
				target: '_blank',
				download: name
			}
		},
		handleChange: function (event) {
			var vm = this;
			var fileNameMap = {};
			vm.closeError();

			var handleError = function(error) {
				vm.closeSuccess();
				console.error(error);
				vm.error = error.message;
				vm.isLoading = false;
			};

			try {
				var filesArray = Array.prototype.slice.call(event.target.files);
				vm.isLoading = true;

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
						.then(function (scenarioData) {
							vm.fileNameMap = fileNameMap;
							vm.scenarioData = scenarioData;
							/*
							TODO store	
							vm.$store.commit('INIT_CURRENT_DATA');
							*/
							return scenarioData;
						})
						.then(generateIndexAndComposite)
						.then(function (compositeArray) {
							vm.prepareDownload([compositeArray], 'game.dat');
						})
						.catch(function (error) {
							handleError(error);
							throw error;
						})
						.then(function () {
							vm.isLoading = false;
							vm.uniqueEncodeAttempt = Math.random();
						});
				}
			} catch (error) {
				handleError(error);
			}
		}
	}
});

vueApp.mount('#app')

vueApp.component(
	'inputty',
	{
		name: 'inputty',
		template: '#inputty'
	}
);
