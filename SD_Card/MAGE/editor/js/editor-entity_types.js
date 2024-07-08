var possibleNameList = [
	'idle',
	'walk',
	'action',
	'special',
	'extra_special',
	'really_extra_special',
	'why_do_you_have_this_many_animations',
	'calm_down_animator',
	'or_good_job_animator',
	'whichever',
	'i_guess_im_just_glad',
	'youre_using_the_tools_we_made',
	'carry_on',
];

var directionalArrows = [
	'↑',
	'→',
	'↓',
	'←',
];

vueComponents['entity-type-editor'] = {
	name: 'entity-type-editor',
	setup: function() {
		var scenarioData = window.scenarioData;
		var fileNameMap = window.fileNameMap;
		
		var jsonOutput = Vue.computed(function () {
			return JSON.stringify(
				scenarioData.value.entityTypes,
				null,
				'\t'
			) + '\n';
		});
		var initJsonState = Vue.ref(jsonOutput.value);

		var currentEntityTypeId = Vue.ref('');
		var newEntityTypeId = Vue.ref('');
		var currentAnimationName = Vue.ref('');
		var currentAnimationDirection = Vue.ref(-1);

		var entityTypes = Vue.computed(function () {
			return scenarioData.value.entityTypes;
		});
		var needsSave = Vue.computed(function () {
			return initJsonState.value !== jsonOutput.value;
		});
		var entityTypeList = Vue.computed(function () {
			return Object.values(entityTypes.value);
		});
		var currentEntityType = Vue.computed(function () {
			return entityTypes.value[currentEntityTypeId.value];
		});
		var tileset = Vue.computed(function () {
			var tilesetFile = fileNameMap.value[currentEntityType.value.tileset];
			return tilesetFile
				? tilesetFile.parsed
				: undefined;
		});
		var allTilesets = Vue.computed(function () {
			return scenarioData.value.parsed.tilesets.slice().sort();
		});
		var currentDirection = Vue.computed(function () {
			var currentAnimation = currentEntityType.value.animations[currentAnimationName.value];
			return (
				currentAnimation
				&& (currentAnimationDirection.value !== -1)
			)
				? currentAnimation[currentAnimationDirection.value]
				: undefined;
		});
		var currentTileId = Vue.computed(function () {
			return currentDirection.value
				? currentDirection.value.tileid
				: undefined;
		});

		var addEntityType = function() {
			var name = newEntityTypeId.value
				.trim()
				.toLocaleLowerCase()
				.replace(/[^a-z0-9]/gm, '_');
			scenarioData.value.entityTypes[name] = {
				type: name,
				tileset: '',
				animations: {
					idle: [
						{
							tileid: 0,
							flip_x: false,
							flip_y: false,
						},
						{
							tileid: 0,
							flip_x: false,
							flip_y: false,
						},
						{
							tileid: 0,
							flip_x: false,
							flip_y: false,
						},
						{
							tileid: 0,
							flip_x: false,
							flip_y: false,
						}
					]
				}
			};
			currentEntityTypeId.value = name;
		};
		var clickDirection = function(animationName, directionIndex) {
			currentAnimationName.value = animationName;
			currentAnimationDirection.value = directionIndex;
		};
		var clickTile = function(tileid) {
			if(currentDirection.value) {
				currentDirection.value.tileid = tileid;
			}
		};
		var flip = function(animationName, directionIndex, propertyName) {
			currentAnimationName.value = animationName;
			currentAnimationDirection.value = directionIndex;
			if(currentDirection.value) {
				currentDirection.value[propertyName] = !currentDirection.value[propertyName];
			}
		};
		var addAnimation = function() {
			var propertyName = possibleNameList.value[
				Object.keys(currentEntityType.value.animations).length
			];
			currentEntityType.value.animations[propertyName] = [
				{
					"tileid": 0,
					"flip_x": false
				},
				{
					"tileid": 0,
					"flip_x": false
				},
				{
					"tileid": 0,
					"flip_x": false
				},
				{
					"tileid": 0,
					"flip_x": false
				}
			];
		};
		var deleteAnimation = function(animationName) {
			var animations = currentEntityType.value.animations;
			var newValues = {};
			var currentCount = 0;
			Object.entries(animations).forEach(function(pair) {
				var name = pair[0];
				var animation = pair[1];
				if (name !== animationName) {
					newValues[possibleNameList.value[currentCount]] = animation;
					currentCount += 1;
				}
			});
			currentEntityType.value.animations = newValues;
		};

		return {
			// component state:
			directionalArrows,
			currentEntityTypeId,
			newEntityTypeId,
			currentAnimationName,
			currentAnimationDirection,
			initJsonState,
			// global state:
			scenarioData,
			fileNameMap,
			// computeds:
			entityTypes,
			jsonOutput,
			needsSave,
			entityTypeList,
			currentEntityType,
			tileset,
			allTilesets,
			currentDirection,
			currentTileId,
			// methods:
			addEntityType,
			clickDirection,
			clickTile,
			flip,
			addAnimation,
			deleteAnimation,
		};
	},
	template: /*html*/`
	<div
		class="
			entity-type-editor
			card
			text-white
			mb-3
		"
	>
		<div class="card-header">Entity Type Editor</div>
		<div class="card-body">
			<copy-changes
				v-if="needsSave"
				file-name="entity_types.json"
				:changes="jsonOutput"
				resource-name="entityTypes"
			></copy-changes>
			<div class="form-group">
				<label for="currentEntityTypeId">Entity Types:</label>
				<select
					class="form-control"
					id="currentEntityTypeId"
					v-model="currentEntityTypeId"
				>
					<option
						value=""
					>Select an entityType</option>
					<option
						v-for="entityType in entityTypes"
						:key="entityType.type"
						:value="entityType.type"
					>{{ entityType.type }}</option>
				</select>
			</div>
			<div class="input-group mb-3">
				<input
					type="text"
					class="form-control"
					placeholder="Create new entityType"
					aria-label="Create new entityType"
					aria-describedby="add-entity-type"
					v-model="newEntityTypeId"
					name="newEntityTypeId"
				>
				<div class="input-group-append">
					<button
						class="btn btn-primary"
						type="button"
						id="add-entity-type"
						@click="addEntityType"
					>Create</button>
				</div>
			</div>
			<div
				v-if="currentEntityType"
				:key="currentEntityTypeId"
				class="
					card
					text-white
					bg-secondary
					mb-3
				"
			>
				<div class="card-header">Current EntityType: {{ currentEntityType.type }}</div>
				<div class="card-body">
					<div class="row">
						<div
							v-if="tileset"
							:key="tileset.filename"
							class="animations col-12 col-lg-6"
						>
							<h5>Animations</h5>
							<table
								class="
									text-center
									table-bordered
									table-dark
								"
							>
								<thead>
									<tr>
										<th
											v-for="direction in directionalArrows"
										>{{ direction }}</th>
										<th>❌</th>
									</tr>
								</thead>
								<tbody>
									<template
										v-for="(animation, animationName) in currentEntityType.animations"
										:key="animationName"
									>
										<tr>
											<th colspan="4">{{ animationName }}</th>
											<td>
												<button
													class="badge btn btn-block btn-outline-danger"
													@click="deleteAnimation(animationName)"
												>❌</button>
											</td>
										</tr>
										<tr>
											<td
												v-for="(direction, directionIndex) in animation"
												:key="directionIndex"
											>
												<div>
													<button
														class="tile-link d-inline-flex"
														:class="(
															(currentAnimationName === animationName)
															&& (currentAnimationDirection === directionIndex)
														)
															? 'border-success'
															: 'border-secondary'
														"
														@click="clickDirection(animationName, directionIndex)"
													>
														<tiled-tile
															:key="direction.tileid"
															:tileset="tileset"
															:tileid="direction.tileid"
															:style="{
																transform: 'scale(' + ( direction.flip_x ? '-' : '' ) + '1, ' + ( direction.flip_y ? '-' : '' ) + '1)'
															}"
														></tiled-tile>
													</button>
													<div>
														<button
															class="btn badge"
															:class="direction.flip_x ? 'badge-success' : 'badge-secondary'"
															@click="flip(animationName, directionIndex, 'flip_x')"
															title="Flip X"
														>⬌</button>
														<button
															class="btn badge"
															:class="direction.flip_y ? 'badge-success' : 'badge-secondary'"
															@click="flip(animationName, directionIndex, 'flip_y')"
															title="Flip Y"
														>⬍</button>
													</div>
												</div>
											</td>
										</tr>
									</template>
								</tbody>
							</table>
							<div
								v-if="Object.keys(currentEntityType.animations).length < 13"
								class="pt-3"
							>
								<button
									class="btn btn-block btn-outline-success"
									@click="addAnimation"
								>Add Animation</button>
							</div>
						</div>
						<div class="tileset col-12 col-lg-6">
							<h5>Tileset: {{ currentEntityType.tileset }}</h5>
							<div class="form-group">
								<label for="currentTileset">Tileset:</label>
								<select
									class="form-control"
									id="currentTileset"
									v-model="currentEntityType.tileset"
								>
									<option
										value=""
									>Select a tileset</option>
									<option
										v-for="tileset in allTilesets"
										:key="tileset.filename"
										:value="tileset.filename"
									>{{ tileset.filename }}</option>
								</select>
							</div>
							<table
								v-if="tileset"
								:key="tileset.filename"
								class="table-dark table-bordered"
								style="line-height: 0;"
							>
								<tbody>
								<tr
									v-for="(badY, y) in Math.floor(tileset.tilecount / tileset.columns)"
								>
									<td
										v-for="(badX, x) in tileset.columns"
									>
										<button
											class="tile-link d-inline-flex"
											:class="(currentTileId === ((y * tileset.columns) + x))
												? 'border-success'
												: 'border-secondary'
											"
											@click="clickTile((y * tileset.columns) + x)"
										><tiled-tile
											:tileset="tileset"
											:tileid="(y * tileset.columns) + x"
										></tiled-tile></button>
									</td>
								</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
`};

