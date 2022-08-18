<script>
  import { _ } from 'svelte-i18n';

  // this ID will be used to get the strings from the locale
  // question is at faq.[questionID].question
  // answer is at faq.[questionID].answer
  export let questionID;
</script>

<div class="mx-auto w-full md:w-2/3 lg:w-[700px] space-y-5">
	<p class="text-2xl font-medium">{$_('faq.' + questionID + '.question')}</p>
	<p class="text-secondary text-xl font-medium">
		{$_('faq.' + questionID + '.answer')}
	</p>
</div>
