<script>
  import { sat } from "$lib/utils";
  import peerData from "$lib/peers.json";
  import nodeData from "$lib/nodes.json";
  import index from "$lib/index.json";

  let { nodes } = nodeData;
  let { peers } = peerData;
  let { nodes: n } = index.pageProps;
  console.log(n);

  let channels = [];
  peers.map((p) =>
    channels.push(
      ...p.channels.map((c) => ({
        ...c,
        pid: p.id,
        peer: nodes.find((n) => n.nodeid === p.id)?.alias || p.id.substr(0, 6),
        balance: (c.total_msat - c.to_us_msat) / c.total_msat,
        ratio: (c.in_fulfilled_msat + c.out_fulfilled_msat) / c.total_msat,
        inbound: c.total_msat - c.to_us_msat,
      }))
    )
  );

  // channels = channels.sort((a, b) => a.receivable_msat - b.receivable_msat);
  // channels = channels.sort((a, b) => (b.in_fulfilled_msat / b.total_msat) - (a.in_fulfilled_msat / a.total_msat));
  $: channels = channels.sort((a, b) => !!dir ? a[sort] - b[sort] : b[sort] - a[sort]);
  let low = channels.filter((c) => c.to_us_msat > 5000000000 && c.ratio < 3);

  let f = (n) => sat(n / 1000);
  let sort = "to_us_msat";
  let dir;
</script>


{low.length}
<div>
  '[{#each low as c} "{c.short_channel_id}/{c.direction}", {/each}]'
</div>

<select bind:value={sort}>
  <option value="inbound">Inbound</option>
  <option value="to_us_msat">Outbound</option>
  <option value="in_fulfilled_msat">In Fulfilled</option>
  <option value="out_fulfilled_msat">Out Fulfilled</option>
  <option value="ratio">Ratio</option>
  <option value="balance">Balance</option>
</select>

<select bind:value={dir}>
  <option value={1}>Up</option>
  <option value={0}>Down</option>
</select>

<div class="flex flex-wrap gap-2">
  {#each channels as c}
    <div class="p-4 border">
      <div>
        {c.peer}
        {c.pid.substr(0, 6)}
        {c.short_channel_id}/{c.direction}
      </div>
      <!-- <div>Receivable {f(c.receivable_msat / 1000)}</div> -->
      <!-- <div>Spendable {f(c.spendable_msat)}</div> -->
      <div>Inbound {f(c.inbound)}</div>
      <div>Outbound {f(c.to_us_msat)}</div>
      <div>Total {f(c.total_msat)}</div>
      <div>In {f(c.in_fulfilled_msat)}</div>
      <div>Out {f(c.out_fulfilled_msat)}</div>
      <div>Ratio {c.ratio.toFixed(2)}</div>
      <div>Balance {c.balance.toFixed(2)}</div>
      <div>Base {c.fee_base_msat}</div>
      <div>PPM {c.fee_proportional_millionths}</div>
      <div>
        Score {n
          .find((node) => node.pubkey === c.pid)
          ?.inboundEfficiency.toFixed(2) || 0}
      </div>
    </div>
  {/each}
</div>
