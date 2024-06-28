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

vueComponents['entity-type-editor'] = {
	name: 'entity-type-editor',
	template: '#template-entity-type-editor',
	setup: function() {
		var scenarioData = Vue.inject('scenarioData');
		var fileNameMap = Vue.inject('fileNameMap');

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
			Vue.set(
				scenarioData.value.entityTypes,
				name,
				{
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
				},
			);
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
				Vue.set(
					currentDirection.value,
					propertyName,
					!currentDirection.value[propertyName]
				);
			}
		};
		var addAnimation = function() {
			var propertyName = possibleNameList.value[
				Object.keys(currentEntityType.value.animations).length
			];
			Vue.set(
				currentEntityType.value.animations,
				propertyName,
				[
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
				]
			)
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
			currentEntityTypeId,
			newEntityTypeId,
			currentAnimationName,
			currentAnimationDirection,
			initJsonState,
			// injected state:
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
	/*
	directions: [
		'↑',
		'→',
		'↓',
		'←',
	],
	*/
};

vueComponents['tiled-tile'] = {
	name: 'tiled-tile',
	template: '#template-tiled-tile',
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
				backgroundImage: `url("${this.image}")`,
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
};
