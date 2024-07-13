// TODO check why there aren't usually portraits: bug or need special case for %PLAYER%, %SELF%

var dialogAlignmentCoords = {
	BOTTOM_LEFT: {
		text: { x: 0, y: 8, w: 19, h: 6 },
		label: { x: 0, y: 6, w: 7, h: 3 },
		portrait: { x: 0, y: 1, w: 6, h: 6 }
	},
	BOTTOM_RIGHT: {
		text: { x: 0, y: 8, w: 19, h: 6 },
		label: { x: 12, y: 6, w: 7, h: 3 },
		portrait: { x: 13, y: 1, w: 6, h: 6 }
	},
	TOP_LEFT: {
		text: { x: 0, y: 0, w: 19, h: 6 },
		label: { x: 0, y: 5, w: 7, h: 3 },
		portrait: { x: 0, y: 7, w: 6, h: 6 }
	},
	TOP_RIGHT: {
		text: { x: 0, y: 0, w: 19, h: 6 },
		label: { x: 12, y: 5, w: 7, h: 3 },
		portrait: { x: 13, y: 7, w: 6, h: 6 }
	}
};

vueComponents['editor-dialog-phase-preview'] = {
	name: 'editor-dialog-phase-preview',
	props: {
		phase: {
			type: Object,
			required: true
		},
		messageIndex: {
			type: Number,
			required: true
		},
	},
	setup: function(props) {
		var fileNameMap = window.fileNameMap;
		var scenarioData = window.scenarioData;

		var tileset = Vue.computed(function() {
			return scenarioData.value.dialogSkinsTilesetMap[
				props.phase.border_tileset || 'default'
			];
		});
		var alignmentData = Vue.computed(function() {
			var alignment = props.phase.alignment || 'BOTTOM_LEFT';
			return dialogAlignmentCoords[alignment];
		});
		var label = Vue.computed(function() {
			var phase = props.phase;
			var name = phase.name;
			var entity = phase.entity;
			return name || entity;
		});
		var text = Vue.computed(function() {
			var phase = props.phase;
			var messages = phase.messages;
			var result = messages[props.messageIndex];
			if (
				phase.response_type
				&& (props.messageIndex === (messages.length - 1))
			) {
				phase.options.forEach(function (option) {
					result += '\n   ' + option.label;
				});
			}
			return result;
		});
		var portrait = Vue.computed(function() {
			return props.phase.portrait || props.phase.entity
		});
		var textValuesMap = Vue.computed(function() {
			return {
				text: text.value,
				label: label.value,
				portrait: portrait.value,
			}
		});

		return {
			// global state:
			fileNameMap,
			scenarioData,
			// computeds:
			tileset,
			alignmentData,
			label,
			text,
			portrait,
			textValuesMap,
		};
	},
	template: /*html*/`
<div
	class="editor-dialog-phase-preview"
>
	<div
		v-for="(rect, key) in alignmentData"
		:class="key"
		:key="key"
	>
		<editor-dialog-box
			v-if="textValuesMap[key]"
			:rect="rect"
			:dialog-skin="phase.border_tileset"
		></editor-dialog-box>
		<font-image
			v-if="textValuesMap[key]"
			:x="((rect.x + 1) * tileset.tilewidth) + (tileset.tilewidth / 2) + 4"
			:y="((rect.y + 1) * tileset.tileheight) + (tileset.tileheight / 2) + 4"
			:string="textValuesMap[key]"
		></font-image>
	</div>
</div>
`};
