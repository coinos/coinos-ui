<script>
  import Icon from "$comp/Icon.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import { t } from "$lib/translations";

	const followLinks = [
		{ url: 'https://twitter.com/swapeewallet', titleID: 'twitter' },
		{ url: 'https://t.me/swapeewallet', titleID: 'telegram' },
		{ url: 'https://linktr.ee/swapee.me', titleID: 'linktree' }
	];

  const companyLinks = [
    { url: "/docs", titleID: "documentation" },
    { url: "/support", titleID: "support" },
  ];
</script>
<footer class="pt-16 bg-black">
	<div class="max-w-[1296px] mx-auto px-8">
		<!-- footer_top -->
		<div class="footer_top pb-4">
			<div class="flex-col md:flex-row flex md:items-center justify-between">
				<div class="flex-1 mb-12 sm:mb-5">
					<a href="#" class="footer_logo"><img src="images/footer-logo.png" alt="" /></a>
					<p class="text-gray-200 mt-10">Copyright © 2023. Swapee.me</p>
					<p class="text-gray-200 mt-3">All rights reserved.</p>
					<a href="#" class="btn_language inline-block mt-6 font-bold !text-white hover:!text-black">English</a>
				</div>
				<div
					class="flex-1 footer_top_right flex items-center justify-start md:justify-center "
				>
					<div class="flex max-sm:flex-col md:justify-end gap-x-6">
						<div class="flex-1 xl:mb-0 mb-4 md:pr-0 sm:pr-5">
							<h6 class="!text-white/80 mb-0">Business enquiries</h6>
							<a href="mailto:business@swapee.me">business@swapee.me</a>
						</div>
						<div class="flex-1 xs:pr-5 mb-4 md:pr-0 sm:pr-5">
							<h6 class="!text-white/80 mb-0">Support enquiries</h6>
							<a href="mailto:support@swapee.me">support@swapee.me</a>
						</div>
					</div>
				</div>
			</div>

			<!-- footer_bottom -->
			<div class="footer_bottom pt-4 pb-2">
				<ul class="list-unstyled mb-0 ps-0">
					<li class="pb-3 ">
						<a href="/docs" class="!text-white/80 opacity-100 hover:!text-swapee-purple/100 font-semibold">Documentation</a>
					</li>
					<li class="pb-3">
						<a href="/privacy" class="!text-white/80 opacity-100 hover:!text-swapee-purple/100 font-semibold">Privacy Policy</a>
					</li>
          <li class="pb-3">
						<a href="/support" class="!text-white/80 opacity-100 hover:!text-swapee-purple/100 font-semibold">Support</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</footer>
