var componentButtonTextMap = {
	delete: 'X',
};
var componentButtonoutlineClassMap = {
	delete: 'btn-outline-danger',
};

vueComponents['component-button'] = {
	name: 'component-button',
	props: {
		type: {
			type: String,
			// default: 'light',
		},
		color: {
			type: String,
			// default: null,
		},
	},
	setup: function(props) {
		var outlineClass = Vue.computed(function() {
			if(props.color) {
				return '';
			}
			return componentButtonoutlineClassMap[props.type] || 'btn-outline-light';
		});

		var text = Vue.computed(function() {
			return componentButtonTextMap[props.type] || '_';
		});

		return {
			// computeds:
			outlineClass,
			text,
		};
	},
	template: /*html*/`
<button
	type="button"
	class="btn d-inline-block"
	:class="outlineClass"
>
	<slot>{{ text }}</slot>
</button>
`};
