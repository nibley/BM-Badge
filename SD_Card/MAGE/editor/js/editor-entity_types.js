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
			return Object.values(entityTypes);
		});
		var currentEntityType = Vue.computed(function () {
			return entityTypes[currentEntityTypeId];
		});
		var tileset = Vue.computed(function () {
			var tilesetFile = fileNameMap[currentEntityType.tileset];
			return tilesetFile
				? tilesetFile.parsed
				: undefined;
		});
		var allTilesets = Vue.computed(function () {
			return scenarioData.parsed.tilesets.slice().sort()
		});
		var currentDirection = Vue.computed(function () {
			var currentAnimation = currentEntityType.animations[currentAnimationName];
			return (
				currentAnimation
				&& (currentAnimationDirection !== -1)
			)
				? currentAnimation[currentAnimationDirection]
				: undefined;
		});
		var currentTileId = Vue.computed(function () {
			return currentDirection
				? currentDirection.tileid
				: undefined;
		});

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
		};
	},
	directions: [
		'↑',
		'→',
		'↓',
		'←',
	],
	methods: {
		addEntityType: function () {
			var name = newEntityTypeId
				.trim()
				.toLocaleLowerCase()
				.replace(/[^a-z0-9]/gm, '_');
			Vue.set(
				scenarioData.entityTypes,
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
			currentEntityTypeId = name;
		},
		clickDirection: function (animationName, directionIndex) {
			currentAnimationName = animationName;
			currentAnimationDirection = directionIndex;
		},
		clickTile: function (tileid) {
			if(currentDirection) {
				currentDirection.tileid = tileid;
			}
		},
		flip: function (animationName, directionIndex, propertyName) {
			currentAnimationName = animationName;
			currentAnimationDirection = directionIndex;
			if(currentDirection) {
				Vue.set(
					currentDirection,
					propertyName,
					!currentDirection[propertyName]
				);
			}
		},
		addAnimation() {
			var propertyName = possibleNameList[
				Object.keys(currentEntityType.animations).length
			];
			Vue.set(
				currentEntityType.animations,
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
		},
		deleteAnimation: function (animationName) {
			var animations = currentEntityType.animations;
			var newValues = {};
			var currentCount = 0;
			Object.entries(animations).forEach(function (pair) {
				var name = pair[0];
				var animation = pair[1];
				if (name !== animationName) {
					newValues[possibleNameList[currentCount]] = animation;
					currentCount += 1;
				}
			});
			currentEntityType.animations = newValues;
		},
	}
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
	data: function () {
		return {
			currentFrame: 0,
		};
	},
	created: function() {
		if(this.animation) {
			this.animate();
		}
	},
	beforeDestroy: function () {
		clearTimeout(this.animationTimeout);
	},
	computed: {
		image: function () {
			return this.tileset.imageFile.blobUrl;
		},
		animation: function () {
			var tileid = this.tileid;
			var currentTile = (this.tileset.tiles || []).find(function (tile) {
				return tile.id === tileid;
			});
			return currentTile && currentTile.animation;
		},
		currentTileId: function () {
			var animation = this.animation;
			var currentFrame = this.currentFrame;
			var tileid = this.tileid;
			return animation
				? animation[currentFrame].tileid
				: tileid;
		},
		outerStyle: function () {
			var tileset = this.tileset;
			var animation = this.animation;
			var border = this.hideBorder
				? undefined
				: `1px solid ${animation ? '#f44' : '#333'}`
			return {
				display: 'inline-block',
				width: tileset.tilewidth + 2 + 'px',
				height: tileset.tileheight + 2 + 'px',
				border: border,
			};
		},
		innerStyle: function () {
			var tileset = this.tileset;
			var tileid = this.currentTileId;
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
		}
	},
	methods: {
		animate: function () {
			var vm = this;
			var frame = this.animation[vm.currentFrame];
			this.animationTimeout = setTimeout(
				function () {
					vm.currentFrame += 1;
					vm.currentFrame %= vm.animation.length;
					vm.animate();
				},
				frame.duration
			);
		},
	},
};
