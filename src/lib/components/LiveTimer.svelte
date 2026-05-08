<script lang="ts">
  let { mulai, selesai, isPacking = false, totalKantong = 0, mode = "default" } = $props();

  // Simple placeholder for LiveTimer
  // Since we use static data, we just render a simple text instead of actual live timer logic for now.
</script>

<span>
  {#if mode === "total"}
    <span class="text-sm font-medium">--:--:--</span>
  {:else}
    <span class="text-sm font-medium">--:--:--</span>
  {/if}
</span>
