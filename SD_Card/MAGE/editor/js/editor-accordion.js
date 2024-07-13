// TODO better responsiveness when the card header is cramped

vueComponents['editor-accordion'] = {
	name: 'editor-accordion',
	props: {
		title: {
			type: String,
			default: '',
		},
		collapsedInitial: {
			type: Boolean,
			default: true,
		},
		useVShow: {
			// set to true to always render the main slot content invisibly
			type: Boolean,
			default: false,
		},
	},
	setup: function(props) {
		var collapsed = Vue.ref(props.collapsedInitial);

		var collapse = function() {
			collapsed.value = !(collapsed.value);
		};

		return {
			// component state:
			collapsed,
			// methods:
			collapse,
		};
	},
	template: /*html*/`
<div class="editor-accordion card border-secondary text-white mb-2">
	<div class="card-header bg-primary pr-5">
		<span v-html="title"></span>
		<span
			class="position-absolute"
			style="top: 6px; right: 6px;"
		>
			<button
				type="button"
				class="btn btn-outline-light"
				@click="collapse"
			>_</button>
			<slot name="header"></slot>
		</span>
	</div>

	<template v-if="useVShow || (! collapsed)">
		<div
			class="card-body px-3 pt-3 pb-2"
			v-show="(! collapsed)"
		>
			<slot></slot>
		</div>
	</template>
</div>
`};
 