vueComponents['tiled-tile'] = {
	name: 'tiled-tile',
	props: {
		tileset: {
			type: Object,
			required: true,
		},
		tileid: {
			type: Number,
			required: true,
		},
		hideBorder: {
			type: Boolean,
			default: false,
		}
	},
	setup: function(props) {
		var currentFrame = Vue.ref(0);
		var animationTimeout = Vue.ref(null);

		var image = Vue.computed(function() {
			return props.tileset.imageFile.blobUrl;
		});
		var animation = Vue.computed(function() {
			var tileid = props.tileid;
			var currentTile = (props.tileset.tiles || []).find(function(tile) {
				return tile.id === tileid;
			});
			return currentTile && currentTile.animation;
		});
		var currentTileId = Vue.computed(function() {
			var currentAnimation = animation.value;
			var tileid = props.tileid;
			return currentAnimation
				? currentAnimation[currentFrame.value].tileid
				: tileid;
		});
		var outerStyle = Vue.computed(function() {
			var tileset = props.tileset;
			var border = props.hideBorder
				? undefined
				: `1px solid ${animation.value ? '#f44' : '#333'}`
			return {
				display: 'inline-block',
				width: tileset.tilewidth + 2 + 'px',
				height: tileset.tileheight + 2 + 'px',
				border: border,
			};
		});
		var innerStyle = Vue.computed(function() {
			var tileset = props.tileset;
			var tileid = currentTileId.value;
			var x = tileid % tileset.columns;
			var y = Math.floor(tileid / tileset.columns);
			return {
				display: 'inline-block',
				width: tileset.tilewidth + 'px',
				height: tileset.tileheight + 'px',
				backgroundImage: `url("${image.value}")`,
				backgroundPosition: `${
					-x * tileset.tilewidth
				}px ${
					-y * tileset.tileheight
				}px`,
			};
		});

		var animate = function() {
			var frame = animation.value[currentFrame.value];
			animationTimeout.value = setTimeout(
				function () {
					currentFrame.value += 1;
					currentFrame.value %= animation.value.length;
					animate();
				},
				frame.duration
			);
		};

		if (animation.value) {
			animate();
		}

		Vue.onBeforeUnmount(function() {
			clearTimeout(animationTimeout.value);
		});

		return {
			// component state:
			currentFrame,
			animationTimeout,
			// computeds:
			image,
			animation,
			currentTileId,
			outerStyle,
			innerStyle,
			// methods:
			animate,
		};
	},
	template: /*html*/`
		<span
			class="tiled-tile"
			:style="outerStyle"
			:title="'tileid: ' + tileid"
		>
			<span
				:style="innerStyle"
			></span>
		</span>
`};
