<template>
    <div class="editor-warnings-single">
        <div class="alert alert-primary" :class="{'mb-0': ! entity.fixes}" role="alert">{{ entity.warningMessage }}</div>
        <div v-if="entity.fixes">
            <div class="mb-3" v-if="Object.keys(fixParameters).length">
                <span>Override certain aspects of the fixes if you need to:</span>
                <div
                    class="input-group my-1"
                    v-for="(parameterValue, parameterName) in fixParameters"
                >
                    <div class="input-group-prepend">
                        <span class="input-group-text">{{parameterName}}</span>
                    </div>
                    <input
                        class="form-control"
                        :class="{ 'is-invalid': scriptNameTaken && (parameterName === 'scriptName') }"
                        type="text"
                        :name="parameterName"
                        v-model.trim="fixParameters[parameterName]"
                    />
                    <div
                        v-if="scriptNameTaken"
                        class="invalid-feedback"
                    >Script name already taken or empty.</div>
                </div>
            </div>
            <div v-if="! scriptNameTaken">
                <span>Click the button by any of these fixes to copy it:</span>
                <div
                    class="my-1"
                    v-for="(thisFixText, thisFixIndex) in fixText"
                    :key="thisFixIndex"
                >
                    <div class="row align-items-center flex-nowrap mx-0">
                        <pre class="border border-primary rounded p-2 m-0 w-100">{{thisFixText}}</pre>
                        <copy-button
                            :text="thisFixText"
                            class="ml-1"
                            style="width: 2rem;"
                        ></copy-button>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
// TODO for SFC style, eliminate use of Vue.something

var scriptsOptions = Vue.inject('scriptsOptions');
var warningsGeneratedScriptNames = Vue.inject('warningsGeneratedScriptNames');

var props = defineProps({
	entity: {
		required: true,
		type: Object,
	},
});

var fixParameters = Vue.ref(props.entity.fixes ? jsonClone(props.entity.fixes.parameters) : {});
var fixText = Vue.ref([]);
var scriptNameTaken = Vue.ref(false);

var reactToFixParameterChanged = function (parameterName, newParameter, oldParameter) {
	// console.group(`XXX param ${parameterName} changed from entity ${props.entity.name} from map ${props.entity.sourceFile}`);

	if (parameterName === 'scriptName') {
		// of all possible keys for fixParameters, `scriptName` gets
		// special treatment (involving $store.state.warningsGeneratedScriptNames)

		// console.log(`XXX trying script ${newParameter}`);

		var takenByWarnings = warningsGeneratedScriptNames.value;
		var takenByScenarioData = scriptsOptions.value;
		var scriptNameCurrentlyTaken =
			(!newParameter)
			|| takenByScenarioData.includes(newParameter)
			|| takenByWarnings.includes(newParameter);

		if (scriptNameCurrentlyTaken) {
			// console.log(`XXX clashing script ${newParameter}`);

			scriptNameTaken.value = true;
		} else {
			// console.log(`XXX reserving script ${newParameter}`);

			scriptNameTaken.value = false;
			/*
			TODO store
			this.$store.commit('RESERVE_WARNING_SCRIPT_NAME', {
				scriptName: newParameter,
			});
			*/
		}

		if (oldParameter) {
			// console.log(`XXX freeing script ${oldParameter}`);

			/*
			TODO store
			this.$store.commit('FREE_WARNING_SCRIPT_NAME', {
				scriptName: oldParameter,
			});
			*/
		} else {
			// console.log('XXX old scriptName was null');
		}
	}

	if (! scriptNameTaken.value) { // save a bit of work if the fix text is going to be hidden
		// console.log('XXX update fixText');

		fixText.value = props.entity.fixes.getFixes(fixParameters.value);
	}

	// console.groupEnd();
};

// TODO major redesign for Vue 3. watchEffect, etc.?
Vue.onMounted(function() {
	Object.keys(fixParameters.value).forEach(function(parameterName) {
		Vue.watch(
			function() {
				// use a function in case parameterName isn't ok to access with a dot
				return fixParameters.value[parameterName];
			},
			function(newParameter, oldParameter) {
				reactToFixParameterChanged(
					parameterName,
					newParameter,
					oldParameter
				);
			},
			{
				immediate: true
			});
	});
});
</script>
