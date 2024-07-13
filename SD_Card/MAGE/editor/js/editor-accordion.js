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
		headerClasses: {
			type: null
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
	<div
		class="
			card-header
			bg-primary
			d-flex
			align-items-center
			px-2
		"
		:class="headerClasses"
		style="
			padding-top: 0.4rem;
			padding-bottom: 0.4rem;
		"
	>
		<span class="mr-auto">
			<slot name="headerLeft"></slot>
			<span class="ml-2">
				<slot name="title">
					<!-- you often want to just pass a title string prop, but allow for more control too -->
					<span v-html="title"></span>
				</slot>
			</span>
		</span>

		<span>
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
 