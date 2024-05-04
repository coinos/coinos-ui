<script>
  import { sat } from "$lib/utils";
  import peerData from "$lib/peers.json";
  import nodeData from "$lib/nodes.json";
  import index from "$lib/index.json";

  let { nodes } = nodeData;
  let { peers } = peerData;
  let { nodes: n } = index.pageProps;
  console.log(n)

  let channels = [];
  peers.map((p) =>
    channels.push(
      ...p.channels.map((c) => ({
        ...c,
        pid: p.id,
        peer: nodes.find((n) => n.nodeid === p.id)?.alias || p.id.substr(0, 6),
      }))
    )
  );

  // channels = channels.sort((a, b) => a.receivable_msat - b.receivable_msat);
  // channels = channels.sort((a, b) => (b.in_fulfilled_msat / b.total_msat) - (a.in_fulfilled_msat / a.total_msat));
  channels = channels.sort((a, b) => a.total_msat - b.total_msat);
  let low = channels.filter((c) => c.total_msat < 5000000000);

  let f = (n) => sat(n / 1000);
</script>

{low.length}
<div>
  '[{#each channels as c} "{c.short_channel_id}/{c.direction}", {/each}]'
</div>

<div class="flex flex-wrap gap-2">
  {#each channels as c}
    <div class="p-4 border">
      <div>{c.peer} {c.pid.substr(0, 6)}</div>
      <!-- <div>Receivable {f(c.receivable_msat / 1000)}</div> -->
      <!-- <div>Spendable {f(c.spendable_msat)}</div> -->
      <div>To us {f(c.to_us_msat / 1000)}</div>
      <div>Total {f(c.total_msat)}</div>
      <div>In {f(c.in_fulfilled_msat)}</div>
      <div>Out {f(c.out_fulfilled_msat)}</div>
      <div>Base {c.fee_base_msat}</div>
      <div>PPM {c.fee_proportional_millionths}</div>
      <div>
        Score {n.find((node) => node.pubkey === c.pid)?.inboundEfficiency.toFixed(2) || 0}
      </div>
    </div>
  {/each}
</div>
