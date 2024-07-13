var componentButtonTextMap = {
	delete: 'X',
	up: '↑',
	down: '↓',
};
var componentButtonclassesObjectMap = {
	delete: 'btn-outline-danger',
};

vueComponents['component-button'] = {
	name: 'component-button',
	props: {
		type: {
			type: String,
		},
		color: {
			type: String,
		},
	},
	setup: function(props) {
		var classesObject = Vue.computed(function() {
			var result = {};
			if(!(props.color)) {
				result[
					componentButtonclassesObjectMap[props.type] || 'btn-outline-light'
				] = true;
			}
			return result;
		});

		var stylesObject = Vue.computed(function() {
			var result = {};
			if (props.color) {
				result['color'] = result['border-color'] = props.color;
			}
			return result;
		});

		var text = Vue.computed(function() {
			return componentButtonTextMap[props.type] || '_';
		});

		return {
			// computeds:
			classesObject,
			stylesObject,
			text,
		};
	},
	template: /*html*/`
<button
	type="button"
	class="btn d-inline-block"
	:class="classesObject"
	:style="stylesObject"
>
	<slot>{{ text }}</slot>
</button>
`};
