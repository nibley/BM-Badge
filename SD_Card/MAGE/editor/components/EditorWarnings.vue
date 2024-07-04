<template>
	<div class="editor-warnings card text-white my-3">
		<div class="card-header bg-primary">Additional reports about the build ({{warningsSorted.length}} checks)</div>
		<div class="card-body p-3">
			<!-- "invisible wrapper" use of <template> because of v-for inside (good practice) -->
			<template v-if="warningsSorted.length">
				<editor-accordion
					v-for="[checkName, maps] in warningsSorted"
					:key="checkName"
					:title="'Problems with &grave;' + checkName + '&grave; (' + maps.length  + ' maps)'"
					:use-v-show="true"
				>
					<editor-accordion
						v-for="[mapName, entities] in maps"
						:key="mapName"
						:title="'Problems in map &grave;' + mapName + '&grave; (' + entities.length  + ' entities)'"
						:use-v-show="true"
					>
						<editor-accordion
							:title="'Entity &grave;' + (entity.name || 'NO NAME') + '&grave; (id ' + entity.id + ')'"
							:use-v-show="true"
							:collapsed-initial="false"
							v-for="entity in entities"
							:key="entity.id"
						>
							<!-- TODO pascal case, self-closing tags, etc. preferred if #app was converted to SFC -->
							<!--
							<editor-warnings-single
								:entity="entity"
							></editor-warnings-single>
							-->
							<EditorWarningsSingle
								:entity="entity"
							></EditorWarningsSingle>
						</editor-accordion>
					</editor-accordion>
				</editor-accordion>
			</template >
			<div v-else>
				<!-- TODO reenable, was breaking vue3-sfc-loader testing <img src="../dependencies/MageDance.gif" /> -->
				<span class="mx-1 align-bottom">No problems found. Damg.</span>
			</div>
		</div>
	</div>
</template>

<script setup>
// TODO for SFC style, eliminate use of Vue.something

// import EditorWarningsSingle from './EditorWarningsSingle.vue'

var scenarioData = Vue.inject('scenarioData');

var warningsSorted = Vue.computed(function() {
	// convert warnings data structure to its 2D array equivalent
	// (sorted at each layer, lexically for check names and map names, and by `id` for entities)
	// precomputing this is useful for ordered access and quicker length checks
	var sortByNameInIndexZero = function(a, b) {
		return a[0].localeCompare(b);
	};
	var checksSorted = [];
	Object.entries(scenarioData.value.warnings).forEach(function ([checkName, maps]) {
		var mapsSorted = [];
		Object.entries(maps).forEach(function ([mapName, entities]) {
			entities.sort(function(a, b) {
				return a.id - b.id;
			});
			mapsSorted.push([mapName, entities]);
		});
		mapsSorted.sort(sortByNameInIndexZero);
		checksSorted.push([checkName, mapsSorted]);
	});
	checksSorted.sort(sortByNameInIndexZero);
	return checksSorted;
});
</script>
